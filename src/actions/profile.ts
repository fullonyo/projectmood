"use server"

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
    ProfileUpdateSchema,
    CreateMoodBlockSchema,
    UpdateMoodBlockLayoutSchema
} from "@/lib/validations";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

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
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    // Validação de entrada
    const validation = ProfileUpdateSchema.safeParse(data);
    if (!validation.success) {
        return { error: "Dados inválidos: " + validation.error.issues[0].message };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true }
        });

        await prisma.profile.update({
            where: { userId: session.user.id },
            data: validation.data,
        });

        if (user?.username) {
            revalidateTag(CACHE_TAGS.profile(user.username), 'default');
        }
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error('[updateProfile]', error);
        return { error: "Erro ao atualizar perfil" };
    }
}

export async function addMoodBlock(type: string, content: any, options: { x?: number, y?: number, width?: number, height?: number } = {}) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    // Validar Feature Flags do sistema (Kill-Switch)
    try {
        const flagKey = `block_${type}`;
        const flag = await prisma.featureFlag.findUnique({ where: { key: flagKey } });

        if (flag && !flag.isEnabled) {
            return { error: `O bloco "${flag.name || type}" está temporariamente desativado pelo administrador.` };
        }

        if (flag && flag.isPremium && (session.user as any)?.role !== 'ADMIN') {
            // Futura checagem VIP (por hora, bloqueia não-admins se for premium)
            return { error: `O bloco "${flag.name || type}" é exclusivo para usuários VIP.` };
        }
    } catch (e) {
        console.warn("[addMoodBlock] Feature flag check failed, proceeding anyway", e);
    }

    // Validação de entrada
    const validation = CreateMoodBlockSchema.safeParse({ type, content, options });
    if (!validation.success) {
        return { error: "Dados inválidos: " + validation.error.issues[0].message };
    }

    const { x = 50, y = 50, width, height } = validation.data.options || {};

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true }
        });

        const block = await prisma.moodBlock.create({
            data: {
                userId: session.user.id,
                type: validation.data.type,
                content: validation.data.content,
                x: x,
                y: y,
                width: width ? Math.round(width) : null,
                height: height ? Math.round(height) : null,
            },
        });

        if (user?.username) {
            revalidateTag(CACHE_TAGS.profile(user.username), 'default');
        }
        revalidatePath("/dashboard");
        return { success: true, block };
    } catch (error) {
        console.error('[addMoodBlock]', error);
        return { error: "Erro ao adicionar bloco" };
    }
}

export async function updateMoodBlockLayout(blockId: string, data: { x?: number, y?: number, width?: number, height?: number, zIndex?: number, rotation?: number, isLocked?: boolean, isHidden?: boolean, content?: any }) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    // Validação de entrada
    const validation = UpdateMoodBlockLayoutSchema.safeParse(data);
    if (!validation.success) {
        return { error: "Dados inválidos: " + validation.error.issues[0].message };
    }

    // Validation & Rounding for Prisma Int
    const validatedData: any = { ...validation.data };
    if (typeof validatedData.x === 'number') validatedData.x = Math.max(0, Math.min(100, validatedData.x));
    if (typeof validatedData.y === 'number') validatedData.y = Math.max(0, Math.min(100, validatedData.y));
    if (typeof validatedData.width === 'number') validatedData.width = Math.round(Math.max(40, Math.min(2000, validatedData.width)));
    if (typeof validatedData.height === 'number') validatedData.height = Math.round(Math.max(40, Math.min(2000, validatedData.height)));

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true }
        });

        await prisma.moodBlock.update({
            where: { id: blockId, userId: session.user.id },
            data: validatedData,
        });

        if (user?.username) {
            revalidateTag(CACHE_TAGS.profile(user.username), 'default');
        }
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error('[updateMoodBlockLayout]', error);
        return { error: "Erro ao salvar posição" };
    }
}

export async function deleteMoodBlock(blockId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true }
        });

        await prisma.moodBlock.update({
            where: { id: blockId, userId: session.user.id },
            data: { deletedAt: new Date() }
        });

        if (user?.username) {
            revalidateTag(CACHE_TAGS.profile(user.username), 'default');
        }
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error('[deleteMoodBlock]', error);
        return { error: "Erro ao excluir bloco" };
    }
}

export async function restoreMoodBlock(blockId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true }
        });

        await prisma.moodBlock.update({
            where: { id: blockId, userId: session.user.id },
            data: { deletedAt: null }
        });

        if (user?.username) {
            revalidateTag(CACHE_TAGS.profile(user.username), 'default');
        }
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error('[restoreMoodBlock]', error);
        return { error: "Erro ao restaurar bloco" };
    }
}

export async function duplicateMoodBlock(blockId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    try {
        const source = await prisma.moodBlock.findUnique({
            where: { id: blockId, userId: session.user.id }
        });

        if (!source) return { error: "Bloco não encontrado" };

        const { id, createdAt, updatedAt, deletedAt, ...rest } = source;

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true }
        });

        const newBlock = await prisma.moodBlock.create({
            data: {
                ...rest,
                content: rest.content as any,
                userId: session.user.id,
                x: Math.min(95, source.x + 2),
                y: Math.min(95, source.y + 2),
            }
        });

        if (user?.username) {
            revalidateTag(CACHE_TAGS.profile(user.username), 'default');
        }
        revalidatePath("/dashboard");
        return { success: true, block: newBlock };
    } catch (error) {
        console.error('[duplicateMoodBlock]', error);
        return { error: "Erro ao duplicar bloco" };
    }
}


export async function clearMoodBlocks() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true }
        });

        await prisma.moodBlock.updateMany({
            where: { userId: session.user.id, deletedAt: null },
            data: { deletedAt: new Date() }
        });

        if (user?.username) {
            revalidateTag(CACHE_TAGS.profile(user.username), 'default');
        }
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error('[clearMoodBlocks]', error);
        return { error: "Erro ao limpar mural" };
    }
}

export async function reorderMoodBlocks(blocks: { id: string, order: number }[]) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    const userId = session.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true }
        });

        await prisma.$transaction(
            blocks.map((block) =>
                prisma.moodBlock.update({
                    where: { id: block.id, userId, deletedAt: null },
                    data: { order: block.order }
                })
            )
        );

        if (user?.username) {
            revalidateTag(CACHE_TAGS.profile(user.username), 'default');
        }
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error('[reorderMoodBlocks]', error);
        return { error: "Erro ao reordenar blocos" };
    }
}

export async function updateMoodBlocksZIndex(updates: { id: string, zIndex: number }[]) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    const userId = session.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true }
        });

        await prisma.$transaction(
            updates.map((update) =>
                prisma.moodBlock.update({
                    where: { id: update.id, userId, deletedAt: null },
                    data: { zIndex: update.zIndex }
                })
            )
        );

        if (user?.username) {
            revalidateTag(CACHE_TAGS.profile(user.username), 'default');
        }
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error('[updateMoodBlocksZIndex]', error);
        return { error: "Erro ao atualizar camadas" };
    }
}
