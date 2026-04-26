"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { requireAuth, getUsernameById, revalidateProfile } from "@/lib/action-helpers"

/**
 * Sistema de Publicação — Vercel Deployments Pattern
 * 
 * Cada publicação cria uma ProfileVersion imutável.
 * Apenas uma versão pode estar ativa por perfil (enforced via transaction).
 * A página pública lê exclusivamente da versão ativa.
 */

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Helper interno para capturar o estado atual e salvar como uma versão.
 * Usado tanto no Publish quanto no Auto-Backup de restauração.
 */
async function createVersionSnapshot(tx: any, userId: string, profileId: string, label?: string) {
    const currentBlocks = await tx.moodBlock.findMany({ 
        where: { userId, deletedAt: null } 
    })
    const currentProfile = await tx.profile.findUnique({ 
        where: { id: profileId } 
    })

    if (!currentProfile) throw new Error("Perfil não encontrado para snapshot")

    return await tx.profileVersion.create({
        data: {
            profileId,
            label: label || null,
            blocks: currentBlocks as any,
            profileData: {
                theme: currentProfile.theme,
                backgroundColor: currentProfile.backgroundColor,
                primaryColor: currentProfile.primaryColor,
                fontStyle: currentProfile.fontStyle,
                customCursor: currentProfile.customCursor,
                mouseTrails: currentProfile.mouseTrails,
                backgroundEffect: currentProfile.backgroundEffect,
                customFont: currentProfile.customFont,
                staticTexture: currentProfile.staticTexture,
                avatarUrl: currentProfile.avatarUrl
            } as any,
            isActive: false
        }
    })
}

// ─── ACTIONS ─────────────────────────────────────────────────────────────────

export async function publishProfile(label?: string) {
    try {
        const session = await requireAuth()
        const userId = session.user.id
        const username = await getUsernameById(userId)

        const profile = await prisma.profile.findUnique({
            where: { userId }
        })

        if (!profile) return { error: "Perfil não encontrado" }

        await prisma.$transaction(async (tx) => {
            // 1. Criar o Snapshot usando o helper
            const newVersion = await createVersionSnapshot(tx, userId, profile.id, label)

            // 2. Marcar como Ativa e desativar as outras
            await tx.profileVersion.updateMany({
                where: { profileId: profile.id, isActive: true },
                data: { isActive: false }
            })

            await tx.profileVersion.update({
                where: { id: newVersion.id },
                data: { isActive: true }
            })
        })

        revalidateProfile(username, username ? [`/${username}`] : [])
        return { success: true }
    } catch (error: any) {
        console.error('[publishProfile]', error)
        return { error: "Erro ao publicar" }
    }
}

// ─── RESTORE & ROLLBACK ──────────────────────────────────────────────────────

