"use client"

import { useViewportScale } from "@/lib/canvas-scale"

interface MusicBlockPublicProps {
    content: {
        trackId: string
        name?: string
        artist?: string
        albumArt?: string
    }
    isPublic?: boolean
}

export function MusicBlockPublic({ content, isPublic = false }: MusicBlockPublicProps) {
    const scale = useViewportScale()
    return (
        <div className="w-full h-full bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm rounded-none border border-black/10 dark:border-white/10 hover:scale-[1.02] transition-transform relative overflow-hidden shadow-none flex items-center justify-center" style={{ padding: Math.round(8 * scale) }}>
            <iframe
                src={`https://open.spotify.com/embed/track/${content.trackId}?utm_source=generator`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-none font-mono"
            />

            {/* Interaction Shield for Editor Mode */}
            {!isPublic && (
                <div className="absolute inset-0 bg-transparent cursor-pointer z-10" />
            )}
        </div>
    )
}
