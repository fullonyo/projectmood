"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MOOD_TEMPLATES } from "@/lib/templates";
import { requireAuth, getUsernameById, revalidateProfile } from "@/lib/action-helpers";

export async function applyTemplateAction(templateId: string, roomId?: string) {
    const session = await requireAuth();
    const username = await getUsernameById(session.user.id);

    const template = MOOD_TEMPLATES[templateId as keyof typeof MOOD_TEMPLATES];
    if (!template) return { error: "Template não encontrado" };

    try {
        await prisma.$transaction(async (tx) => {
            // Localizar a sala alvo
            const targetRoom = await tx.room.findFirst({
                where: roomId ? { id: roomId, userId: session.user.id } : { userId: session.user.id, isPrimary: true }
            });

            if (!targetRoom) throw new Error("Sala não encontrada");

            await tx.room.update({
                where: { id: targetRoom.id },
                data: {
                    backgroundEffect: template.profile.backgroundEffect,
                    backgroundColor: template.profile.backgroundColor,
                    primaryColor: template.profile.primaryColor,
                    theme: template.profile.theme,
                    staticTexture: template.profile.staticTexture || 'none',
                    customCursor: template.profile.customCursor || 'auto',
                    mouseTrails: template.profile.mouseTrails || 'none',
                }
            });

            await tx.moodBlock.updateMany({
                where: { roomId: targetRoom.id, deletedAt: null },
                data: { deletedAt: new Date() }
            });
            if (template.blocks.length > 0) {
                await tx.moodBlock.createMany({
                    data: template.blocks.map((b, idx) => ({
                        roomId: targetRoom.id,
                        type: b.type,
                        content: b.content,
                        x: b.x,
                        y: b.y,
                        width: b.width || null,
                        height: b.height || null,
                        order: idx,
                        zIndex: b.zIndex || (20 + idx)
                    })) as any
                });
            }
        });

        const username = await getUsernameById(session.user.id);
        revalidateProfile(username);
        // Força a revalidação profunda do layout para garantir que o switcher e o canvas atualizem
        revalidatePath("/studio", "layout");

        return { success: true };
    } catch (error) {
        console.error('[applyTemplateAction]', error);
        return { error: "Erro ao aplicar template" };
    }
}
