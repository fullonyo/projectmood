"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SubtitleBlockProps {
    content: any
}

export function SubtitleBlockPublic({ content }: SubtitleBlockProps) {
    return (
        <div className="p-6 max-w-[450px]">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 1 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: content.speed || 0.05,
                        }
                    }
                }}
                className={cn(
                    "px-10 py-6 shadow-none relative overflow-hidden transition-all duration-500 bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm border border-black/10 dark:border-white/10",
                    content.style === 'vhs' && "bg-[#050505] border-l-[8px] border-l-red-600",
                    content.style === 'minimal' && "bg-transparent border-none rounded-none text-xl font-normal tracking-tight",
                    content.style === 'modern' && "bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"
                )}
                style={{
                    backgroundColor: content.style !== 'minimal' ? content.bgColor : 'transparent',
                }}
            >
                <p
                    className={cn(
                        "text-center leading-relaxed whitespace-pre-wrap",
                        content.style === 'vhs' && "font-mono font-bold italic tracking-tighter uppercase",
                        content.style === 'minimal' && "font-serif italic",
                        content.style === 'modern' && "font-sans font-medium"
                    )}
                    style={{ color: content.textColor }}
                >
                    {(content.text || "").split("").map((char: string, i: number) => (
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
                            "inline-block ml-0.5 align-middle",
                            content.cursorType === 'block' && "w-[0.5em] h-[1.1em] bg-current",
                            content.cursorType === 'bar' && "w-[2px] h-[1.2em] bg-current",
                            content.cursorType === 'underline' && "w-[0.6em] h-[2px] bg-current translate-y-[0.4em]"
                        )}
                    />
                </p>

                {content.style === 'vhs' && (
                    <div className="absolute top-2 right-4 flex gap-1 opacity-50">
                        <div className="w-1 h-3 bg-red-500 animate-[pulse_0.5s_infinite]" />
                        <span className="text-[8px] font-mono text-white">PLAY</span>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
