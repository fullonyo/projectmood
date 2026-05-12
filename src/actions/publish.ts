"use server"

import { Prisma } from "@prisma/client"
import { MoodBlock, RoomVersion, RoomVisualConfig, Room } from "@/types/database"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { requireAuth, getUsernameById, revalidateProfile } from "@/lib/action-helpers"

/**
 * Sistema de Publicação — Multiverso de Espaços
 * 
 * Cada publicação cria uma RoomVersion imutável vinculada a um Espaço (Room).
 */

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Helper interno para capturar o estado atual e salvar como uma versão de uma Sala.
 */
async function createVersionSnapshot(tx: Prisma.TransactionClient, userId: string, roomId: string, label?: string) {
    const currentBlocks = await tx.moodBlock.findMany({ 
        where: { roomId, deletedAt: null } 
    })
    const currentRoom = await tx.room.findUnique({ 
        where: { id: roomId } 
    })

    if (!currentRoom) throw new Error("Espaço não encontrado para snapshot")

    const profileData: RoomVisualConfig = {
        theme: currentRoom.theme,
        uiTheme: currentRoom.uiTheme,
        backgroundColor: currentRoom.backgroundColor,
        primaryColor: currentRoom.primaryColor,
        fontStyle: currentRoom.fontStyle,
        customCursor: currentRoom.customCursor,
        mouseTrails: currentRoom.mouseTrails,
        backgroundEffect: currentRoom.backgroundEffect,
        customFont: currentRoom.customFont,
        staticTexture: currentRoom.staticTexture,
        avatarUrl: currentRoom.avatarUrl,
        title: currentRoom.title
    }

    return await tx.roomVersion.create({
        data: {
            roomId,
            label: label || null,
            blocks: currentBlocks as unknown as Prisma.InputJsonValue,
            profileData: profileData as unknown as Prisma.InputJsonValue,
            isActive: false
        }
    })
}

// ─── ACTIONS ─────────────────────────────────────────────────────────────────

export async function publishRoom(roomId: string, label?: string) {
    try {
        const session = await requireAuth()
        const userId = session.user.id
        const username = await getUsernameById(userId)

        const room = await prisma.room.findUnique({
            where: { id: roomId, userId }
        })

        if (!room) return { error: "Espaço não encontrado ou sem permissão" }

        await prisma.$transaction(async (tx) => {
            // 1. Criar o Snapshot usando o helper
            const newVersion = await createVersionSnapshot(tx, userId, room.id, label)

            // 2. Marcar como Ativa e desativar as outras DAQUELA SALA
            await tx.roomVersion.updateMany({
                where: { roomId: room.id, isActive: true },
                data: { isActive: false }
            })

            await tx.roomVersion.update({
                where: { id: newVersion.id },
                data: { isActive: true }
            })
        })

        // Revalidar perfil (se for a sala primária) ou o link da sala
        revalidateProfile(username, username ? [`/@${username.toLowerCase()}`] : [])
        if (room.slug) {
            revalidateProfile(username, [`/@${username?.toLowerCase()}/${room.slug}`])
        }

        return { success: true }
    } catch (error) {
        console.error('[publishRoom]', error)
        return { error: "Erro ao publicar espaço" }
    }
}

// Retrocompatibilidade para o editor atual (enquanto não temos o switcher)
export async function publishProfile(label?: string) {
    const session = await requireAuth()
    const primaryRoom = await prisma.room.findFirst({
        where: { userId: session.user.id, isPrimary: true }
    })
    if (!primaryRoom) return { error: "Sala primária não encontrada" }
    return publishRoom(primaryRoom.id, label)
}

// ─── RESTORE & ROLLBACK ──────────────────────────────────────────────────────

