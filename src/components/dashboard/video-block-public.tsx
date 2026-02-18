"use client"

import { cn } from "@/lib/utils"

interface VideoBlockPublicProps {
    content: {
        videoId: string
    }
    isPublic?: boolean
}

export function VideoBlockPublic({ content, isPublic = false }: VideoBlockPublicProps) {
    // User requested unmuted autoplay. Warning: Browsers may block this completely.
    const autoplayParams = isPublic ? '&autoplay=1&mute=0' : '';

    return (
        <div className="w-full max-w-[420px] aspect-video bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 group hover:scale-[1.01] transition-transform relative">
            <iframe
                src={`https://www.youtube.com/embed/${content.videoId}?loop=1&playlist=${content.videoId}&controls=1&rel=0${autoplayParams}`}
                width="100%" height="100%" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="opacity-90"
            />
            {/* Premium Overlay for non-hover state */}
            <div className="absolute inset-0 pointer-events-none border-[8px] border-black/5 rounded-2xl" />
        </div>
    )
}
