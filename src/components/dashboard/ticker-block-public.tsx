"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useViewportScale } from "@/lib/canvas-scale"

interface TickerBlockProps {
    content: any
}

export function TickerBlockPublic({ content }: TickerBlockProps) {
    const scale = useViewportScale()

    return (
        <div
            className={cn(
                "rounded-none shadow-none border border-black/10 dark:border-white/10 relative overflow-hidden bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm",
                "whitespace-nowrap border-y shadow-none transition-all duration-500",
                content.style === 'modern' && "bg-white dark:bg-zinc-950 rounded-none border border-black dark:border-white",
                content.style === 'naked' && "bg-transparent border-none shadow-none backdrop-blur-none"
            )}
            style={{
                backgroundColor: content.style === 'naked' ? 'transparent' : content.bgColor,
                minWidth: Math.round(300 * scale),
                padding: `${Math.round(24 * scale)}px ${Math.round(40 * scale)}px`,
            }}
        >
            <motion.div
                animate={{
                    x: content.direction === 'right' ? ["-50%", "0%"] : ["0%", "-50%"]
                }}
                transition={{
                    duration: content.speed || 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="inline-block"
            >
                <span
                    className={cn(
                        "font-black uppercase tracking-[0.2em]",
                        content.style === 'neon' && "animate-pulse"
                    )}
                    style={{ fontSize: Math.round(14 * scale), paddingLeft: Math.round(16 * scale), paddingRight: Math.round(16 * scale) }}
                >
                    {content.text} {content.text} {content.text} {content.text}
                </span>
            </motion.div>
        </div>
    )
}
