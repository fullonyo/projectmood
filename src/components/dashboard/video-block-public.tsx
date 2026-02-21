"use client"

import { cn } from "@/lib/utils"
import { useViewportScale } from "@/lib/canvas-scale"

interface VideoBlockPublicProps {
    content: {
        videoId: string
    }
    isPublic?: boolean
}

export function VideoBlockPublic({ content, isPublic = false }: VideoBlockPublicProps) {
    // User requested unmuted autoplay. Warning: Browsers may block this completely.
    const autoplayParams = isPublic ? '&autoplay=1&mute=0' : '';
    const scale = useViewportScale()

    return (
        <div className="w-full h-full bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm rounded-none border border-black/10 dark:border-white/10 hover:scale-[1.02] transition-transform relative overflow-hidden flex flex-col" style={{ padding: Math.round(8 * scale) }}>
            <iframe
                src={`https://www.youtube.com/embed/${content.videoId}?loop=1&playlist=${content.videoId}&controls=1&rel=0${autoplayParams}`}
                width="100%" height="100%" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-none font-mono"
            />
            {/* Premium Overlay for non-hover state */}
            <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-none" />

            {/* Interaction Shield for Editor Mode */}
            {!isPublic && (
                <div className="absolute inset-0 bg-transparent cursor-pointer z-10" />
            )}
        </div>
    )
}
