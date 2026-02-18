"use client"

import { cn } from "@/lib/utils"

interface VideoBlockPublicProps {
    content: {
        videoId: string
    }
    isPublic?: boolean
}

export function VideoBlockPublic({ content, isPublic = false }: VideoBlockPublicProps) {
    return (
        <div className="w-full max-w-[420px] aspect-video bg-zinc-950 rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 group hover:scale-[1.01] transition-transform relative">
            <iframe
                src={`https://www.youtube.com/embed/${content.videoId}?autoplay=${isPublic ? '0' : '1'}&loop=1&playlist=${content.videoId}&controls=1&rel=0`}
                width="100%" height="100%" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="opacity-90"
            />
            {/* Premium Overlay for non-hover state */}
            <div className="absolute inset-0 pointer-events-none border-[8px] border-black/5 rounded-[2rem]" />
        </div>
    )
}
