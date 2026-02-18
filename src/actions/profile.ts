"use server"

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
    theme?: string;
    primaryColor?: string;
    backgroundColor?: string;
    fontStyle?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    try {
        await prisma.profile.update({
            where: { userId: session.user.id },
            data,
        });
        const username = (session.user as any).username;
        revalidatePath("/dashboard");
        if (username) revalidatePath(`/${username}`);
        return { success: true };
    } catch (error) {
        return { error: "Erro ao atualizar perfil" };
    }
}

export async function addMoodBlock(type: string, content: any, initialPos = { x: 50, y: 50 }) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    try {
        const block = await prisma.moodBlock.create({
            data: {
                userId: session.user.id,
                type,
                content,
                x: Math.round(initialPos.x),
                y: Math.round(initialPos.y),
            },
        });

        const username = (session.user as any).username;
        revalidatePath("/dashboard");
        if (username) revalidatePath(`/${username}`);
        return { success: true, block };
    } catch (error) {
        return { error: "Erro ao adicionar bloco" };
    }
}

export async function updateMoodBlockLayout(blockId: string, data: { x?: number, y?: number, width?: number, height?: number, zIndex?: number, rotation?: number, content?: any }) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    // Validation & Rounding for Prisma Int
    const validatedData: any = { ...data };
    if (typeof validatedData.x === 'number') validatedData.x = Math.round(Math.max(0, Math.min(100, validatedData.x)));
    if (typeof validatedData.y === 'number') validatedData.y = Math.round(Math.max(0, Math.min(100, validatedData.y)));

    try {
        await prisma.moodBlock.update({
            where: { id: blockId, userId: session.user.id },
            data: validatedData,
        });

        const username = (session.user as any).username;
        revalidatePath("/dashboard");
        if (username) revalidatePath(`/${username}`);

        return { success: true };
    } catch (error) {
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
        if (username) revalidatePath(`/${username}`);
        return { success: true };
    } catch (error) {
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
        if (username) revalidatePath(`/${username}`);

        return { success: true };
    } catch (error) {
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
        if (username) revalidatePath(`/${username}`);
        return { success: true };
    } catch (error) {
        return { error: "Erro ao reordenar blocos" };
    }
}