export async function restoreRoomToDraft(versionId: string) {
    try {
        const session = await requireAuth()
        const userId = session.user.id

        const version = await prisma.roomVersion.findUnique({
            where: { id: versionId },
            include: { room: true }
        })

        if (!version || version.room.userId !== userId) {
            return { error: "Versão não encontrada" }
        }

        await prisma.$transaction(async (tx) => {
            // 0. Backup Automático de Segurança
            await createVersionSnapshot(tx, userId, version.roomId, "Backup Automático")

            // 1. Restaurar metadados da Sala (Editor/Draft)
            if (version.profileData) {
                const pd = version.profileData as unknown as RoomVisualConfig
                await tx.room.update({
                    where: { id: version.roomId },
                    data: {
                        theme: pd.theme,
                        uiTheme: (pd.uiTheme ?? undefined) as string | undefined,
                        backgroundColor: (pd.backgroundColor ?? undefined) as string | undefined,
                        primaryColor: (pd.primaryColor ?? undefined) as string | undefined,
                        fontStyle: (pd.fontStyle ?? undefined) as string | undefined,
                        customCursor: (pd.customCursor ?? undefined) as string | undefined,
                        mouseTrails: (pd.mouseTrails ?? undefined) as string | undefined,
                        backgroundEffect: (pd.backgroundEffect ?? undefined) as string | undefined,
                        customFont: (pd.customFont ?? undefined) as string | undefined,
                        staticTexture: (pd.staticTexture ?? undefined) as string | undefined,
                        avatarUrl: (pd.avatarUrl ?? undefined) as string | undefined,
                        title: pd.title || version.room.title
                    }
                })
            }

            // 2. Restaurar Blocos
            const snapshotBlocks = version.blocks as unknown as MoodBlock[]
            if (snapshotBlocks) {
                const snapshotIds = snapshotBlocks.map(b => b.id).filter(Boolean)

                await tx.moodBlock.deleteMany({
                    where: { roomId: version.roomId, id: { notIn: snapshotIds } }
                })

                for (const b of snapshotBlocks) {
                    await tx.moodBlock.upsert({
                        where: { id: b.id },
                        update: {
                            type: b.type,
                            content: b.content as Prisma.InputJsonValue,
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
                            roomId: version.roomId,
                            type: b.type,
                            content: b.content as Prisma.InputJsonValue,
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

        const username = await getUsernameById(userId)
        revalidateProfile(username)

        return { success: true }
    } catch (error) {
        console.error('[restoreRoomToDraft]', error)
        return { error: "Erro ao restaurar rascunho" }
    }
}

// Alias para manter compatibilidade com a UI atual
export async function restoreToDraft(versionId: string) {
    return restoreRoomToDraft(versionId)
}

export async function makeVersionActive(versionId: string) {
    try {
        const session = await requireAuth()
        const userId = session.user.id
        const username = await getUsernameById(userId)

        const version = await prisma.roomVersion.findUnique({
            where: { id: versionId },
            include: { room: true }
        })

        if (!version || version.room.userId !== userId) {
            return { error: "Versão não encontrada" }
        }

        await prisma.$transaction([
            prisma.roomVersion.updateMany({
                where: { roomId: version.roomId, isActive: true },
                data: { isActive: false }
            }),
            prisma.roomVersion.update({
                where: { id: versionId },
                data: { isActive: true }
            })
        ])

        revalidateProfile(username, username ? [`/${username}`] : [])
        if (version.room.slug) {
            revalidateProfile(username, [`/s/${version.room.slug}`])
        }

        return { success: true }
    } catch (error) {
        console.error('[makeVersionActive]', error)
        return { error: "Erro ao ativar versão" }
    }
}

export async function rollbackToVersion(versionId: string) {
    try {
        const resDraft = await restoreRoomToDraft(versionId)
        if (resDraft.error) return resDraft

        const resActive = await makeVersionActive(versionId)
        if (resActive.error) return resActive

        const session = await requireAuth()
        const username = await getUsernameById(session.user.id)
        revalidateProfile(username)

        return { success: true }
    } catch (error) {
        console.error('[rollbackToVersion]', error)
        return { error: "Erro ao realizar rollback completo" }
    }
}

export async function deleteVersion(versionId: string) {
    try {
        const session = await requireAuth()
        const userId = session.user.id

        const version = await prisma.roomVersion.findUnique({
            where: { id: versionId },
            include: { room: true }
        })

        if (!version || version.room.userId !== userId) {
            return { error: "Versão não encontrada" }
        }

        if (version.isActive) {
            return { error: "Não é possível excluir a versão ativa" }
        }

        await prisma.roomVersion.delete({
            where: { id: versionId }
        })

        return { success: true }
    } catch (error) {
        console.error('[deleteVersion]', error)
        return { error: "Erro ao excluir versão" }
    }
}

export async function getVersionHistory(page: number = 1, pageSize: number = 10, roomId?: string) {
    try {
        const session = await requireAuth()
        const skip = (page - 1) * pageSize

        let targetRoomId = roomId
        if (!targetRoomId) {
            const primaryRoom = await prisma.room.findFirst({
                where: { userId: session.user.id, isPrimary: true },
                select: { id: true }
            })
            targetRoomId = primaryRoom?.id
        }

        if (!targetRoomId) return { error: "Espaço não encontrado", versions: [], hasMore: false }

        const [versions, totalCount] = await Promise.all([
            prisma.roomVersion.findMany({
                where: { roomId: targetRoomId },
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
            prisma.roomVersion.count({
                where: { roomId: targetRoomId }
            })
        ])

        const hasMore = skip + versions.length < totalCount

        return { versions, hasMore }
    } catch (error) {
        console.error('[getVersionHistory]', error)
        return { error: "Erro ao buscar histórico", versions: [], hasMore: false }
    }
}

export async function getVersionDetails(versionId: string) {
    try {
        const session = await requireAuth()

        const version = await prisma.roomVersion.findUnique({
            where: { id: versionId },
            select: {
                id: true,
                blocks: true,
                profileData: true,
                room: {
                    select: { userId: true }
                }
            }
        })

        if (!version || version.room.userId !== session.user.id) {
            return { error: "Versão não encontrada" }
        }

        return { 
            blocks: version.blocks as unknown as MoodBlock[], 
            profile: version.profileData as unknown as RoomVisualConfig 
        }
    } catch (error) {
        console.error('[getVersionDetails]', error)
        return { error: "Erro ao carregar detalhes da versão" }
    }
}

export async function getActiveVersion(roomId?: string) {
    try {
        const session = await requireAuth()
        let targetRoomId = roomId
        if (!targetRoomId) {
            const primaryRoom = await prisma.room.findFirst({
                where: { userId: session.user.id, isPrimary: true },
                select: { id: true }
            })
            targetRoomId = primaryRoom?.id
        }

        if (!targetRoomId) return null

        return prisma.roomVersion.findFirst({
            where: { roomId: targetRoomId, isActive: true },
            select: { id: true, label: true, createdAt: true }
        })
    } catch {
        return null
    }
}

export async function computeHasUnpublishedChanges(
    existingRoom?: Partial<Room>,
    existingDraftBlocks?: Partial<MoodBlock>[],
    roomId?: string
) {
    const session = await auth()
    if (!session?.user?.id) return false

    const userId = session.user.id

    try {
        const room = existingRoom || await prisma.room.findFirst({
            where: roomId ? { id: roomId, userId } : { userId, isPrimary: true },
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

        if (!room) return false

        const draftBlocks = existingDraftBlocks || await prisma.moodBlock.findMany({
            where: { roomId: room.id, deletedAt: null },
            orderBy: { order: 'asc' },
            select: {
                type: true, content: true,
                x: true, y: true, width: true, height: true,
                zIndex: true, rotation: true, order: true,
            }
        })

        const activeVersion = await prisma.roomVersion.findFirst({
            where: { roomId: room.id, isActive: true },
            select: { blocks: true, profileData: true }
        })

        if (!activeVersion) return draftBlocks.length > 0

        const sortKeys = (obj: unknown): unknown => {
            if (obj === null || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(sortKeys);
            const record = obj as Record<string, unknown>;
            return Object.keys(record).sort().reduce((acc: Record<string, unknown>, key) => {
                acc[key] = sortKeys(record[key]);
                return acc;
            }, {});
        };

        const draftRoomDataStr = JSON.stringify(sortKeys({
            theme: room.theme,
            backgroundColor: room.backgroundColor,
            primaryColor: room.primaryColor,
            fontStyle: room.fontStyle,
            customCursor: room.customCursor,
            mouseTrails: room.mouseTrails,
            backgroundEffect: room.backgroundEffect,
            customFont: room.customFont,
            staticTexture: room.staticTexture,
            avatarUrl: room.avatarUrl,
        }));

        const publishedRoomDataStr = JSON.stringify(sortKeys(activeVersion.profileData));
        
        const normalizedDraftBlocks = draftBlocks.map((b) => ({
            type: b.type, content: b.content,
            x: b.x, y: b.y, width: b.width, height: b.height,
            zIndex: b.zIndex, rotation: b.rotation, order: b.order,
        }));
        const draftBlocksStr = JSON.stringify(sortKeys(normalizedDraftBlocks));

        const publishedBlocks = (activeVersion.blocks as unknown as MoodBlock[])?.map((b) => ({
            type: b.type, content: b.content,
            x: b.x, y: b.y, width: b.width, height: b.height,
            zIndex: b.zIndex, rotation: b.rotation, order: b.order,
        })) ?? [];
        const publishedBlocksStr = JSON.stringify(sortKeys(publishedBlocks));

        return draftRoomDataStr !== publishedRoomDataStr || draftBlocksStr !== publishedBlocksStr;
    } catch (error) {
        console.error('[computeHasUnpublishedChanges]', error)
        return false
    }
}
