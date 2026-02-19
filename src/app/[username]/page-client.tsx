"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ProfileSignature } from "@/components/dashboard/profile-signature"
import { AnalyticsDisplay } from "@/components/dashboard/analytics-display"
import { ViralBadge } from "@/components/dashboard/viral-badge"
import { BoardStage } from "@/components/dashboard/board-stage"
import { BlockRenderer } from "@/components/dashboard/block-renderer"
import { StudioCatalogID } from "@/components/dashboard/studio-catalog-id"
import { SignatureShare } from "@/components/dashboard/signature-share"
import { BackgroundEffect } from "@/components/effects/background-effect"
import { StaticTextures } from "@/components/effects/static-textures"
import { CustomCursor } from "@/components/effects/custom-cursor"
import { MouseTrails } from "@/components/effects/mouse-trails"
import { FontLoader } from "@/components/dashboard/font-loader"
import { Lightbulb, LightbulbOff } from "lucide-react"

export function PublicMoodPageClient({ user, profile, moodBlocks, config, theme }: any) {
    const [isFocusMode, setIsFocusMode] = useState(false)
    const [views, setViews] = useState<number>(0)
    const [loadingViews, setLoadingViews] = useState(true)

    useEffect(() => {
        const profileId = user.profile.id
        const storageKey = `mood_v_${profileId}`
        const lastView = localStorage.getItem(storageKey)
        const now = Date.now()

        // Track view (24h deduplication already implemented)
        if (!lastView || (now - parseInt(lastView) > 24 * 60 * 60 * 1000)) {
            fetch(`/api/analytics/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileId })
            }).catch(console.error)
            localStorage.setItem(storageKey, now.toString())
        }

        // Fetch views
        fetch(`/api/analytics/views?profileId=${profileId}`)
            .then(res => res.json())
            .then(data => {
                setViews(data.views || 0)
                setLoadingViews(false)
            })
            .catch(() => setLoadingViews(false))
    }, [user.profile.id])

    return (
        <>
            <FontLoader fontFamily={(profile as any).customFont} />
            <CustomCursor type={profile.customCursor || 'auto'} />
            <MouseTrails type={profile.mouseTrails || 'none'} />

            <div className="fixed inset-0 z-0">
                <BackgroundEffect type={profile.backgroundEffect || 'none'} primaryColor={profile.primaryColor || undefined} />
            </div>
            <div className="fixed inset-0 z-[1]">
                <StaticTextures type={(profile as any).staticTexture || 'none'} />
            </div>

            <div
                className={cn("fixed inset-0 z-[2] pointer-events-none transition-opacity duration-1000", config.gridOpacity)}
                style={{
                    backgroundImage: config.grid,
                    backgroundSize: config.bgSize,
                    filter: theme === 'vintage' ? 'contrast(110%) brightness(105%) sepia(20%)' : 'none'
                }}
            />

            {/* UI Overlay - Controlled by Focus Mode */}
            <div className={cn("transition-all duration-700", isFocusMode ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100")}>
                <ProfileSignature
                    username={user.username}
                    name={user.name || undefined}
                    avatarUrl={(profile as any).avatarUrl}
                />
                <StudioCatalogID
                    profileId={profile.id}
                    createdAt={profile.createdAt}
                    views={views}
                />
                <AnalyticsDisplay
                    views={views}
                    loading={loadingViews}
                />
                <ViralBadge />
                <SignatureShare username={user.username} />
            </div>

            {/* Focus Mode Toggle */}
            <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={cn(
                    "fixed top-12 right-1/2 translate-x-[200px] z-[70] p-3 rounded-full transition-all duration-500",
                    "bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10",
                    isFocusMode && "translate-x-0 top-10 bg-white/20"
                )}
            >
                {isFocusMode ? <Lightbulb className="w-4 h-4" /> : <LightbulbOff className="w-4 h-4 opacity-40 hover:opacity-100" />}
            </button>

            {/* The Canvas Reality - Back to Static (Clean) */}
            <main className="relative w-full h-full">
                <BoardStage>
                    {moodBlocks.map((block: any) => (
                        <div
                            key={block.id}
                            className="absolute select-none pointer-events-auto"
                            style={{
                                left: `${block.x}%`,
                                top: `${block.y}%`,
                                width: block.width || 'auto',
                                height: block.height || 'auto',
                                rotate: block.rotation ? `${block.rotation}deg` : undefined,
                                zIndex: block.zIndex || 1,
                            }}
                        >
                            <BlockRenderer block={block} isPublic={true} />
                        </div>
                    ))}
                </BoardStage>
            </main>
        </>
    )
}
