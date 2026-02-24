"use server"

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MOOD_TEMPLATES } from "@/lib/templates";

export async function applyTemplateAction(templateId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    const template = MOOD_TEMPLATES[templateId];
    if (!template) return { error: "Template não encontrado" };

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Atualizar Profile
            await tx.profile.update({
                where: { userId: session.user.id },
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

            // 2. Limpar blocos atuais (opcional, mas recomendado para templates iniciais)
            await tx.moodBlock.updateMany({
                where: { userId: session.user.id, deletedAt: null },
                data: { deletedAt: new Date() }
            });

            // 3. Criar novos blocos do template
            if (template.blocks.length > 0) {
                await tx.moodBlock.createMany({
                    data: template.blocks.map((b, idx) => ({
                        userId: session.user.id,
                        type: b.type,
                        content: b.content,
                        x: b.x,
                        y: b.y,
                        width: b.width || null,
                        height: b.height || null,
                        order: idx,
                        zIndex: b.zIndex || (20 + idx)
                    }))
                });
            }
        });

        revalidatePath("/dashboard");
        revalidatePath(`/${session.user.username}`); // Forçar revalidação da página pública

        return { success: true };
    } catch (error) {
        console.error('[applyTemplateAction]', error);
        return { error: "Erro ao aplicar template" };
    }
}
