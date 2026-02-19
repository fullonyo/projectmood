"use server"

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import {
    ProfileUpdateSchema,
    CreateMoodBlockSchema,
    UpdateMoodBlockLayoutSchema
} from "@/lib/validations";

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
        await prisma.profile.update({
            where: { userId: session.user.id },
            data: validation.data,
        });
        const username = (session.user as any).username;
        revalidatePath("/dashboard");
        if (username) {
            revalidatePath(`/${username}`);
            // @ts-ignore
            revalidateTag(`profile:${username}`);
        }
        return { success: true };
    } catch (error) {
        console.error('[updateProfile]', error);
        return { error: "Erro ao atualizar perfil" };
    }
}

export async function addMoodBlock(type: string, content: any, options: { x?: number, y?: number, width?: number, height?: number } = {}) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    // Validação de entrada
    const validation = CreateMoodBlockSchema.safeParse({ type, content, options });
    if (!validation.success) {
        return { error: "Dados inválidos: " + validation.error.issues[0].message };
    }

    const { x = 50, y = 50, width, height } = validation.data.options || {};

    try {
        const block = await (prisma.moodBlock as any).create({
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

        const username = (session.user as any).username;
        revalidatePath("/dashboard");
        if (username) {
            revalidatePath(`/${username}`);
            // @ts-ignore
            revalidateTag(`profile:${username}`);
        }
        return { success: true, block };
    } catch (error) {
        console.error('[addMoodBlock]', error);
        return { error: "Erro ao adicionar bloco" };
    }
}

export async function updateMoodBlockLayout(blockId: string, data: { x?: number, y?: number, width?: number, height?: number, zIndex?: number, rotation?: number, content?: any }) {
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

    try {
        await prisma.moodBlock.update({
            where: { id: blockId, userId: session.user.id },
            data: validatedData,
        });

        const username = (session.user as any).username;
        revalidatePath("/dashboard");
        if (username) {
            revalidatePath(`/${username}`);
            // @ts-ignore
            revalidateTag(`profile:${username}`);
        }

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
        await prisma.moodBlock.delete({
            where: { id: blockId, userId: session.user.id },
        });
        const username = (session.user as any).username;
        revalidatePath("/dashboard");
        if (username) {
            revalidatePath(`/${username}`);
            // @ts-ignore
            revalidateTag(`profile:${username}`);
        }
        return { success: true };
    } catch (error) {
        console.error('[deleteMoodBlock]', error);
        return { error: "Erro ao excluir bloco" };
    }
}

export async function clearMoodBlocks() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    try {
        await prisma.moodBlock.deleteMany({
            where: { userId: session.user.id }
        });

        const username = (session.user as any).username;
        revalidatePath("/dashboard");
        if (username) {
            revalidatePath(`/${username}`);
            // @ts-ignore
            revalidateTag(`profile:${username}`);
        }

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
        await prisma.$transaction(
            blocks.map((block) =>
                prisma.moodBlock.update({
                    where: { id: block.id, userId },
                    data: { order: block.order }
                })
            )
        );
        const username = (session.user as any).username;
        revalidatePath("/dashboard");
        if (username) {
            revalidatePath(`/${username}`);
            // @ts-ignore
            revalidateTag(`profile:${username}`);
        }
        return { success: true };
    } catch (error) {
        console.error('[reorderMoodBlocks]', error);
        return { error: "Erro ao reordenar blocos" };
    }
}
