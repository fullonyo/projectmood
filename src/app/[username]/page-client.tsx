"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useViewportScale, scaleBlockSize, getBlockFallbackSize } from "@/lib/canvas-scale"
import { ProfileSignature } from "@/components/dashboard/profile-signature"
import { AnalyticsDisplay } from "@/components/dashboard/analytics-display"
import { GuestPromotion } from "@/components/dashboard/guest-promotion"
import { BoardStage } from "@/components/dashboard/board-stage"
import { BlockRenderer } from "@/components/dashboard/block-renderer"
import { StudioCatalogID } from "@/components/dashboard/studio-catalog-id"
import { SignatureShare } from "@/components/dashboard/signature-share"
import { RoomEnvironment } from "@/components/dashboard/room-environment"
import { CustomCursor } from "@/components/effects/custom-cursor"
import { MouseTrails } from "@/components/effects/mouse-trails"
import { Lightbulb, LightbulbOff } from "lucide-react"
import type { PublicMoodPageProps, MoodBlock } from "@/types/database"

export function PublicMoodPageClient({ publicUser, profileId, profile, moodBlocks, config, theme, isGuest }: PublicMoodPageProps) {
    const [isFocusMode, setIsFocusMode] = useState(false)
    const [views, setViews] = useState<number>(0)
    const [loadingViews, setLoadingViews] = useState(true)

    // 📌 Escala proporcional: fidelidade visual cross-resolution
    const viewportScale = useViewportScale()

    useEffect(() => {
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
    }, [profileId])

    return (
        <>
            <CustomCursor type={profile.customCursor || 'auto'} />
            <MouseTrails type={profile.mouseTrails || 'none'} />

            {/* 🏰 CONSOLIDATED ENVIRONMENT FOR PUBLIC PAGE */}
            <div className="fixed inset-0 z-0">
                <RoomEnvironment
                    profile={profile}
                    backgroundEffect={profile.backgroundEffect || 'none'}
                />
            </div>

            {/* UI Overlay - Controlled by Focus Mode */}
            <div className={cn("transition-all duration-700", isFocusMode ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100")}>
                <ProfileSignature
                    username={publicUser.username}
                    name={publicUser.name || undefined}
                    avatarUrl={profile.avatarUrl || undefined}
                    isVerified={publicUser.isVerified}
                    verificationType={publicUser.verificationType}
                />
                <StudioCatalogID
                    profileId={profile.id}
                    createdAt={profile.updatedAt}
                    views={views}
                />
                <AnalyticsDisplay
                    views={views}
                    loading={loadingViews}
                />
                {isGuest && <GuestPromotion username={publicUser.username} />}
                <SignatureShare username={publicUser.username} />
            </div>

            {/* Focus Mode Toggle */}
            <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={cn(
                    "fixed top-12 right-4 sm:right-1/2 sm:translate-x-[200px] z-[70] p-3 rounded-full transition-all duration-500",
                    "bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10",
                    isFocusMode && "sm:translate-x-0 top-10 bg-white/20"
                )}
            >
                {isFocusMode ? <Lightbulb className="w-4 h-4" /> : <LightbulbOff className="w-4 h-4 opacity-40 hover:opacity-100" />}
            </button>

            {/* The Canvas Reality - Scrollable on mobile, fixed on desktop */}
            <main className="relative w-full h-full overflow-y-auto sm:overflow-hidden">
                <BoardStage>
                    {moodBlocks.map((block: MoodBlock) => (
                        <div
                            key={block.id}
                            className="absolute select-none pointer-events-auto"
                            style={{
                                left: `${block.x}%`,
                                top: `${block.y}%`,
                                width: scaleBlockSize(block.width, viewportScale, block.type, 'w'),
                                height: scaleBlockSize(block.height, viewportScale, block.type, 'h'),
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
