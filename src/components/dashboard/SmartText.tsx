"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import React from "react"
import {
    Smile, Meh, Frown, Sparkles, Flame, Coffee, PartyPopper, Moon, Heart, Ghost,
    Quote as QuoteIcon
} from "lucide-react"

export type TextBehavior = 'static' | 'ticker' | 'typewriter' | 'floating' | 'quote' | 'status'

const STATUS_ICONS = {
    Smile, Meh, Frown, Sparkles, Flame, Coffee, PartyPopper, Moon, Heart, Ghost
}

interface SmartTextProps {
    text: string
    behavior?: TextBehavior
    style?: string
    fontSize?: 'sm' | 'base' | 'xl' | '3xl' | number
    textColor?: string
    align?: 'left' | 'center' | 'right'
    speed?: number
    direction?: 'left' | 'right'
    cursorType?: 'block' | 'bar' | 'underline'
    author?: string
    showQuotes?: boolean
    icon?: string
    className?: string
}

export function SmartText({
    text,
    behavior = 'static',
    style = 'classic',
    fontSize = 'base',
    textColor,
    align = 'center',
    speed = 0.05,
    direction = 'left',
    cursorType = 'block',
    author,
    showQuotes = true,
    icon,
    className
}: SmartTextProps) {
    // Map named sizes to pixels - REMOVED viewport scale to avoid double scaling
    const getFontSize = () => {
        if (typeof fontSize === 'number') return fontSize
        switch (fontSize) {
            case 'sm': return 14
            case 'base': return 18
            case 'xl': return 30
            case '3xl': return 48
            default: return 18
        }
    }

    const baseClasses = cn(
        "leading-relaxed whitespace-pre-wrap transition-colors duration-500",
        align === 'center' ? "text-center" : align === 'right' ? "text-right" : "text-left",
        style === 'vhs' && "font-mono font-bold italic tracking-tighter uppercase",
        style === 'typewriter' && "font-mono underline decoration-dotted",
        style === 'clean' && "font-sans font-medium tracking-tight",
        className
    )

    const textStyle = {
        fontSize: getFontSize(),
        color: textColor
    }

    if (behavior === 'ticker') {
        // Guard: If speed is too low (likely from typewriter behavior), use a sane default
        const tickerDuration = speed < 1 ? 20 : speed
        return (
            <div className="w-full h-full flex flex-col justify-center overflow-hidden">
                <motion.div
                    animate={{
                        x: direction === 'right' ? ["-50%", "0%"] : ["0%", "-50%"]
                    }}
                    transition={{
                        duration: tickerDuration,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="inline-block whitespace-nowrap"
                >
                    <span
                        className={cn("font-black uppercase tracking-[0.2em] px-4", style === 'neon' && "animate-pulse")}
                        style={textStyle}
                    >
                        {text} {text} {text} {text}
                    </span>
                </motion.div>
            </div>
        )
    }

    if (behavior === 'typewriter') {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 1 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: speed || 0.05,
                        }
                    }
                }}
                className="w-full h-full flex flex-col justify-center"
            >
                <p className={baseClasses} style={textStyle}>
                    {(text || "").split("").map((char, i) => (
                        <motion.span
                            key={i}
                            variants={{
                                hidden: { opacity: 0, display: 'none' },
                                visible: { opacity: 1, display: 'inline' }
                            }}
                        >
                            {char}
                        </motion.span>
                    ))}
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className={cn(
                            "inline-block align-middle",
                            cursorType === 'block' && "w-[0.5em] h-[1.1em] bg-current",
                            cursorType === 'bar' && "w-[0.1em] h-[1.2em] bg-current",
                            cursorType === 'underline' && "w-[0.6em] h-[0.1em] bg-current translate-y-[0.4em]"
                        )}
                        style={{ marginLeft: '0.125em' }}
                    />
                </p>
            </motion.div>
        )
    }

    if (behavior === 'floating') {
        // Guard: If speed is too low (likely from typewriter behavior), use a sane default
        const floatingDuration = speed < 0.5 ? 4 : speed
        return (
            <motion.div
                animate={{
                    y: [0, -10, 0],
                    rotate: [0, 1, -1, 0]
                }}
                transition={{
                    duration: floatingDuration,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-full h-full flex flex-col justify-center"
            >
                <p className={baseClasses} style={textStyle}>
                    {text}
                </p>
            </motion.div>
        )
    }

    if (behavior === 'quote') {
        return (
            <div className="w-full h-full flex flex-col justify-center px-8 relative group">
                {showQuotes && (
                    <QuoteIcon
                        className="absolute top-2 left-2 w-6 h-6 opacity-10 group-hover:opacity-20 transition-opacity"
                        style={{ color: textColor }}
                    />
                )}
                <div className="space-y-4">
                    <p className={cn(baseClasses, "italic font-serif leading-relaxed")} style={textStyle}>
                        {text}
                    </p>
                    {author && (
                        <div className="flex items-center gap-3 justify-center">
                            <div className="h-[1px] w-8 bg-current opacity-20" />
                            <span className="text-[10px] uppercase font-black tracking-[0.3em] opacity-60">
                                {author}
                            </span>
                            <div className="h-[1px] w-8 bg-current opacity-20" />
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (behavior === 'status') {
        const StatusIcon = STATUS_ICONS[icon as keyof typeof STATUS_ICONS] || Smile
        return (
            <div className="w-full h-full flex items-center justify-center p-4">
                <div className="bg-white/5 dark:bg-zinc-900/10 backdrop-blur-xl border border-white/10 flex items-center transition-all hover:scale-105 group p-6 gap-6 rounded-2xl">
                    <div className="text-zinc-900 dark:text-white animate-bounce group-hover:animate-none group-hover:scale-125 transition-transform">
                        <StatusIcon strokeWidth={2.5} style={{ width: 32, height: 32, color: textColor }} />
                    </div>
                    <div className="bg-zinc-400/20 w-[1px]" style={{ height: 32 }} />
                    <p className={cn(baseClasses, "font-black tracking-tight uppercase italic")} style={{ fontSize: 16, color: textColor }}>
                        {text}
                    </p>
                </div>
            </div>
        )
    }

    // Default: Static
    return (
        <div className="w-full h-full flex flex-col justify-center">
            <p className={baseClasses} style={textStyle}>
                {text}
            </p>
        </div>
    )
}
