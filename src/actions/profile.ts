"use server"

import prisma from "@/lib/prisma";
import {
    ProfileUpdateSchema,
    CreateMoodBlockSchema,
    UpdateMoodBlockLayoutSchema,
    UsernameSchema
} from "@/lib/validations";
import { requireAuth, getUsernameById, revalidateProfile } from "@/lib/action-helpers";

export async function updateProfile(data: {
    name?: string;
    username?: string;
    theme?: string;
    primaryColor?: string;
    backgroundColor?: string;
    fontStyle?: string;
    customCursor?: string;
    mouseTrails?: string;
    backgroundEffect?: string;
    staticTexture?: string;
    avatarUrl?: string;
}) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;

        const currentUsername = await getUsernameById(userId);

        // Se houver tentativa de mudar o username, validamos
        if (data.username) {
            const normalizedUsername = data.username.toLowerCase().trim();
            
            // Se o username for o mesmo que o atual (apenas mudança de case ou sem mudança), permitimos
            if (normalizedUsername === currentUsername?.toLowerCase()) {
                data.username = normalizedUsername;
            } else {
                const usernameValidation = UsernameSchema.safeParse(normalizedUsername);
                if (!usernameValidation.success) {
                    return { error: usernameValidation.error.issues[0].message };
                }

                // Verifica se o username já existe (excluindo o próprio usuário por ID e ignorando deletados)
                const existing = await prisma.user.findFirst({
                    where: { 
                        username: { equals: normalizedUsername, mode: 'insensitive' },
                        NOT: { id: userId },
                        deletedAt: null // Importante: Ignorar usuários deletados
                    },
                    select: { id: true }
                });

                if (existing) {
                    return { error: "Este nome de usuário já está em uso por outra conta." };
                }
                
                data.username = normalizedUsername;
            }
        }

        const validation = ProfileUpdateSchema.safeParse(data);
        if (!validation.success) {
            return { error: "Dados inválidos: " + validation.error.issues[0].message };
        }

        // Atualização em transação para garantir consistência entre User e Profile
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    name: data.name,
                    username: data.username,
                }
            }),
            prisma.profile.update({
                where: { userId },
                data: {
                    theme: data.theme,
                    primaryColor: data.primaryColor,
                    backgroundColor: data.backgroundColor,
                    fontStyle: data.fontStyle,
                    customCursor: data.customCursor,
                    mouseTrails: data.mouseTrails,
                    backgroundEffect: data.backgroundEffect,
                    staticTexture: data.staticTexture,
                    avatarUrl: data.avatarUrl,
                },
            })
        ]);

        // Revalida ambos os caminhos (antigo e novo) se houve troca
        revalidateProfile(currentUsername);
        if (data.username && data.username !== currentUsername) {
            revalidateProfile(data.username);
        }

        return { success: true };
    } catch (error: any) {
        if (error.name === "ActionError") return { error: error.message };
        console.error('[updateProfile]', error);
        return { error: "Erro ao atualizar perfil" };
    }
}

export async function addMoodBlock(type: string, content: any, options: { x?: number, y?: number, width?: number, height?: number } = {}) {
    try {
        const session = await requireAuth();

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
