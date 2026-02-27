"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import { CACHE_TAGS } from "@/lib/cache-tags"

/**
 * Sistema de Publicação — Vercel Deployments Pattern
 * 
 * Cada publicação cria uma ProfileVersion imutável.
 * Apenas uma versão pode estar ativa por perfil (enforced via transaction).
 * A página pública lê exclusivamente da versão ativa.
 */

// ─── PUBLISH ─────────────────────────────────────────────────────────────────

export async function publishProfile() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Não autorizado" }

    const userId = session.user.id
    const username = (session.user as any).username

    try {
        const blocks = await prisma.moodBlock.findMany({
            where: { userId, deletedAt: null },
            orderBy: { order: 'asc' },
        })
        const snapshot = blocks.map((b: any) => ({
            id: b.id,
            type: b.type,
            content: b.content,
            x: b.x,
            y: b.y,
            width: b.width,
            height: b.height,
            zIndex: b.zIndex,
            rotation: b.rotation,
            order: b.order
        }))

        const profile = await prisma.profile.findUnique({
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
                avatarUrl: true
            }
        })

        if (!profile) return { error: "Perfil não encontrado" }

        const versionCount = await prisma.profileVersion.count({
            where: { profileId: profile.id }
        })
        await prisma.$transaction([
            prisma.profileVersion.updateMany({
                where: { profileId: profile.id, isActive: true },
                data: { isActive: false }
            }),
            prisma.profileVersion.create({
                data: {
                    profileId: profile.id,
                    blocks: snapshot as any,
                    profileData: {
                        theme: profile.theme,
                        backgroundColor: profile.backgroundColor,
                        primaryColor: profile.primaryColor,
                        fontStyle: profile.fontStyle,
                        customCursor: profile.customCursor,
                        mouseTrails: profile.mouseTrails,
                        backgroundEffect: profile.backgroundEffect,
                        customFont: profile.customFont,
                        staticTexture: profile.staticTexture,
                        avatarUrl: profile.avatarUrl
                    },
                    isActive: true,
                    label: `v${versionCount + 1}`
                }
            })
        ])

        if (username) {
            revalidateTag(CACHE_TAGS.profile(username), 'default')
            revalidatePath(`/${username}`)
        }

        return { success: true, version: versionCount + 1 }
    } catch (error) {
        console.error('[publishProfile]', error)
        return { error: "Erro ao publicar diorama" }
    }
}

export async function rollbackToVersion(versionId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Não autorizado" }

    const username = (session.user as any).username

    try {
        const version = await prisma.profileVersion.findUnique({
            where: { id: versionId },
            include: { profile: true }
        })

        if (!version || version.profile.userId !== session.user.id) {
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

        if (username) {
            revalidateTag(CACHE_TAGS.profile(username), 'default')
            revalidatePath(`/${username}`)
        }

        return { success: true }
    } catch (error) {
        console.error('[rollbackToVersion]', error)
        return { error: "Erro ao reverter versão" }
    }
}

export async function getVersionHistory(limit: number = 10) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Não autorizado", versions: [] }

    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        })

        if (!profile) return { error: "Perfil não encontrado", versions: [] }

        const versions = await prisma.profileVersion.findMany({
            where: { profileId: profile.id },
            select: {
                id: true,
                label: true,
                isActive: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        return { versions }
    } catch (error) {
        console.error('[getVersionHistory]', error)
        return { error: "Erro ao buscar histórico", versions: [] }
    }
}

export async function getActiveVersion() {
    const session = await auth()
    if (!session?.user?.id) return null

    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
    })

    if (!profile) return null

    return prisma.profileVersion.findFirst({
        where: { profileId: profile.id, isActive: true },
        select: { id: true, label: true, createdAt: true }
    })
}

export async function computeHasUnpublishedChanges() {
    const session = await auth()
    if (!session?.user?.id) return false

    const userId = session.user.id

    try {
        const profile = await prisma.profile.findUnique({
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

        const draftBlocks = await prisma.moodBlock.findMany({
            where: { userId },
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

        if (!activeVersion) return true

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
        const draftBlocksStr = JSON.stringify(sortKeys(draftBlocks));

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
