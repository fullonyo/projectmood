"use server"

import prisma from "@/lib/prisma";
import {
    ProfileUpdateSchema,
    CreateMoodBlockSchema,
    UpdateMoodBlockLayoutSchema
} from "@/lib/validations";
import { requireAuth, getUsernameById, revalidateProfile } from "@/lib/action-helpers";

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function updateProfile(data: {
    theme?: string;
    primaryColor?: string;
    backgroundColor?: string;
    fontStyle?: string;
    customCursor?: string;
    mouseTrails?: string;
    backgroundEffect?: string;
    avatarUrl?: string;
}) {
    try {
        const session = await requireAuth();

        const validation = ProfileUpdateSchema.safeParse(data);
        if (!validation.success) {
            return { error: "Dados inválidos: " + validation.error.issues[0].message };
        }

        const username = await getUsernameById(session.user.id);

        await prisma.profile.update({
            where: { userId: session.user.id },
            data: validation.data,
        });

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        if (error.name === "ActionError") return { error: error.message };
        console.error('[updateProfile]', error);
        return { error: "Erro ao atualizar perfil" };
    }
}

// ─── Blocks CRUD ──────────────────────────────────────────────────────────────

export async function addMoodBlock(type: string, content: any, options: { x?: number, y?: number, width?: number, height?: number } = {}) {
    try {
        const session = await requireAuth();

        // Feature flag check
        const flagKey = `block_${type}`;
        const flag = await prisma.featureFlag.findUnique({ where: { key: flagKey } });

        if (flag && !flag.isEnabled) {
            return { error: `O bloco "${flag.name || type}" está temporariamente desativado pelo administrador.` };
        }

        if (flag && flag.isPremium && (session.user as any)?.role !== 'ADMIN') {
            return { error: `O bloco "${flag.name || type}" é exclusivo para usuários VIP.` };
        }

        const validation = CreateMoodBlockSchema.safeParse({ type, content, options });
        if (!validation.success) {
            return { error: "Dados inválidos: " + validation.error.issues[0].message };
        }

        const { x = 50, y = 50, width, height } = validation.data.options || {};
        const username = await getUsernameById(session.user.id);

        const block = await prisma.moodBlock.create({
            data: {
                userId: session.user.id,
                type: validation.data.type,
                content: validation.data.content as any,
                x: x,
                y: y,
                width: width ? Math.round(width) : null,
                height: height ? Math.round(height) : null,
            },
        });

        revalidateProfile(username);
        return { success: true, block };
    } catch (error: any) {
        if (error.name === "ActionError") return { error: error.message };
        console.error('[addMoodBlock]', error);
        return { error: "Erro ao adicionar bloco" };
    }
}

export async function addMoodBlocksBulk(blocks: { type: string, content: any, options: { x: number, y: number, width?: number, height?: number } }[]) {
    try {
        const session = await requireAuth();
        const username = await getUsernameById(session.user.id);

        if (!blocks.length) return { success: true };

        await prisma.$transaction(
            blocks.map(b => prisma.moodBlock.create({
                data: {
                    userId: session.user.id,
                    type: b.type,
                    content: b.content as any,
                    x: b.options.x,
                    y: b.options.y,
                    width: b.options.width ? Math.round(b.options.width) : null,
                    height: b.options.height ? Math.round(b.options.height) : null,
                }
            }))
        );

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        if (error.name === "ActionError") return { error: error.message };
        console.error('[addMoodBlocksBulk]', error);
        return { error: "Erro ao colar blocos" };
    }
}

