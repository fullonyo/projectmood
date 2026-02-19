"use client"

import { cn } from "@/lib/utils"
import { Book, Film, Star } from "lucide-react"

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

    return (
        <div className={cn(
            "p-5 py-9 min-w-[160px] max-w-[220px] shadow-none border border-black/10 dark:border-white/10 rounded-none relative transition-all group hover:-translate-y-1 bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm",
            isBook
                ? "text-zinc-800 border-l-[8px] border-zinc-400/50 bg-[#fdfcf0]"
                : "bg-zinc-950 text-zinc-100 border border-zinc-800"
        )}>
            <div className="absolute top-3 left-4 flex items-center gap-1.5">
                {isBook ? <Book className="w-3 h-3 opacity-30" /> : <Film className="w-3 h-3 opacity-30" />}
                <span className="text-[8px] opacity-30 uppercase font-black tracking-widest leading-none">
                    {content.category}
                </span>
            </div>

            <div className="space-y-4 mt-2">
                <p className={cn(
                    "text-sm font-black text-center leading-tight uppercase tracking-tighter",
                    isBook ? "font-serif italic" : "font-mono"
                )}>
                    {content.title}
                </p>

                <div className="flex justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            className={cn(
                                "w-2.5 h-2.5",
                                s <= (content.rating || 5) ? "fill-current" : "opacity-10"
                            )}
                        />
                    ))}
                </div>

                <div className={cn(
                    "pt-6 border-t text-[10px] italic text-center opacity-70 leading-relaxed",
                    isBook ? "border-zinc-800/10" : "border-white/5"
                )}>
                    "{content.review}"
                </div>
            </div>

            {/* Premium Detail */}
            {isBook && (
                <div className="absolute right-2 top-0 bottom-0 w-[1px] bg-black/5" />
            )}
        </div>
    )
}
