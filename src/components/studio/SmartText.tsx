"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import React, { useMemo } from "react"
import {
    Smile, Meh, Frown, Sparkles, Flame, Coffee, PartyPopper, Moon, Heart, Ghost,
    Quote as QuoteIcon
} from "lucide-react"

export type TextBehavior = 'static' | 'ticker' | 'typewriter' | 'floating' | 'quote' | 'status' | 'dialogue'

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
    cursorType?: 'block' | 'bar' | 'underline' | 'none'
    author?: string
    showQuotes?: boolean
    icon?: string
    className?: string
    dialogueStyle?: 'novel' | 'script' | 'minimal'
    dialogueFormat?: 'alternating' | 'classic'
    nameStyle?: 'bold' | 'italic' | 'none'
    dialogueLines?: { name: string; text: string }[]
    typingRhythm?: 'steady' | 'organic'
    revealMode?: 'char' | 'word'
}

/**
 * SmartText - Signature & Ghost Edition 🖋️
 * Removendo containers e focando na tipografia como arte aplicada ao canvas.
 */
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
    className,
    dialogueStyle = 'novel',
    dialogueFormat = 'alternating',
    nameStyle = 'bold',
    dialogueLines = [],
    typingRhythm = 'steady',
    revealMode = 'char'
}: SmartTextProps) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])
    
    // Resolve font size with direct pixel values
    const actualFontSize = useMemo(() => {
        if (typeof fontSize === 'number') return fontSize
        switch (fontSize) {
            case 'sm': return 14
            case 'base': return 18
            case 'xl': return 32
            case '3xl': return 56
            default: return 18
        }
    }, [fontSize])

    const baseClasses = cn(
        "leading-relaxed whitespace-pre-wrap transition-all duration-700 select-none",
        align === 'center' ? "text-center" : align === 'right' ? "text-right" : "text-left",
        style === 'vhs' && "font-mono font-bold italic tracking-tighter uppercase opacity-80",
        style === 'clean' && "font-sans font-light tracking-tight",
        style === 'neon' && "drop-shadow-[0_0_8px_currentColor]",
        className
    )

    const textStyle = {
        fontSize: actualFontSize,
        color: textColor,
    }

    // --- BEHAVIORS ---

    if (behavior === 'ticker') {
        const tickerDuration = speed < 1 ? 20 : speed
        return (
            <div className="w-full h-full flex items-center overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: direction === 'right' ? ["-33.3%", "0%"] : ["0%", "-33.3%"]
                    }}
                    transition={{
                        duration: tickerDuration,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="flex whitespace-nowrap"
                >
                    {[1, 2, 3].map((i) => (
                        <span
                            key={i}
                            className={cn("font-black uppercase tracking-[0.3em] px-12", baseClasses)}
                            style={textStyle}
                        >
                            {text}
                        </span>
                    ))}
                </motion.div>
            </div>
        )
    }

    if (behavior === 'typewriter') {
        const typewriterSpeed = speed > 1 ? 0.05 : speed
        const isOrganic = typingRhythm === 'organic'
        const baseDelay = typewriterSpeed * (isOrganic ? 0.8 : 1)

        const content = (
            <p className={baseClasses} style={textStyle}>
                {mounted ? (
                    <motion.span>
                        {text.split("").map((char, i) => (
                            <motion.span
                                key={i}
                                initial={{ display: "none" }}
                                animate={{ display: "inline" }}
                                transition={{
                                    delay: i * (isOrganic ? (baseDelay + Math.random() * typewriterSpeed) : baseDelay),
                                    duration: 0
                                }}
                            >
                                {char}
                            </motion.span>
                        ))}
                        
                        {cursorType !== 'none' && (
                            <motion.span
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                className={cn(
                                    "inline-block align-middle ml-[2px]",
                                    cursorType === 'block' && "w-[0.5em] h-[1.1em] bg-current",
                                    cursorType === 'bar' && "w-[1.5px] h-[1.2em] bg-current",
                                    cursorType === 'underline' && "w-[0.6em] h-[2px] bg-current translate-y-[0.2em]"
                                )}
                            />
                        )}
                    </motion.span>
                ) : text}
            </p>
        )
        
        return (
            <div className="w-full h-full flex flex-col justify-center pointer-events-none">
                {content}
            </div>
        )
    }

    if (behavior === 'floating') {
        const floatingDuration = speed < 0.5 ? 4 : speed
        return (
            <motion.div
                animate={{
                    y: [0, -15, 0],
                    rotate: [0, 0.5, -0.5, 0]
                }}
                transition={{
                    duration: floatingDuration,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-full h-full flex flex-col justify-center pointer-events-none"
            >
                <p className={baseClasses} style={textStyle}>
                    {text}
                </p>
            </motion.div>
        )
    }

    if (behavior === 'quote') {
        return (
            <div className="w-full h-full flex flex-col justify-center px-12 relative pointer-events-none">
                {showQuotes && (
                    <QuoteIcon
                        className="absolute -top-2 left-4 w-8 h-8 opacity-5"
                        style={{ color: textColor }}
                    />
                )}
                <div className="space-y-6">
                    <p className={cn(baseClasses, "italic font-serif leading-relaxed opacity-90")} style={textStyle}>
                        {text}
                    </p>
                    {author && (
                        <div className="flex items-center gap-4 justify-center opacity-40">
                            <div className="h-[1px] w-6 bg-current" />
                            <span className="text-[10px] uppercase font-black tracking-[0.4em]">
                                {author}
                            </span>
                            <div className="h-[1px] w-6 bg-current" />
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (behavior === 'dialogue') {
        const rawLines = text.split('\n').filter(l => l.trim() !== '')
        const parsedLines = (dialogueLines || []).length > 0 
            ? dialogueLines 
            : rawLines.map(line => {
                const hasCharacter = line.includes(':')
                const [char, ...rest] = hasCharacter ? line.split(':') : ['', line]
                return { name: char.trim(), text: hasCharacter ? rest.join(':').trim() : line.trim() }
            })
        
        return (
            <div className="w-full h-full flex flex-col justify-center px-12 space-y-12 pointer-events-none">
                {parsedLines?.map((line, idx) => {
                    const hasCharacter = line.name !== ''
                    const contentText = line.text
                    const isEven = idx % 2 === 0
                    const isAlternating = dialogueFormat === 'alternating'
                    
                    return (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: isAlternating ? (isEven ? -15 : 15) : -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
                            className={cn(
                                "flex flex-col gap-2 transition-all duration-700",
                                isAlternating ? (isEven ? "items-start" : "items-end") : "items-start"
                            )}
                        >
                            {hasCharacter && nameStyle !== 'none' && (
                                <span 
                                    className={cn(
                                        "text-[10px] uppercase tracking-[0.4em] opacity-30 transition-all duration-700",
                                        nameStyle === 'bold' && "font-black",
                                        nameStyle === 'italic' && "font-medium italic"
                                    )}
                                    style={{ color: textColor }}
                                >
                                    {line.name}
                                </span>
                            )}
                            <p 
                                className={cn(
                                    baseClasses, 
                                    "leading-relaxed relative transition-all duration-700",
                                    dialogueStyle === 'novel' && "font-serif italic opacity-90",
                                    dialogueStyle === 'script' && "font-mono uppercase tracking-tight opacity-70",
                                    dialogueStyle === 'minimal' && "font-sans font-light",
                                    isAlternating 
                                        ? (isEven ? "text-left pl-6 border-l-[1px] border-current/10" : "text-right pr-6 border-r-[1px] border-current/10") 
                                        : "text-left pl-6 border-l-[1px] border-current/10"
                                )} 
                                style={textStyle}
                            >
                                {dialogueStyle === 'novel' && !contentText.startsWith('—') && !contentText.startsWith('-') ? `— ${contentText}` : contentText}
                            </p>
                        </motion.div>
                    )
                })}
            </div>
        )
    }

    if (behavior === 'status') {
        const StatusIcon = STATUS_ICONS[icon as keyof typeof STATUS_ICONS] || Smile
        return (
            <div className="w-full h-full flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-8 transition-all group">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                        <StatusIcon strokeWidth={1.5} style={{ width: 42, height: 42, color: textColor }} />
                    </motion.div>
                    <div className="bg-current w-[0.5px] h-10 opacity-10" />
                    <p className={cn(baseClasses, "font-black tracking-[0.2em] uppercase italic opacity-80")} style={{ fontSize: 18, color: textColor }}>
                        {text}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col justify-center pointer-events-none">
            <p className={baseClasses} style={textStyle}>
                {text}
            </p>
        </div>
    )
}
