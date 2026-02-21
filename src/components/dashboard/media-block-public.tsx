"use client"

import { cn } from "@/lib/utils"
import { Book, Film, Star } from "lucide-react"
import { useViewportScale } from "@/lib/canvas-scale"

interface MediaBlockPublicProps {
    content: {
        category: 'book' | 'movie'
        title: string
        review: string
        rating?: number
    }
    isPublic?: boolean
}

export function MediaBlockPublic({ content, isPublic = false }: MediaBlockPublicProps) {
    const isBook = content.category === 'book'
    const scale = useViewportScale()

    return (
        <div className={cn(
            "shadow-none border border-black/10 dark:border-white/10 rounded-none relative transition-all group hover:-translate-y-1 bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm",
            isBook
                ? "text-zinc-800 bg-[#fdfcf0]"
                : "bg-zinc-950 text-zinc-100 border border-zinc-800"
        )} style={{
            minWidth: Math.round(160 * scale),
            maxWidth: Math.round(220 * scale),
            padding: `${Math.round(36 * scale)}px ${Math.round(20 * scale)}px`,
            borderLeftWidth: isBook ? Math.round(8 * scale) : undefined,
            borderColor: isBook ? 'rgba(161, 161, 170, 0.5)' : undefined
        }}>
            <div className="absolute flex items-center" style={{ top: Math.round(12 * scale), left: Math.round(16 * scale), gap: Math.round(6 * scale) }}>
                {isBook ? <Book className="opacity-30" style={{ width: Math.round(12 * scale), height: Math.round(12 * scale) }} /> : <Film className="opacity-30" style={{ width: Math.round(12 * scale), height: Math.round(12 * scale) }} />}
                <span className="opacity-30 uppercase font-black tracking-widest leading-none" style={{ fontSize: Math.round(8 * scale) }}>
                    {content.category}
                </span>
            </div>

            <div className="flex flex-col" style={{ gap: Math.round(16 * scale), marginTop: Math.round(8 * scale) }}>
                <p className={cn(
                    "font-black text-center leading-tight uppercase tracking-tighter",
                    isBook ? "font-serif italic" : "font-mono"
                )} style={{ fontSize: Math.round(14 * scale) }}>
                    {content.title}
                </p>

                <div className="flex justify-center" style={{ gap: Math.round(2 * scale) }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            className={cn(
                                s <= (content.rating || 5) ? "fill-current" : "opacity-10"
                            )}
                            style={{ width: Math.round(10 * scale), height: Math.round(10 * scale) }}
                        />
                    ))}
                </div>

                <div className={cn(
                    "border-t italic text-center opacity-70 leading-relaxed",
                    isBook ? "border-zinc-800/10" : "border-white/5"
                )} style={{ paddingTop: Math.round(24 * scale), fontSize: Math.round(10 * scale) }}>
                    "{content.review}"
                </div>
            </div>

            {/* Premium Detail */}
            {isBook && (
                <div className="absolute right-2 top-0 bottom-0 bg-black/5" style={{ width: Math.max(1, Math.round(1 * scale)), right: Math.round(8 * scale) }} />
            )}
        </div>
    )
}
