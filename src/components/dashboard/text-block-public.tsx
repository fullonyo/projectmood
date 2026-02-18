"use client"

import { cn } from "@/lib/utils"

interface TextBlockPublicProps {
    content: {
        text: string
        style: 'simple' | 'postit' | 'ripped' | 'typewriter'
        bgColor?: string
        fontSize?: 'sm' | 'xl' | '3xl'
        align?: 'left' | 'center' | 'right'
    }
}

export function TextBlockPublic({ content }: TextBlockPublicProps) {
    const { text, style, bgColor, fontSize = 'xl', align = 'center' } = content

    return (
        <div
            className={cn(
                "p-6 shadow-2xl transition-all duration-300 min-w-[220px] max-w-[450px]",
                style === 'postit' && "bg-[#ffff88] text-zinc-900 rotate-[-1deg] shadow-yellow-900/20 rounded-sm border-b-[20px] border-b-black/5 font-handwriting",
                style === 'ripped' && "bg-white text-zinc-900 shadow-zinc-300/80",
                style === 'typewriter' && "bg-transparent border-2 border-dashed border-current rounded-none px-4 py-8",
                style === 'simple' && "bg-white/10 dark:bg-zinc-900/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
            )}
            style={{
                backgroundColor: style === 'postit' ? undefined : bgColor,
                clipPath: style === 'ripped' ? 'polygon(0% 2%, 98% 0%, 100% 100%, 2% 98%, 0% 50%)' : 'none',
                textAlign: align
            }}
        >
            <p className={cn(
                "leading-relaxed transition-all whitespace-pre-wrap",
                fontSize === 'sm' && "text-base",
                fontSize === 'xl' && "text-3xl font-serif italic",
                fontSize === '3xl' && "text-5xl font-black tracking-tighter font-mono uppercase",
                style === 'typewriter' && "font-mono underline decoration-dotted"
            )}>
                {text}
            </p>
        </div>
    )
}
