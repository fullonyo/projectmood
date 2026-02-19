import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { themeConfigs } from "@/lib/themes";
import { PublicMoodPageClient } from "./page-client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
    params: Promise<{ username: string }>;
};

export async function generateMetadata({
    params,
}: Props): Promise<Metadata> {
    const { username } = await params;

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) return { title: "Usuário não encontrado | MoodSpace" };

    return {
        title: `${user.name || user.username} (@${user.username}) | MoodSpace`,
        description: `Confira o espaço criativo de @${user.username} no MoodSpace. Aesthetic moods, music & GIFs.`,
    };
}

export default async function PublicMoodPage({
    params,
}: Props) {
    const { username } = await params;

    const { getPublicProfileCached } = await import("@/lib/data-fetching");
    const user = await getPublicProfileCached(username);

    if (!user || !user.profile) notFound();

    const { profile, moodBlocks } = user;

    const theme = profile.theme || 'light';
    const config = themeConfigs[theme] || themeConfigs.light;

    // Preserve custom background color if set in light theme
    const finalBg = (theme === 'light' && profile.backgroundColor) ? profile.backgroundColor : config.bg;
    const finalPrimary = (theme === 'light' && profile.primaryColor) ? profile.primaryColor : config.primary;

    return (
        <div
            className={cn(
                "h-screen w-full relative overflow-hidden transition-all duration-1000",
                profile.fontStyle === 'serif' ? 'font-serif' : profile.fontStyle === 'mono' ? 'font-mono' : 'font-sans'
            )}
            style={{
                backgroundColor: finalBg,
                color: finalPrimary
            }}
        >
            <PublicMoodPageClient
                user={user}
                profile={profile}
                moodBlocks={moodBlocks}
                config={config}
                theme={theme}
            />
        </div>
    );
}
