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
        ? `${user.name || user.username} ✓ (@${user.username}) | MoodSpace`
        : `${user.name || user.username} (@${user.username}) | MoodSpace`;

    return {
        title,
        description: `Confira o espaço criativo de @${user.username} no MoodSpace. Aesthetic moods, music & GIFs.`,
    };
}

export default async function PublicMoodPage({
    params,
}: Props) {
    const { username } = await params;

    const { getProfileWithTags } = await import("@/lib/data-fetching");
    const user = await getProfileWithTags(username);

    if (!user || !(user as any).profile) notFound();

    if ((user as any).isBanned) notFound(); // Mask banned users as not found

    const { profile, moodBlocks: liveBlocks } = user as any;

    // Draft/Publish: ler da versão ativa, com fallback para blocos live
    const profileWithVersions = profile as ProfileWithVersions;
    const activeVersion = profileWithVersions.versions?.[0];
    const moodBlocksRaw = activeVersion
        ? (activeVersion.blocks as typeof liveBlocks)
        : liveBlocks;

    // Filter blocks based on global Feature Flags (Kill-Switch)
    const rawFlags = await getFeatureFlags();
    const systemFlags = rawFlags.reduce((acc: Record<string, boolean>, flag: { key: string, isEnabled: boolean }) => {
        acc[flag.key] = flag.isEnabled;
        return acc;
    }, {} as Record<string, boolean>);

    const moodBlocks = moodBlocksRaw.filter((block: any) => {
        const flagKey = `block_${block.type}`;
        // If flag exists and is explicitly disabled, hide it.
        // If flag doesn't exist, assume it's a core/always-on block.
        if (systemFlags[flagKey] === false) return false;
        return true;
    });

    // Construir profileData efetivo: snapshot publicado > profile live
    // Usa ?? (nullish coalescing) ao invés de || para respeitar valores falsy como "" ou 0
    const visualConfig = activeVersion?.profileData as ProfileVisualConfig | null;

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
            />
        </div>
    );
}
