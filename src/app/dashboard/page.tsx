import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import { computeHasUnpublishedChanges } from "@/actions/publish";
import { getFeatureFlags } from "@/actions/system-config";
import { MoodBlock } from "@/types/database";

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
        redirect("/auth/register");
    }

    if (user.isBanned) {
        redirect("/banned");
    }

    let currentProfile = user.profile;

    if (!currentProfile) {
        const [newProfile] = await prisma.$transaction(async (tx) => {
            const profile = await tx.profile.create({
                data: {
                    userId: user.id,
                    theme: "light",
                }
            });

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

    const moodBlocks = (await prisma.moodBlock.findMany({
        where: { userId: session.user.id, deletedAt: null },
        orderBy: { order: 'asc' },
    })) as MoodBlock[];

    const activeVersion = await prisma.profileVersion.findFirst({
        where: { profileId: profile.id, isActive: true },
        select: { createdAt: true }
    });
    const publishedAt = activeVersion?.createdAt?.toISOString() || null;

    const hasUnpublishedChanges = await computeHasUnpublishedChanges();

    const isAdmin = (session.user as any)?.role === "ADMIN";
    const rawFlags = await getFeatureFlags();
    const systemFlags = rawFlags.reduce((acc: Record<string, boolean>, flag: { key: string, isEnabled: boolean }) => {
        acc[flag.key] = flag.isEnabled;
        return acc;
    }, {} as Record<string, boolean>);

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden">
            <DashboardClientLayout
                profile={profile}
                moodBlocks={moodBlocks}
                username={username}
                publishedAt={publishedAt}
                hasUnpublishedChanges={hasUnpublishedChanges}
                isAdmin={isAdmin}
                systemFlags={systemFlags}
            />
        </div>
    );
}
