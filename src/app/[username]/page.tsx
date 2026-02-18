import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { AnalyticsDisplay } from "@/components/dashboard/analytics-display";
// import { NowPlayingSpotify } from "@/components/dashboard/now-playing-spotify";
import { themeConfigs } from "@/lib/themes";
import { BlockRenderer } from "@/components/dashboard/block-renderer";
import { BackgroundEffect } from "@/components/effects/background-effect";
import { StaticTextures } from "@/components/effects/static-textures";
import { CustomCursor } from "@/components/effects/custom-cursor";
import { MouseTrails } from "@/components/effects/mouse-trails";
import { FontLoader } from "@/components/dashboard/font-loader";

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
            <FontLoader fontFamily={(profile as any).customFont} />
            <CustomCursor type={profile.customCursor || 'auto'} />
            <MouseTrails type={profile.mouseTrails || 'none'} />
            <div className="fixed inset-0 z-0">
                <BackgroundEffect type={profile.backgroundEffect || 'none'} primaryColor={profile.primaryColor || undefined} />
            </div>
            <div className="fixed inset-0 z-[1]">
                <StaticTextures type={(profile as any).staticTexture || 'none'} />
            </div>

            {/* Dynamic Background Effect / Grid */}
            <div
                className={cn("fixed inset-0 z-[2] pointer-events-none transition-opacity duration-1000", config.gridOpacity)}
                style={{
                    backgroundImage: config.grid,
                    backgroundSize: config.bgSize,
                    filter: theme === 'vintage' ? 'contrast(110%) brightness(105%) sepia(20%)' : 'none'
                }}
            />

            {/* Floating Header */}
            <header className="fixed top-8 left-8 z-50 mix-blend-difference">
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-current bg-white/10">
                        <img src={(profile as any).avatarUrl || `https://avatar.vercel.sh/${user.username}`} alt={user.username} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter">@{user.username}</h1>
                        <p className="text-[10px] uppercase tracking-widest opacity-60">MoodSpace</p>
                    </div>
                </div>
            </header>

            {/* The Canvas Reality */}
            <main className="relative w-full h-full pt-16">
                <div className="relative w-full h-full p-10">
                    {moodBlocks.map((block: any) => (
                        <div
                            key={block.id}
                            className="absolute select-none pointer-events-auto"
                            style={{
                                left: `${block.x}%`,
                                top: `${block.y}%`,
                                transform: `rotate(${block.rotation || 0}deg)`,
                                zIndex: block.zIndex || 1
                            }}
                        >
                            <BlockRenderer block={block} isPublic={true} />
                        </div>
                    ))}
                </div>
            </main>

            {/* Analytics Display */}
            <AnalyticsDisplay profileId={user.profile.id} />

            {/* Now Playing Spotify - Removed (Merged into Music Block) */}
            {/* <NowPlayingSpotify userId={user.id} /> */}

            {/* Branding Footer */}
            <footer className="fixed bottom-8 right-8 z-50">
                <div className="text-[9px] font-black tracking-[0.5em] uppercase opacity-20 hover:opacity-100 transition-opacity">
                    MoodSpace Studio
                </div>
            </footer>
        </div>
    );
}
