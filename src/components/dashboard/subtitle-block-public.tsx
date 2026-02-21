"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useViewportScale } from "@/lib/canvas-scale"

interface SubtitleBlockProps {
    content: any
}

export function SubtitleBlockPublic({ content }: SubtitleBlockProps) {
    const scale = useViewportScale()

    return (
        <div className="w-full h-full flex flex-col justify-center" style={{ padding: Math.round(24 * scale) }}>
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
                    "w-full h-full flex flex-col justify-center shadow-none relative overflow-hidden transition-colors duration-500 bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm border border-black/10 dark:border-white/10",
                    content.style === 'vhs' && "bg-[#050505]",
                    content.style === 'minimal' && "bg-transparent border-none rounded-none font-normal tracking-tight",
                    content.style === 'modern' && "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
                    content.style === 'naked' && "bg-transparent border-none shadow-none backdrop-blur-none"
                )}
                style={{
                    backgroundColor: (content.style === 'minimal' || content.style === 'naked') ? 'transparent' : content.bgColor,
                    padding: `${Math.round(24 * scale)}px ${Math.round(40 * scale)}px`,
                    borderLeftWidth: content.style === 'vhs' ? Math.round(8 * scale) : undefined,
                    borderLeftColor: content.style === 'vhs' ? '#dc2626' : undefined,
                    borderRadius: content.style === 'modern' ? Math.round(16 * scale) : undefined
                }}
            >
                <p
                    className={cn(
                        "text-center leading-relaxed whitespace-pre-wrap",
                        content.style === 'vhs' && "font-mono font-bold italic tracking-tighter uppercase",
                        content.style === 'minimal' && "font-serif italic",
                        content.style === 'modern' && "font-sans font-medium"
                    )}
                    style={{ color: content.textColor, fontSize: content.style === 'minimal' ? Math.round(20 * scale) : Math.round(16 * scale) }}
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
                            "inline-block align-middle",
                            content.cursorType === 'block' && "w-[0.5em] h-[1.1em] bg-current",
                            content.cursorType === 'bar' && "w-[0.1em] h-[1.2em] bg-current",
                            content.cursorType === 'underline' && "w-[0.6em] h-[0.1em] bg-current translate-y-[0.4em]"
                        )}
                        style={{ marginLeft: '0.125em' }}
                    />
                </p>

                {content.style === 'vhs' && (
                    <div className="absolute opacity-50 flex items-center" style={{ top: Math.round(8 * scale), right: Math.round(16 * scale), gap: Math.round(4 * scale) }}>
                        <div className="bg-red-500 animate-[pulse_0.5s_infinite]" style={{ width: Math.round(4 * scale), height: Math.round(12 * scale) }} />
                        <span className="font-mono text-white" style={{ fontSize: Math.round(8 * scale) }}>PLAY</span>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
