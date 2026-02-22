"use client"

import { cn } from "@/lib/utils"
import { useViewportScale } from "@/lib/canvas-scale"

export type MediaType = 'video' | 'music'

interface SmartMediaProps {
    mediaType: MediaType
    videoId?: string
    trackId?: string
    isPublic?: boolean
    scale?: number
}

export function SmartMedia({
    mediaType,
    videoId,
    trackId,
    isPublic = false,
    scale: manualScale
}: SmartMediaProps) {
    const autoScale = useViewportScale()
    const scale = manualScale ?? autoScale

    // Common Wrapper for premium look
    const wrapperClasses = cn(
        "w-full h-full relative overflow-hidden transition-all duration-700",
        "bg-zinc-100 dark:bg-zinc-900",
        !isPublic && "cursor-pointer group"
    )

    // YouTube Logic
    if (mediaType === 'video' && videoId) {
        const autoplayParams = isPublic ? '&autoplay=1&mute=0' : '';
        return (
            <div className={wrapperClasses}>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}&controls=1&rel=0${autoplayParams}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                />
                {!isPublic && (
                    <div className="absolute inset-0 bg-transparent z-10" />
                )}
                <div className="absolute inset-0 pointer-events-none border border-black/5 dark:border-white/5 z-20" />
            </div>
        )
    }

    // Spotify Logic
    if (mediaType === 'music' && trackId) {
        return (
            <div
                className={cn(wrapperClasses, "bg-white/5 dark:bg-zinc-950/50 backdrop-blur-md items-center justify-center flex")}
                style={{ padding: Math.round(8 * scale) }}
            >
                <div className="w-full h-full relative">
                    <iframe
                        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-none transition-all duration-1000 grayscale-[0.3] group-hover:grayscale-0"
                    />
                    {!isPublic && (
                        <div className="absolute inset-0 bg-transparent z-10" />
                    )}
                </div>
                <div className="absolute inset-0 pointer-events-none border border-black/5 dark:border-white/5 z-20" />
            </div>
        )
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800">
            <span className="text-[8px] font-black uppercase opacity-20 tracking-widest">Media Missing</span>
        </div>
    )
}
