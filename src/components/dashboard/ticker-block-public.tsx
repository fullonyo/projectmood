"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TickerBlockProps {
    content: any
}

export function TickerBlockPublic({ content }: TickerBlockProps) {
    return (
        <div
            className={cn(
                "p-6 rounded-none shadow-none border border-black/10 dark:border-white/10 relative overflow-hidden bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm",
                "whitespace-nowrap border-y border-black/10 dark:border-white/10 shadow-none min-w-[300px] transition-all duration-500 bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm",
                "px-10 py-6 shadow-none border border-black/10 dark:border-white/10 relative overflow-hidden transition-all duration-500 bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm",
                content.style === 'modern' && "bg-white dark:bg-zinc-950 rounded-none border border-black dark:border-white"
            )}
            style={{ backgroundColor: content.bgColor }}
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
                        "text-sm font-black uppercase tracking-[0.2em] px-4",
                        content.style === 'neon' && "animate-pulse"
                    )}
                >
                    {content.text} {content.text} {content.text} {content.text}
                </span>
            </motion.div>
        </div>
    )
}
