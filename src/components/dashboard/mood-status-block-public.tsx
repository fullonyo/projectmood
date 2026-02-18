"use client"

import { MoodStatusBlockContent } from "@/lib/validations"

interface MoodStatusBlockPublicProps {
    content: MoodStatusBlockContent
}

export function MoodStatusBlockPublic({ content }: MoodStatusBlockPublicProps) {
    const { emoji, text } = content

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="bg-white/10 dark:bg-zinc-900/10 backdrop-blur-xl rounded-3xl p-4 px-6 shadow-2xl border border-white/20 flex items-center gap-4 transition-all hover:scale-105 group">
                <div className="text-4xl animate-bounce group-hover:animate-none group-hover:scale-125 transition-transform">
                    {emoji}
                </div>
                <div className="h-8 w-[1px] bg-zinc-400/20" />
                <p className="text-base font-black tracking-tight text-current uppercase italic">
                    {text}
                </p>
            </div>
        </div>
    )
}
