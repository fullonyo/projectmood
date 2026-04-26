"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useViewportScale, scaleBlockSize, getBlockFallbackSize } from "@/lib/canvas-scale"
import { ProfileSignature } from "@/components/studio/profile-signature"
import { AnalyticsDisplay } from "@/components/studio/analytics-display"
import { GuestPromotion } from "@/components/studio/guest-promotion"
import { BoardStage } from "@/components/studio/board-stage"
import { BlockRenderer } from "@/components/studio/block-renderer"
import { StudioCatalogID } from "@/components/studio/studio-catalog-id"
import { SignatureShare } from "@/components/studio/signature-share"
import { RoomEnvironment } from "@/components/studio/room-environment"
import { CustomCursor } from "@/components/effects/custom-cursor"
import { MouseTrails } from "@/components/effects/mouse-trails"
import type { PublicMoodPageProps, MoodBlock } from "@/types/database"
import { ExperienceOverlay } from "@/components/studio/ExperienceOverlay"
import { I18nProvider } from "@/i18n/context"
import { AudioProvider, useAudio } from "@/components/studio/audio-context"
import { LyricsProvider } from "@/components/studio/lyrics-context"
import { GlobalLyricsOverlay } from "@/components/studio/GlobalLyricsOverlay"

export function PublicMoodPageClient(props: PublicMoodPageProps) {
    return (
        <I18nProvider>
            <AudioProvider>
                <LyricsProvider>
                    <PublicMoodPageClientInner {...props} />
                </LyricsProvider>
            </AudioProvider>
        </I18nProvider>
    )
}

function PublicMoodPageClientInner({ publicUser, roomId, profile, moodBlocks, config, theme, isGuest }: PublicMoodPageProps) {
    const { isGlobalMuted, toggleGlobalMute } = useAudio()
    const [isFocusMode, setIsFocusMode] = useState(false)
    const [views, setViews] = useState<number>(0)
    const [loadingViews, setLoadingViews] = useState(true)
    const [hasInteracted, setHasInteracted] = useState(false)

    const activeWeather = moodBlocks.find(b => b.type === 'weather')?.content?.icon || null

    const viewportScale = useViewportScale()

    useEffect(() => {
        const storageKey = `mood_v_${roomId}`
        const lastView = localStorage.getItem(storageKey)
        const now = Date.now()

        if (!lastView || (now - parseInt(lastView) > 24 * 60 * 60 * 1000)) {
            fetch(`/api/analytics/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId })
            }).catch(console.error)
            localStorage.setItem(storageKey, now.toString())
        }

        fetch(`/api/analytics/views?roomId=${roomId}`)
            .then(res => res.json())
            .then(data => {
                setViews(data.views || 0)
                setLoadingViews(false)
            })
            .catch(() => setLoadingViews(false))
    }, [roomId])

    return (
        <>
            <CustomCursor type={profile.customCursor || 'auto'} />
            <MouseTrails type={profile.mouseTrails || 'none'} />

            <ExperienceOverlay
                isVisible={!hasInteracted}
                onEnter={() => setHasInteracted(true)}
                username={publicUser.username}
            />

            <div className={cn("transition-all duration-700", isFocusMode && "focus-active")}>
                <ProfileSignature
                    username={publicUser.username}
                    name={publicUser.name || undefined}
                    avatarUrl={profile.avatarUrl || publicUser.primaryAvatarUrl || undefined}
                    isVerified={publicUser.isVerified}
                    verificationType={publicUser.verificationType}
                    isFocusMode={isFocusMode}
                    setIsFocusMode={setIsFocusMode}
                />
                {!isFocusMode && (
                    <>
                        <StudioCatalogID
                            profileId={profile.id}
                            createdAt={profile.updatedAt}
                            views={views}
                        />
                        <AnalyticsDisplay
                            views={views}
                            loading={loadingViews}
                        />
                        {isGuest && hasInteracted && <GuestPromotion username={publicUser.username} />}
                        <SignatureShare username={publicUser.username} />
                    </>
                )}
            </div>

            <main className="relative w-full h-full overflow-y-auto sm:overflow-hidden">
                <BoardStage>
                    {/* Background moved inside the same stacking context */}
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        <RoomEnvironment
                            profile={profile}
                            backgroundEffect={profile.backgroundEffect || 'none'}
                            weatherSync={activeWeather}
                        />
                    </div>
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
                            <React.Suspense fallback={<div className="w-full h-full animate-pulse bg-white/5 rounded-xl border border-white/10" />}>
                                <BlockRenderer block={block} isPublic={true} hasInteracted={hasInteracted} />
                            </React.Suspense>
                        </div>
                    ))}
                </BoardStage>
            </main>

            {/* Global Lyrics // Studio Mode */}
            <GlobalLyricsOverlay />
        </>
    )
}