export async function updateMoodBlockLayout(blockId: string, data: { x?: number, y?: number, width?: number, height?: number, zIndex?: number, rotation?: number, isLocked?: boolean, isHidden?: boolean, content?: any }) {
    try {
        const session = await requireAuth();

        const validation = UpdateMoodBlockLayoutSchema.safeParse(data);
        if (!validation.success) {
            return { error: "Dados inválidos: " + validation.error.issues[0].message };
        }

        const validatedData: any = { ...validation.data };
        if (typeof validatedData.x === 'number') validatedData.x = Math.max(0, Math.min(100, validatedData.x));
        if (typeof validatedData.y === 'number') validatedData.y = Math.max(0, Math.min(100, validatedData.y));
        if (typeof validatedData.width === 'number') validatedData.width = Math.round(Math.max(40, Math.min(2000, validatedData.width)));
        if (typeof validatedData.height === 'number') validatedData.height = Math.round(Math.max(40, Math.min(2000, validatedData.height)));

        const username = await getUsernameById(session.user.id);

        await prisma.moodBlock.update({
            where: { id: blockId, userId: session.user.id },
            data: validatedData,
        });

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        if (error.name === "ActionError") return { error: error.message };
        console.error('[updateMoodBlockLayout]', error);
        return { error: `Erro ao salvar alterações: ${error.message || 'Erro interno'}` };
    }
}

export async function deleteMoodBlock(blockId: string) {
    try {
        const session = await requireAuth();
        const username = await getUsernameById(session.user.id);

        await prisma.moodBlock.update({
            where: { id: blockId, userId: session.user.id },
            data: { deletedAt: new Date() }
        });

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        if (error.name === "ActionError") return { error: error.message };
        console.error('[deleteMoodBlock]', error);
        return { error: "Erro ao excluir bloco" };
    }
}

export async function restoreMoodBlock(blockId: string) {
    try {
        const session = await requireAuth();
        const username = await getUsernameById(session.user.id);

        await prisma.moodBlock.update({
            where: { id: blockId, userId: session.user.id },
            data: { deletedAt: null }
        });

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        if (error.name === "ActionError") return { error: error.message };
        console.error('[restoreMoodBlock]', error);
        return { error: "Erro ao restaurar bloco" };
    }
}

export async function duplicateMoodBlock(blockId: string) {
    try {
        const session = await requireAuth();

        const source = await prisma.moodBlock.findUnique({
            where: { id: blockId, userId: session.user.id }
        });

        if (!source) return { error: "Bloco não encontrado" };

        const { id, createdAt, updatedAt, deletedAt, ...rest } = source;
        const username = await getUsernameById(session.user.id);

        const newBlock = await prisma.moodBlock.create({
            data: {
                ...rest,
                content: rest.content as any,
                userId: session.user.id,
                x: Math.min(95, source.x + 2),
                y: Math.min(95, source.y + 2),
            }
        });

        revalidateProfile(username);
        return { success: true, block: newBlock };
    } catch (error: any) {
        if (error.name === "ActionError") return { error: error.message };
        console.error('[duplicateMoodBlock]', error);
        return { error: "Erro ao duplicar bloco" };
    }
}

// ─── Bulk Operations ──────────────────────────────────────────────────────────

export async function clearMoodBlocks() {
    try {
        const session = await requireAuth();
        const username = await getUsernameById(session.user.id);

        await prisma.moodBlock.updateMany({
            where: { userId: session.user.id, deletedAt: null },
            data: { deletedAt: new Date() }
        });

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        if (error.name === "ActionError") return { error: error.message };
        console.error('[clearMoodBlocks]', error);
        return { error: "Erro ao limpar mural" };
    }
}

export async function reorderMoodBlocks(blocks: { id: string, order: number }[]) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const username = await getUsernameById(userId);

        await prisma.$transaction(
            blocks.map((block) =>
                prisma.moodBlock.update({
                    where: { id: block.id, userId, deletedAt: null },
                    data: { order: block.order }
                })
            )
        );

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        if (error.name === "ActionError") return { error: error.message };
        console.error('[reorderMoodBlocks]', error);
        return { error: "Erro ao reordenar blocos" };
    }
}

export async function updateMoodBlocksZIndex(updates: { id: string, zIndex: number }[]) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const username = await getUsernameById(userId);

        await prisma.$transaction(
            updates.map((update) =>
                prisma.moodBlock.update({
                    where: { id: update.id, userId, deletedAt: null },
                    data: { zIndex: update.zIndex }
                })
            )
        );

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        if (error.name === "ActionError") return { error: error.message };
        console.error('[updateMoodBlocksZIndex]', error);
        return { error: "Erro ao atualizar camadas" };
    }
}
