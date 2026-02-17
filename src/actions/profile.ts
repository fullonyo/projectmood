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

    if (!session?.user?.id) {
        return { error: "Não autorizado" };
    }

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

export async function addMoodBlock(type: string, content: any) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Não autorizado" };
    }

    try {
        await prisma.moodBlock.create({
            data: {
                userId: session.user.id,
                type,
                content,
            },
        });

        const username = (session.user as any).username;
        revalidatePath("/dashboard");
        if (username) revalidatePath(`/${username}`);

        return { success: true };
    } catch (error) {
        return { error: "Erro ao adicionar bloco" };
    }
}

export async function deleteMoodBlock(blockId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Não autorizado" };
    }

    try {
        await prisma.moodBlock.delete({
            where: {
                id: blockId,
                userId: session.user.id
            },
        });

        const username = (session.user as any).username;
        revalidatePath("/dashboard");
        if (username) revalidatePath(`/${username}`);

        return { success: true };
    } catch (error) {
        return { error: "Erro ao excluir bloco" };
    }
}

export async function reorderMoodBlocks(blocks: { id: string, order: number }[]) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Não autorizado" };
    }

    try {
        await prisma.$transaction(
            blocks.map((block) =>
                prisma.moodBlock.update({
                    where: { id: block.id, userId: session.user.id },
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
