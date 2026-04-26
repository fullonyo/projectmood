"use server"

import prisma from "@/lib/prisma";
import {
    ProfileUpdateSchema,
    CreateMoodBlockSchema,
    UpdateMoodBlockLayoutSchema,
    UsernameSchema
} from "@/lib/validations";
import { requireAuth, getUsernameById, revalidateProfile } from "@/lib/action-helpers";
import { randomBytes } from "crypto";


// ─── ROOM / PROFILE MANAGEMENT ──────────────────────────────────────────────

export async function updateProfile(data: {
    name?: string;
    username?: string;
    title?: string;
    theme?: string;
    primaryColor?: string;
    backgroundColor?: string;
    fontStyle?: string;
    customCursor?: string;
    mouseTrails?: string;
    backgroundEffect?: string;
    staticTexture?: string;
    avatarUrl?: string;
    slug?: string;
}, roomId?: string) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const currentUsername = await getUsernameById(userId);

        // Se houver tentativa de mudar o username, validamos na tabela User
        if (data.username) {
            const normalizedUsername = data.username.toLowerCase().trim();
            if (normalizedUsername !== currentUsername?.toLowerCase()) {
                const usernameValidation = UsernameSchema.safeParse(normalizedUsername);
                if (!usernameValidation.success) return { error: usernameValidation.error.issues[0].message };

                const existing = await prisma.user.findFirst({
                    where: { username: { equals: normalizedUsername, mode: 'insensitive' }, NOT: { id: userId }, deletedAt: null },
                    select: { id: true }
                });
                if (existing) return { error: "Este nome de usuário já está em uso." };
                data.username = normalizedUsername;
            }
        }

        // Validar Slug (se fornecido para salas secundárias)
        if (data.slug) {
            const normalizedSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
            if (normalizedSlug.length < 3) return { error: "Slug muito curto (mínimo 3 caracteres)" };
            
            const existingSlug = await prisma.room.findFirst({
                where: { slug: normalizedSlug, NOT: { id: roomId } }
            });
            if (existingSlug) return { error: "Este endereço (slug) já está em uso em outro espaço." };
            data.slug = normalizedSlug;
        }

        const validation = ProfileUpdateSchema.safeParse(data);
        if (!validation.success) return { error: "Dados inválidos: " + validation.error.issues[0].message };

        // Localizar a sala alvo (se não enviada, assume a primária)
        const targetRoom = await prisma.room.findFirst({
            where: roomId ? { id: roomId, userId } : { userId, isPrimary: true }
        });

        if (!targetRoom) return { error: "Espaço não encontrado" };

        await prisma.$transaction(async (tx) => {
            // 1. Atualizar o Usuário (se necessário)
            if (data.name || data.username) {
                await tx.user.update({
                    where: { id: userId },
                    data: { name: data.name, username: data.username }
                });
            }

            // 2. Atualizar a Sala
            await tx.room.update({
                where: { id: targetRoom.id },
                data: {
                    title: data.title,
                    theme: data.theme,
                    primaryColor: data.primaryColor,
                    backgroundColor: data.backgroundColor,
                    fontStyle: data.fontStyle,
                    customCursor: data.customCursor,
                    mouseTrails: data.mouseTrails,
                    backgroundEffect: data.backgroundEffect,
                    staticTexture: data.staticTexture,
                    avatarUrl: data.avatarUrl,
                    slug: data.slug
                },
            });
        });

        revalidateProfile(currentUsername);
        if (data.username && data.username !== currentUsername) revalidateProfile(data.username);

        return { success: true };
    } catch (error: any) {
        console.error('[updateProfile]', error);
        return { error: "Erro ao atualizar perfil" };
    }
}

export async function createRoom(data: { title: string, type: 'PERMANENT' | 'TEMPORARY', expiresAt?: Date, maxViews?: number }) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const username = await getUsernameById(userId);

        const slug = randomBytes(5).toString('hex');

        const room = await prisma.room.create({
            data: {
                userId,
                title: data.title,
                type: data.type,
                expiresAt: data.expiresAt,
                maxViews: data.maxViews,
                slug,
                isPrimary: false,
                theme: 'light'
            }
        });

        // Inicializar com uma versão vazia
        await prisma.roomVersion.create({
            data: {
                roomId: room.id,
                blocks: [],
                profileData: {
                    theme: room.theme,
                    title: room.title,
                } as any,
                isActive: true,
                label: 'v1'
            }
        });

        revalidateProfile(username);
        return { success: true, room };
    } catch (error: any) {
        console.error('[createRoom]', error);
        return { error: "Erro ao criar novo espaço" };
    }
}

export async function deleteRoom(roomId: string) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const username = await getUsernameById(userId);

        const room = await prisma.room.findUnique({
            where: { id: roomId, userId }
        });

        if (!room) return { error: "Espaço não encontrado" };
        if (room.isPrimary) return { error: "A sala primária não pode ser deletada" };

        await prisma.room.delete({
            where: { id: roomId }
        });

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        console.error('[deleteRoom]', error);
        return { error: "Erro ao deletar espaço" };
    }
}


// ─── BLOCK MANAGEMENT ────────────────────────────────────────────────────────

