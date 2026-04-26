import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { themeConfigs } from "@/lib/themes";
import { PublicMoodPageClient } from "./page-client";
import { getFeatureFlags } from "@/actions/system-config";
import { getPrimaryRoomByUsername } from "@/lib/data-fetching";
import { RoomVisualConfig } from "@/types/database";

type Props = {
    params: Promise<{ handle: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const rawHandle = (await params).handle;
    const handle = decodeURIComponent(rawHandle);
    
    // Legacy redirect handling for metadata
    if (!handle.startsWith('@')) {
        const user = await prisma.user.findFirst({
            where: { username: { equals: handle, mode: 'insensitive' } },
        });
        if (user) return { title: { absolute: "Redirecting..." } };
        return { title: { absolute: "404 — moodspace" } };
    }

    const username = handle.slice(1).toLowerCase();
    const data = await getPrimaryRoomByUsername(username);

    if (!data) return { title: { absolute: "404 — moodspace" } };

    const { user } = data;
    const separator = user.isVerified ? "✦" : "—";
    const title = `@${user.username} ${separator} moodspace`;
    const description = `Confira o espaço criativo de @${user.username} no MoodSpace. Aesthetic moods, music & GIFs.`;

    return {
        title: { absolute: title },
        description,
        openGraph: {
            title,
            description,
            type: "profile",
            username: user.username,
            images: [{ url: `/@${user.username}/opengraph-image`, width: 1200, height: 630 }],
        },
    };
}

export default async function PublicMoodPage({ params }: Props) {
    const rawHandle = (await params).handle;
    const handle = decodeURIComponent(rawHandle);
    console.log('[DEBUG] PublicMoodPage handle:', handle);

    // 1. Handle Legacy /@[username] normalization or [username] -> @[username] redirect
    if (!handle.startsWith('@')) {
        // Check if it's a valid user to redirect
        const user = await prisma.user.findFirst({
            where: { username: { equals: handle, mode: 'insensitive' } },
        });
        if (user) {
            redirect(`/@${user.username.toLowerCase()}`);
        }
        notFound();
    }

    const username = handle.slice(1).toLowerCase();

    // Ensure URL is lowercase
    if (handle !== `@${username}`) {
        redirect(`/@${username}`);
    }

    const session = await auth();
    const isGuest = !session;

    const data = await getPrimaryRoomByUsername(username);

    if (!data || data.user.isBanned) notFound();

    const { room, activeVersion, moodBlocks: liveBlocks, user } = data;

    // Se houver uma versão ativa, usamos os blocos dela. Caso contrário, os "live" (rascunho atual).
    const moodBlocksRaw = activeVersion ? activeVersion.blocks : liveBlocks;

    const rawFlags = await getFeatureFlags();
    const systemFlags = rawFlags.reduce((acc: Record<string, boolean>, flag) => {
        acc[flag.key] = flag.isEnabled;
        return acc;
    }, {});

    const moodBlocks = moodBlocksRaw.filter((block: any) => {
        const flagKey = `block_${block.type}`;
        return systemFlags[flagKey] !== false;
    });

    const visualConfig = activeVersion?.profileData as RoomVisualConfig | null;

    const effectiveRoom = {
        ...room,
        theme: visualConfig?.theme ?? room.theme ?? 'light',
        backgroundColor: visualConfig?.backgroundColor ?? room.backgroundColor,
        primaryColor: visualConfig?.primaryColor ?? room.primaryColor,
        fontStyle: visualConfig?.fontStyle ?? room.fontStyle,
        customCursor: systemFlags['feature_custom_cursor'] === false ? 'auto' : (visualConfig?.customCursor ?? room.customCursor),
        mouseTrails: systemFlags['feature_mouse_trails'] === false ? 'none' : (visualConfig?.mouseTrails ?? room.mouseTrails),
        backgroundEffect: systemFlags['feature_background_effects'] === false ? 'none' : (visualConfig?.backgroundEffect ?? room.backgroundEffect),
        customFont: visualConfig?.customFont ?? room.customFont,
        staticTexture: visualConfig?.staticTexture ?? room.staticTexture,
        avatarUrl: visualConfig?.avatarUrl ?? room.avatarUrl,
        title: visualConfig?.title ?? room.title,
    };

    const theme = effectiveRoom.theme;
    const config = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.light;

    const finalBg = (theme === 'light' && effectiveRoom.backgroundColor) ? effectiveRoom.backgroundColor : config.bg;
    const finalPrimary = (theme === 'light' && effectiveRoom.primaryColor) ? effectiveRoom.primaryColor : config.primary;

    return (
        <div
            className={cn(
                "h-screen w-full relative overflow-hidden",
                theme === 'dark' ? "dark" : "",
                effectiveRoom.fontStyle === 'serif' ? 'font-serif' : effectiveRoom.fontStyle === 'mono' ? 'font-mono' : 'font-sans'
            )}
            style={{ color: finalPrimary }}
        >
            <PublicMoodPageClient
                publicUser={user}
                roomId={room.id}
                profile={effectiveRoom as any} 
                moodBlocks={moodBlocks as any}
                config={config}
                theme={theme}
                isGuest={isGuest}
            />
        </div>
    );
}
