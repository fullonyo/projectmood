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
        // 1. Ler todos os blocos (draft state)
        const blocks = await prisma.moodBlock.findMany({
            where: { userId, deletedAt: null },
            orderBy: { order: 'asc' },
        })

        // 2. Serializar snapshot (strip de campos internos do Prisma)
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

        // 3. Ler configurações visuais atuais do perfil
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

        // 4. Contar versões existentes para gerar label automática
        const versionCount = await prisma.profileVersion.count({
            where: { profileId: profile.id }
        })

        // 5. Transaction atômica: desativa todas → cria nova ativa
        await prisma.$transaction([
            // Desativar todas as versões anteriores
            prisma.profileVersion.updateMany({
                where: { profileId: profile.id, isActive: true },
                data: { isActive: false }
            }),
            // Criar nova versão ativa
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

        // 6. Invalidar cache APENAS da página pública
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

// ─── ROLLBACK ────────────────────────────────────────────────────────────────

export async function rollbackToVersion(versionId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Não autorizado" }

    const username = (session.user as any).username

    try {
        // 1. Validar que a versão pertence ao usuário
        const version = await prisma.profileVersion.findUnique({
            where: { id: versionId },
            include: { profile: true }
        })

        if (!version || version.profile.userId !== session.user.id) {
            return { error: "Versão não encontrada" }
        }

        // 2. Transaction: desativa todas → ativa a escolhida
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

        // 3. Invalidar cache da página pública
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

// ─── VERSION HISTORY ─────────────────────────────────────────────────────────

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

// ─── HELPERS ─────────────────────────────────────────────────────────────────

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

// ─── DRAFT CHANGE DETECTION ─────────────────────────────────────────────────

/**
 * Compara o estado atual (draft) com o último snapshot publicado.
 * Retorna true se existem mudanças não publicadas.
 * 
 * Estratégia: serializa blocos + profileData e compara strings.
 * Simples e determinístico — sem necessidade de hash criptográfico.
 */
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

        // Buscar estado draft atual (excluir id — o snapshot publicado inclui id que não tem na query draft)
        const draftBlocks = await prisma.moodBlock.findMany({
            where: { userId },
            orderBy: { order: 'asc' },
            select: {
                type: true, content: true,
                x: true, y: true, width: true, height: true,
                zIndex: true, rotation: true, order: true,
            }
        })

        // Buscar último snapshot publicado
        const activeVersion = await prisma.profileVersion.findFirst({
            where: { profileId: profile.id, isActive: true },
            select: { blocks: true, profileData: true }
        })

        if (!activeVersion) return true // Nunca publicou → tem mudanças

        // Serializar e comparar de forma determinística
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

        // IMPORTANTE: normalizar blocos publicados para os MESMOS campos do draft
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
