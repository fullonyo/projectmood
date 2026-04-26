import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { themeConfigs } from "@/lib/themes";
import { PublicMoodPageClient } from "../page-client";
import { getFeatureFlags } from "@/actions/system-config";
import { getRoomBySlug } from "@/lib/data-fetching";
import { RoomVisualConfig } from "@/types/database";
import prisma from "@/lib/prisma";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getServerTranslation } from "@/i18n/server";

type Props = {
    params: Promise<{ handle: string, slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const rawParams = await params;
    const handle = decodeURIComponent(rawParams.handle);
    const slug = decodeURIComponent(rawParams.slug);

    const data = await getRoomBySlug(slug);
    if (!data) return { title: { absolute: "Espaço não encontrado — moodspace" } };

    const title = `${data.room.title} ✦ moodspace`;
    return {
        title: { absolute: title },
        description: `Confira o espaço "${data.room.title}" criado por ${data.user.name || data.user.username}`,
    };
}

export default async function SharedRoomPage({ params }: Props) {
    const rawParams = await params;
    const handle = decodeURIComponent(rawParams.handle);
    const slug = decodeURIComponent(rawParams.slug);

    const { dict } = await getServerTranslation();

    const data = await getRoomBySlug(slug);

    if (!data || data.user.isBanned) notFound();

    const { room, activeVersion, moodBlocks: liveBlocks, user, analytics } = data;

    const correctHandle = `@${user.username.toLowerCase()}`;

    // If handle is 's' (legacy /s/slug) or doesn't match the owner, redirect to creator URL
    if (handle === 's' || handle !== correctHandle) {
        redirect(`/${correctHandle}/${slug}`);
    }

    // ────────────────────────────────────────────────────────────────────────────

    // Incrementar visualizações
    await prisma.roomAnalytics.upsert({
        where: { roomId: room.id },
        create: { roomId: room.id, views: 1 },
        update: { views: { increment: 1 } }
    });

    const currentViews = (analytics?.views || 0) + 1;

    // Verificar expiração e limite de acessos
    const isExpired = room.expiresAt && new Date() > room.expiresAt;
    const isLimitReached = room.maxViews && currentViews > room.maxViews;

    if (isExpired || isLimitReached) {
        return (
            <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
                <div className="space-y-6">
                    <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-8 relative">
                        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
                        <Sparkles className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">{dict.multiverse.collapsed_title}</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 max-w-xs mx-auto leading-relaxed">
                        {dict.multiverse.collapsed_message}
                    </p>
                    <div className="pt-8">
                        <Link href="/">
                            <button className="h-12 px-8 rounded-full border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                                {dict.multiverse.return_home}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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

    const session = await auth();

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
                roomId={effectiveRoom.id}
                profile={effectiveRoom as any} 
                moodBlocks={moodBlocks as any}
                config={config}
                theme={theme}
                isGuest={!session}
            />
        </div>
    );
}