export async function addMoodBlock(type: string, content: any, options: { x?: number, y?: number, width?: number, height?: number, roomId?: string } = {}) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;

        // Validar Feature Flag
        const flag = await prisma.featureFlag.findUnique({ where: { key: `block_${type}` } });
        if (flag && !flag.isEnabled) return { error: `Bloco desativado.` };

        const validation = CreateMoodBlockSchema.safeParse({ type, content, options });
        if (!validation.success) return { error: "Dados inválidos" };

        // Localizar Sala Alvo (Obrigatório para evitar vazamento entre dimensões)
        const targetRoom = await prisma.room.findFirst({
            where: options.roomId ? { id: options.roomId, userId } : { userId, isPrimary: true }
        });
        if (!targetRoom) return { error: "Espaço de destino não encontrado" };

        const { x = 50, y = 50, width, height } = validation.data.options || {};
        const username = await getUsernameById(userId);

        const block = await prisma.moodBlock.create({
            data: {
                roomId: targetRoom.id,
                type: validation.data.type,
                content: validation.data.content as any,
                x, y,
                width: width ? Math.round(width) : null,
                height: height ? Math.round(height) : null,
            },
        });

        revalidateProfile(username);
        return { success: true, block };
    } catch (error: any) {
        console.error('[addMoodBlock]', error);
        return { error: "Erro ao adicionar bloco" };
    }
}

export async function addMoodBlocksBulk(blocks: { type: string, content: any, options: { x: number, y: number, width?: number, height?: number, roomId?: string } }[]) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const username = await getUsernameById(userId);

        if (!blocks.length) return { success: true };

        // Para bulk, vamos assumir que todos vão para a mesma sala (ou para a primária se não especificado)
        const firstRoomId = blocks[0].options.roomId;
        const targetRoom = await prisma.room.findFirst({
            where: firstRoomId ? { id: firstRoomId, userId } : { userId, isPrimary: true }
        });
        if (!targetRoom) return { error: "Espaço não encontrado" };

        await prisma.$transaction(
            blocks.map(b => prisma.moodBlock.create({
                data: {
                    roomId: targetRoom.id,
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
        console.error('[addMoodBlocksBulk]', error);
        return { error: "Erro ao colar blocos" };
    }
}

export async function updateMoodBlockLayout(blockId: string, data: { x?: number, y?: number, width?: number, height?: number, zIndex?: number, rotation?: number, isLocked?: boolean, isHidden?: boolean, content?: any }) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;

        const validation = UpdateMoodBlockLayoutSchema.safeParse(data);
        if (!validation.success) return { error: "Dados inválidos" };

        const validatedData: any = { ...validation.data };
        if (typeof validatedData.x === 'number') validatedData.x = Math.max(0, Math.min(100, validatedData.x));
        if (typeof validatedData.y === 'number') validatedData.y = Math.max(0, Math.min(100, validatedData.y));

        const username = await getUsernameById(userId);

        await prisma.moodBlock.update({
            where: { 
                id: blockId, 
                room: { userId } // Garante que o usuário é dono da sala onde está o bloco
            },
            data: validatedData,
        });

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        console.error('[updateMoodBlockLayout]', error);
        return { error: "Erro ao salvar alterações" };
    }
}

export async function deleteMoodBlock(blockId: string) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const username = await getUsernameById(userId);

        await prisma.moodBlock.update({
            where: { id: blockId, room: { userId } },
            data: { deletedAt: new Date() }
        });

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        console.error('[deleteMoodBlock]', error);
        return { error: "Erro ao excluir bloco" };
    }
}

export async function restoreMoodBlock(blockId: string) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const username = await getUsernameById(userId);

        await prisma.moodBlock.update({
            where: { id: blockId, room: { userId } },
            data: { deletedAt: null }
        });

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        console.error('[restoreMoodBlock]', error);
        return { error: "Erro ao restaurar bloco" };
    }
}

export async function duplicateMoodBlock(blockId: string) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;

        const source = await prisma.moodBlock.findUnique({
            where: { id: blockId, room: { userId } }
        });

        if (!source) return { error: "Bloco não encontrado" };

        const { id, createdAt, updatedAt, deletedAt, ...rest } = source;
        const username = await getUsernameById(userId);

        const newBlock = await prisma.moodBlock.create({
            data: {
                ...rest,
                content: rest.content as any,
                roomId: (source as any).roomId, // Garante que fica na mesma sala
                x: Math.min(95, source.x + 2),
                y: Math.min(95, source.y + 2),
            }
        });

        revalidateProfile(username);
        return { success: true, block: newBlock };
    } catch (error: any) {
        console.error('[duplicateMoodBlock]', error);
        return { error: "Erro ao duplicar bloco" };
    }
}

export async function clearMoodBlocks(roomId?: string) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const username = await getUsernameById(userId);

        const targetRoom = await prisma.room.findFirst({
            where: roomId ? { id: roomId, userId } : { userId, isPrimary: true }
        });
        if (!targetRoom) return { error: "Espaço não encontrado ou sem permissão" };

        await prisma.moodBlock.updateMany({
            where: { roomId: targetRoom.id, deletedAt: null },
            data: { deletedAt: new Date() }
        });

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
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
                    where: { id: block.id, room: { userId }, deletedAt: null },
                    data: { order: block.order }
                })
            )
        );

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
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
                    where: { id: update.id, room: { userId }, deletedAt: null },
                    data: { zIndex: update.zIndex }
                })
            )
        );

        revalidateProfile(username);
        return { success: true };
    } catch (error: any) {
        console.error('[updateMoodBlocksZIndex]', error);
        return { error: "Erro ao atualizar camadas" };
    }
}
