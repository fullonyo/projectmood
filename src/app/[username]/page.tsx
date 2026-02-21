import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { themeConfigs } from "@/lib/themes";
import { PublicMoodPageClient } from "./page-client";



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

    const { getProfileWithTags } = await import("@/lib/data-fetching");
    const user = await getProfileWithTags(username);

    if (!user || !user.profile) notFound();

    const { profile, moodBlocks: liveBlocks } = user;

    // Draft/Publish: ler da versão ativa, com fallback para blocos live
    const activeVersion = (profile as any).versions?.[0];
    const moodBlocks = activeVersion
        ? (activeVersion.blocks as typeof liveBlocks)
        : liveBlocks;

    // Construir profileData efetivo: snapshot publicado > profile live
    // Usa ?? (nullish coalescing) ao invés de || para respeitar valores falsy como "" ou 0
    const visualConfig = activeVersion?.profileData as Record<string, any> | null;

    const effectiveProfile = {
        ...profile,
        theme: visualConfig?.theme ?? profile.theme ?? 'light',
        backgroundColor: visualConfig?.backgroundColor ?? profile.backgroundColor,
        primaryColor: visualConfig?.primaryColor ?? profile.primaryColor,
        fontStyle: visualConfig?.fontStyle ?? profile.fontStyle,
        customCursor: visualConfig?.customCursor ?? profile.customCursor,
        mouseTrails: visualConfig?.mouseTrails ?? profile.mouseTrails,
        backgroundEffect: visualConfig?.backgroundEffect ?? profile.backgroundEffect,
        customFont: visualConfig?.customFont ?? profile.customFont,
        staticTexture: visualConfig?.staticTexture ?? profile.staticTexture,
        avatarUrl: visualConfig?.avatarUrl ?? profile.avatarUrl,
    };

    const theme = effectiveProfile.theme;
    const config = themeConfigs[theme] || themeConfigs.light;

    const finalBg = (theme === 'light' && effectiveProfile.backgroundColor) ? effectiveProfile.backgroundColor : config.bg;
    const finalPrimary = (theme === 'light' && effectiveProfile.primaryColor) ? effectiveProfile.primaryColor : config.primary;

    return (
        <div
            className={cn(
                "h-screen w-full relative overflow-hidden transition-all duration-1000",
                effectiveProfile.fontStyle === 'serif' ? 'font-serif' : effectiveProfile.fontStyle === 'mono' ? 'font-mono' : 'font-sans'
            )}
            style={{
                backgroundColor: finalBg,
                color: finalPrimary
            }}
        >
            <PublicMoodPageClient
                user={user}
                profile={effectiveProfile}
                moodBlocks={moodBlocks}
                config={config}
                theme={theme}
            />
        </div>
    );
}
