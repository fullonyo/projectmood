import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { themeConfigs } from "@/lib/themes";
import { PublicMoodPageClient } from "./page-client";
import type { ProfileWithVersions, ProfileVisualConfig } from "@/types/database";
import { getFeatureFlags } from "@/actions/system-config";



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

    const title = user.isVerified
        ? `${user.name || user.username} ✓ (@${user.username})`
        : `${user.name || user.username} (@${user.username})`;

    const description = `Confira o espaço criativo de @${user.username} no MoodSpace. Aesthetic moods, music & GIFs.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "profile",
            username: user.username,
            images: [
                {
                    url: `/${user.username}/opengraph-image`,
                    width: 1200,
                    height: 630,
                    alt: `${user.username}'s MoodSpace`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [`/${user.username}/opengraph-image`],
        },
        themeColor: "#000000",
    };
}

export default async function PublicMoodPage({
    params,
}: Props) {
    const { username } = await params;
    const session = await auth();
    const isGuest = !session;

    const { getProfileWithTags } = await import("@/lib/data-fetching");
    const user = await getProfileWithTags(username);

    if (!user || !(user as any).profile) notFound();

    if ((user as any).isBanned) notFound();

    const { profile, moodBlocks: liveBlocks } = user as any;

    const profileWithVersions = profile as ProfileWithVersions;
    const activeVersion = profileWithVersions.versions?.[0];
    const moodBlocksRaw = activeVersion
        ? (activeVersion.blocks as typeof liveBlocks)
        : liveBlocks;

    const rawFlags = await getFeatureFlags();
    const systemFlags = rawFlags.reduce((acc: Record<string, boolean>, flag: { key: string, isEnabled: boolean }) => {
        acc[flag.key] = flag.isEnabled;
        return acc;
    }, {} as Record<string, boolean>);

    const moodBlocks = moodBlocksRaw.filter((block: any) => {
        const flagKey = `block_${block.type}`;
        if (systemFlags[flagKey] === false) return false;
        return true;
    });

    const visualConfig = activeVersion?.profileData as ProfileVisualConfig | null;

    const effectiveProfile = {
        ...profile,
        theme: visualConfig?.theme ?? profile.theme ?? 'light',
        backgroundColor: visualConfig?.backgroundColor ?? profile.backgroundColor,
        primaryColor: visualConfig?.primaryColor ?? profile.primaryColor,
        fontStyle: visualConfig?.fontStyle ?? profile.fontStyle,
        customCursor: systemFlags['feature_custom_cursor'] === false ? 'auto' : (visualConfig?.customCursor ?? profile.customCursor),
        mouseTrails: systemFlags['feature_mouse_trails'] === false ? 'none' : (visualConfig?.mouseTrails ?? profile.mouseTrails),
        backgroundEffect: systemFlags['feature_background_effects'] === false ? 'none' : (visualConfig?.backgroundEffect ?? profile.backgroundEffect),
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
                "h-screen w-full relative overflow-hidden",
                effectiveProfile.fontStyle === 'serif' ? 'font-serif' : effectiveProfile.fontStyle === 'mono' ? 'font-mono' : 'font-sans'
            )}
            style={{
                backgroundColor: finalBg,
                color: finalPrimary
            }}
        >
            <PublicMoodPageClient
                publicUser={{
                    username: user.username,
                    name: user.name,
                    isVerified: user.isVerified,
                    verificationType: user.verificationType
                }}
                profileId={effectiveProfile.id}
                profile={effectiveProfile}
                moodBlocks={moodBlocks}
                config={config}
                theme={theme}
                isGuest={isGuest}
            />
        </div>
    );
}