export async function restoreToDraft(versionId: string) {
    try {
        const session = await requireAuth()
        const userId = session.user.id

        const version = await prisma.profileVersion.findUnique({
            where: { id: versionId },
            include: { profile: true }
        })

        if (!version || version.profile.userId !== userId) {
            return { error: "Versão não encontrada" }
        }

        await prisma.$transaction(async (tx) => {
            // 0. Backup Automático de Segurança usando o helper
            await createVersionSnapshot(tx, userId, version.profileId, "Backup Automático")

            // 1. Restaurar metadados do Perfil (Editor/Draft)
            if (version.profileData) {
                const pd = version.profileData as any
                await tx.profile.update({
                    where: { id: version.profileId },
                    data: {
                        theme: pd.theme,
                        backgroundColor: pd.backgroundColor,
                        primaryColor: pd.primaryColor,
                        fontStyle: pd.fontStyle,
                        customCursor: pd.customCursor,
                        mouseTrails: pd.mouseTrails,
                        backgroundEffect: pd.backgroundEffect,
                        customFont: pd.customFont,
                        staticTexture: pd.staticTexture,
                        avatarUrl: pd.avatarUrl
                    }
                })
            }

            // 2. Restaurar Blocos (Editor/Draft)
            const snapshotBlocks = version.blocks as any[]
            if (snapshotBlocks) {
                const snapshotIds = snapshotBlocks.map(b => b.id).filter(Boolean)

                await tx.moodBlock.deleteMany({
                    where: { userId, id: { notIn: snapshotIds } }
                })

                for (const b of snapshotBlocks) {
                    await tx.moodBlock.upsert({
                        where: { id: b.id },
                        update: {
                            type: b.type,
                            content: b.content,
                            x: b.x,
                            y: b.y,
                            width: b.width,
                            height: b.height,
                            zIndex: b.zIndex,
                            rotation: b.rotation,
                            order: b.order,
                            isLocked: b.isLocked,
                            isHidden: b.isHidden,
                            groupId: b.groupId,
                            deletedAt: null 
                        },
                        create: {
                            id: b.id,
                            userId,
                            type: b.type,
                            content: b.content,
                            x: b.x,
                            y: b.y,
                            width: b.width,
                            height: b.height,
                            zIndex: b.zIndex,
                            rotation: b.rotation,
                            order: b.order,
                            isLocked: b.isLocked,
                            isHidden: b.isHidden,
                            groupId: b.groupId
                        }
                    })
                }
            }
        }, { timeout: 15000 })

        return { success: true }
    } catch (error: any) {
        console.error('[restoreToDraft]', error)
        return { error: "Erro ao restaurar rascunho" }
    }
}

export async function makeVersionActive(versionId: string) {
    try {
        const session = await requireAuth()
        const userId = session.user.id
        const username = await getUsernameById(userId)

        const version = await prisma.profileVersion.findUnique({
            where: { id: versionId },
            include: { profile: true }
        })

        if (!version || version.profile.userId !== userId) {
            return { error: "Versão não encontrada" }
        }

        await prisma.$transaction([
            prisma.profileVersion.updateMany({
                where: { profileId: version.profileId, isActive: true },
                data: { isActive: false }
            }),
            prisma.profileVersion.update({
                where: { id: versionId },
                data: { isActive: true }
            })
        ])

        revalidateProfile(username, username ? [`/${username}`] : [])
        return { success: true }
    } catch (error: any) {
        console.error('[makeVersionActive]', error)
        return { error: "Erro ao ativar versão" }
    }
}

export async function rollbackToVersion(versionId: string) {
    try {
        const resDraft = await restoreToDraft(versionId)
        if (resDraft.error) return resDraft

        const resActive = await makeVersionActive(versionId)
        if (resActive.error) return resActive

        return { success: true }
    } catch (error: any) {
        console.error('[rollbackToVersion]', error)
        return { error: "Erro ao realizar rollback completo" }
    }
}

export async function deleteVersion(versionId: string) {
    try {
        const session = await requireAuth()
        const userId = session.user.id

        const version = await prisma.profileVersion.findUnique({
            where: { id: versionId },
            include: { profile: true }
        })

        if (!version || version.profile.userId !== userId) {
            return { error: "Versão não encontrada" }
        }

        if (version.isActive) {
            return { error: "Não é possível excluir a versão ativa" }
        }

        await prisma.profileVersion.delete({
            where: { id: versionId }
        })

        return { success: true }
    } catch (error: any) {
        console.error('[deleteVersion]', error)
        return { error: "Erro ao excluir versão" }
    }
}

export async function getVersionHistory(page: number = 1, pageSize: number = 10) {
    try {
        const session = await requireAuth()
        const skip = (page - 1) * pageSize

        const profile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        })

        if (!profile) return { error: "Perfil não encontrado", versions: [], hasMore: false }

        const [versions, totalCount] = await Promise.all([
            prisma.profileVersion.findMany({
                where: { profileId: profile.id },
                select: {
                    id: true,
                    label: true,
                    isActive: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                skip: skip,
                take: pageSize
            }),
            prisma.profileVersion.count({
                where: { profileId: profile.id }
            })
        ])

        const hasMore = skip + versions.length < totalCount

        return { versions, hasMore }
    } catch (error: any) {
        console.error('[getVersionHistory]', error)
        return { error: "Erro ao buscar histórico", versions: [], hasMore: false }
    }
}

