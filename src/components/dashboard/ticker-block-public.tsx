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
                "py-3 overflow-hidden whitespace-nowrap shadow-2xl min-w-[300px] transition-all duration-500",
                content.style === 'neon' && "border-y border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]",
                content.style === 'glass' && "backdrop-blur-md border-y border-white/10"
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
