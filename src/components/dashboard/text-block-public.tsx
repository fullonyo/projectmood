"use client"

import { cn } from "@/lib/utils"
import { useViewportScale } from "@/lib/canvas-scale"

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
    const scale = useViewportScale()

    return (
        <div
            className={cn(
                "shadow-none border border-black/10 dark:border-white/10 transition-all duration-300 bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm",
                style === 'postit' && "bg-[#ffff88] text-zinc-900 rotate-[-1deg] shadow-yellow-900/20 border-b-black/5 font-handwriting",
                style === 'ripped' && "bg-white text-zinc-900 shadow-zinc-300/80",
                style === 'typewriter' && "bg-transparent border-2 border-dashed border-current rounded-none",
                style === 'simple' && "bg-white dark:bg-zinc-950 border border-black dark:border-white rounded-none shadow-none"
            )}
            style={{
                minWidth: Math.round(220 * scale),
                maxWidth: Math.round(450 * scale),
                padding: style === 'typewriter' ? `${Math.round(32 * scale)}px ${Math.round(16 * scale)}px` : `${Math.round(24 * scale)}px`,
                backgroundColor: style === 'postit' ? undefined : bgColor,
                clipPath: style === 'ripped' ? 'polygon(0% 2%, 98% 0%, 100% 100%, 2% 98%, 0% 50%)' : 'none',
                textAlign: align,
                borderBottomWidth: style === 'postit' ? Math.round(20 * scale) : undefined,
                borderRadius: style === 'postit' ? Math.round(2 * scale) : undefined
            }}
        >
            <p
                className={cn(
                    "leading-relaxed transition-all whitespace-pre-wrap",
                    fontSize === 'xl' && "font-serif italic",
                    fontSize === '3xl' && "font-black tracking-tighter font-mono uppercase",
                    style === 'typewriter' && "font-mono underline decoration-dotted"
                )}
                style={{ fontSize: Math.round((fontSize === 'sm' ? 16 : fontSize === '3xl' ? 48 : 30) * scale) }}
            >
                {text}
            </p>
        </div>
    )
}
