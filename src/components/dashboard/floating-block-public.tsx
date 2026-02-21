"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useViewportScale } from "@/lib/canvas-scale"

interface FloatingBlockProps {
    content: any
}

export function FloatingBlockPublic({ content }: FloatingBlockProps) {
    const scale = useViewportScale()

    return (
        <motion.div
            animate={{
                y: [0, -10, 0],
                rotate: [0, 1, -1, 0]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={cn(
                "bg-white/5 backdrop-blur-sm border border-white/10 rounded-full shadow-2xl",
                content.style === 'ghost' && "bg-transparent border-none shadow-none"
            )}
            style={{
                color: content.textColor,
                backgroundColor: content.bgColor,
                padding: `${Math.round(16 * scale)}px ${Math.round(24 * scale)}px`
            }}
        >
            <p className="font-medium tracking-tight whitespace-nowrap" style={{ fontSize: Math.round(18 * scale) }}>
                {content.text}
            </p>
        </motion.div>
    )
}
