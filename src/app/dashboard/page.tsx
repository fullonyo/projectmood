import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import { computeHasUnpublishedChanges } from "@/actions/publish";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true }
    });

    if (!user) {
        redirect("/auth/register"); // Se o user sumiu do banco mas tem sessão, forçamos re-registro ou login
    }

    let currentProfile = user.profile;

    // Auto-reparo: Se o usuário existe mas não tem perfil, criamos um padrão agora.
    // Transação atômica: se a criação da versão falhar, o perfil também é revertido.
    if (!currentProfile) {
        const [newProfile] = await prisma.$transaction(async (tx) => {
            const profile = await tx.profile.create({
                data: {
                    userId: user.id,
                    theme: "light",
                }
            });

            // Auto-publish v1: garante que perfil novo já tenha versão pública
            await tx.profileVersion.create({
                data: {
                    profileId: profile.id,
                    blocks: [],
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
                        avatarUrl: profile.avatarUrl,
                    },
                    isActive: true,
                    label: "v1"
                }
            });

            return [profile];
        });
        currentProfile = newProfile;
    }

    const { username } = user;
    const profile = currentProfile;

    const moodBlocks = await prisma.moodBlock.findMany({
        where: { userId: session.user.id },
        orderBy: { order: 'asc' },
    });

    // Buscar última publicação ativa
    const activeVersion = await prisma.profileVersion.findFirst({
        where: { profileId: profile.id, isActive: true },
        select: { createdAt: true }
    });
    const publishedAt = activeVersion?.createdAt?.toISOString() || null;

    // Detectar se há mudanças não publicadas
    const hasUnpublishedChanges = await computeHasUnpublishedChanges();

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden">
            {/* Client Layout with Sidebars and Canvas - Header was merged into Right Sidebar */}
            <DashboardClientLayout profile={profile} moodBlocks={moodBlocks} username={username} publishedAt={publishedAt} hasUnpublishedChanges={hasUnpublishedChanges} />
        </div>
    );
}
