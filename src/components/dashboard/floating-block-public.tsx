"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FloatingBlockProps {
    content: any
}

export function FloatingBlockPublic({ content }: FloatingBlockProps) {
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
                "px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full shadow-2xl",
                content.style === 'ghost' && "bg-transparent border-none shadow-none"
            )}
            style={{
                color: content.textColor,
                backgroundColor: content.bgColor
            }}
        >
            <p className="text-lg font-medium tracking-tight whitespace-nowrap">
                {content.text}
            </p>
        </motion.div>
    )
}
