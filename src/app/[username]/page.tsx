import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { AnalyticsDisplay } from "@/components/dashboard/analytics-display";
// import { NowPlayingSpotify } from "@/components/dashboard/now-playing-spotify";
import { themeConfigs } from "@/lib/themes";
import { BlockRenderer } from "@/components/dashboard/block-renderer";
import { BoardStage } from "@/components/dashboard/board-stage";
import { BackgroundEffect } from "@/components/effects/background-effect";
import { StaticTextures } from "@/components/effects/static-textures";
import { CustomCursor } from "@/components/effects/custom-cursor";
import { MouseTrails } from "@/components/effects/mouse-trails";
import { FontLoader } from "@/components/dashboard/font-loader";
import { ViralBadge } from "@/components/dashboard/viral-badge";
import { ProfileSignature } from "@/components/dashboard/profile-signature";

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

            {/* Studio Profile Signature */}
            <ProfileSignature
                username={user.username}
                name={user.name || undefined}
                avatarUrl={(profile as any).avatarUrl}
            />

            {/* The Canvas Reality */}
            <main className="relative w-full h-full">
                <BoardStage>
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
                </BoardStage>
            </main>

            {/* Analytics Display */}
            <AnalyticsDisplay profileId={user.profile.id} />

            {/* Viral CTA / Branding */}
            <ViralBadge />
        </div>
    );
}