export async function getVersionDetails(versionId: string) {
    try {
        const session = await requireAuth()

        const version = await prisma.profileVersion.findUnique({
            where: { id: versionId },
            select: {
                id: true,
                blocks: true,
                profileData: true,
                profile: {
                    select: { userId: true }
                }
            }
        })

        if (!version || version.profile.userId !== session.user.id) {
            return { error: "Versão não encontrada" }
        }

        return { 
            blocks: version.blocks as any[], 
            profile: version.profileData as any 
        }
    } catch (error: any) {
        console.error('[getVersionDetails]', error)
        return { error: "Erro ao carregar detalhes da versão" }
    }
}

export async function getActiveVersion() {
    try {
        const session = await requireAuth()

        const profile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        })

        if (!profile) return null

        return prisma.profileVersion.findFirst({
            where: { profileId: profile.id, isActive: true },
            select: { id: true, label: true, createdAt: true }
        })
    } catch {
        return null
    }
}

export async function computeHasUnpublishedChanges(
    existingProfile?: any,
    existingDraftBlocks?: any[]
) {
    const session = await auth()
    if (!session?.user?.id) return false

    const userId = session.user.id

    try {
        const profile = existingProfile || await prisma.profile.findUnique({
            where: { userId },
            select: {
                id: true,
                theme: true,
                backgroundColor: true,
                primaryColor: true,
                fontStyle: true,
                customCursor: true,
                mouseTrails: true,
                backgroundEffect: true,
                customFont: true,
                staticTexture: true,
                avatarUrl: true,
            }
        })

        if (!profile) return false

        const draftBlocks = existingDraftBlocks || await prisma.moodBlock.findMany({
            where: { userId, deletedAt: null },
            orderBy: { order: 'asc' },
            select: {
                type: true, content: true,
                x: true, y: true, width: true, height: true,
                zIndex: true, rotation: true, order: true,
            }
        })

        const activeVersion = await prisma.profileVersion.findFirst({
            where: { profileId: profile.id, isActive: true },
            select: { blocks: true, profileData: true }
        })

        if (!activeVersion) return draftBlocks.length > 0

        const sortKeys = (obj: any): any => {
            if (obj === null || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(sortKeys);
            return Object.keys(obj).sort().reduce((acc: any, key) => {
                acc[key] = sortKeys(obj[key]);
                return acc;
            }, {});
        };

        const draftProfileDataStr = JSON.stringify(sortKeys({
            theme: profile.theme,
            backgroundColor: profile.backgroundColor,
            primaryColor: profile.primaryColor,
            fontStyle: profile.fontStyle,
            customCursor: profile.customCursor,
            mouseTrails: profile.mouseTrails,
            backgroundEffect: profile.backgroundEffect,
            customFont: profile.customFont,
            staticTexture: profile.staticTexture,
            avatarUrl: profile.avatarUrl,
        }));

        const publishedProfileDataStr = JSON.stringify(sortKeys(activeVersion.profileData));
        
        const normalizedDraftBlocks = draftBlocks.map((b: any) => ({
            type: b.type, content: b.content,
            x: b.x, y: b.y, width: b.width, height: b.height,
            zIndex: b.zIndex, rotation: b.rotation, order: b.order,
        }));
        const draftBlocksStr = JSON.stringify(sortKeys(normalizedDraftBlocks));

        const publishedBlocks = (activeVersion.blocks as any[])?.map((b: any) => ({
            type: b.type, content: b.content,
            x: b.x, y: b.y, width: b.width, height: b.height,
            zIndex: b.zIndex, rotation: b.rotation, order: b.order,
        })) ?? [];
        const publishedBlocksStr = JSON.stringify(sortKeys(publishedBlocks));

        return draftProfileDataStr !== publishedProfileDataStr || draftBlocksStr !== publishedBlocksStr;
    } catch (error) {
        console.error('[computeHasUnpublishedChanges]', error)
        return false
    }
}
