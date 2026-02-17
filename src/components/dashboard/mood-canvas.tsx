"use client"

import { motion, useDragControls } from "framer-motion"
import { updateMoodBlockLayout, deleteMoodBlock } from "@/actions/profile"
import { Trash2, GripHorizontal, RotateCw, Instagram, Twitter, Github, Linkedin, Youtube, MessageSquare, Link as LinkIcon } from "lucide-react"
import { DiscordIcon, TikTokIcon, SpotifyIcon, TwitchIcon, PinterestIcon } from "@/components/icons"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const ICONS: Record<string, any> = {
    instagram: Instagram,
    twitter: Twitter,
    discord: DiscordIcon,
    tiktok: TikTokIcon,
    spotify: SpotifyIcon,
    twitch: TwitchIcon,
    pinterest: PinterestIcon,
    github: Github,
    linkedin: Linkedin,
    youtube: Youtube,
    custom: LinkIcon
}

interface MoodCanvasProps {
    blocks: any[]
    profile: any
}

export function MoodCanvas({ blocks, profile }: MoodCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null)
    const [maxZ, setMaxZ] = useState(10)
    const [isSaving, setIsSaving] = useState(false)

    const isDark = profile.theme === 'dark'
    const bgColor = isDark ? '#050505' : (profile.backgroundColor || '#fafafa')
    const primaryColor = profile.primaryColor || (isDark ? '#fff' : '#18181b')

    // Sync maxZ with blocks changes
    useEffect(() => {
        if (blocks.length > 0) {
            const currentMax = Math.max(...blocks.map(b => b.zIndex || 1))
            setMaxZ(prev => Math.max(prev, currentMax))
        }
    }, [blocks])

    const bringToFront = async (blockId: string) => {
        const newZ = maxZ + 1
        setMaxZ(newZ)
        setIsSaving(true)
        await updateMoodBlockLayout(blockId, { zIndex: newZ })
        setIsSaving(false)
    }

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-full overflow-hidden cursor-crosshair transition-colors duration-500"
            style={{ backgroundColor: bgColor, color: primaryColor }}
        >
            {/* Saving Indicator */}
            <div className={cn(
                "absolute top-20 right-8 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 transition-all duration-300 pointer-events-none",
                isSaving ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            )}>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sincronizando...</span>
            </div>
            {/* Canvas Grid/Background */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }}
            />

            <div className="relative w-full h-full">
                {blocks.map((block) => (
                    <CanvasItem
                        key={block.id}
                        block={block}
                        canvasRef={canvasRef}
                        onInteract={() => bringToFront(block.id)}
                        onSavingStart={() => setIsSaving(true)}
                        onSavingEnd={() => setIsSaving(false)}
                    />
                ))}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold tracking-widest uppercase text-zinc-400">
                Free Movement Canvas
            </div>
        </div>
    )
}

function SocialBlock({ content }: { content: any }) {
    const Icon = ICONS[content.platform] || LinkIcon
    const { style, label } = content

    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 transition-all duration-300 pointer-events-none shadow-xl",
            style === 'tag' && "bg-[#fefefe] dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-[2px] border border-zinc-200 dark:border-zinc-700 border-l-[6px] border-l-black dark:border-l-white",
            style === 'glass' && "bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 text-current",
            style === 'minimal' && "bg-transparent text-current font-black tracking-tighter text-xl",
            style === 'neon' && "bg-black text-green-400 rounded-full border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
        )}>
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                style === 'minimal' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-100 dark:bg-zinc-700/50"
            )}>
                <Icon className="w-4 h-4" />
            </div>
            <span className={cn(
                "text-sm font-bold",
                style === 'tag' && "font-serif italic",
                style === 'minimal' && "uppercase tracking-widest text-[10px]"
            )}>
                {label}
            </span>
        </div>
    )
}

// Helper to keep rescue positions stable
const stableHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
};

function CanvasItem({ block, canvasRef, onInteract, onSavingStart, onSavingEnd }: {
    block: any,
    canvasRef: React.RefObject<HTMLDivElement | null>,
    onInteract: () => void,
    onSavingStart: () => void,
    onSavingEnd: () => void
}) {
    // block.x and block.y are now percentages (0-100)
    const [isDragging, setIsDragging] = useState(false)
    const [localRotation, setLocalRotation] = useState(block.rotation || 0)

    const handleDragStart = () => {
        setIsDragging(true)
        onInteract()
    }

    const handleDragEnd = async (event: any, info: any) => {
        setIsDragging(false)
        if (!canvasRef.current) return

        const canvasRect = canvasRef.current.getBoundingClientRect()

        // Convert current pixel position to percentage
        const xPercent = (info.point.x - canvasRect.left) / canvasRect.width * 100
        const yPercent = (info.point.y - canvasRect.top) / canvasRect.height * 100

        onSavingStart()
        await updateMoodBlockLayout(block.id, {
            x: Math.max(0, Math.min(100, xPercent)),
            y: Math.max(0, Math.min(100, yPercent))
        })
        onSavingEnd()
    }

    const handleDelete = async () => {
        if (confirm("Deletar item?")) {
            onSavingStart()
            await deleteMoodBlock(block.id)
            onSavingEnd()
        }
    }

    const rotate = async () => {
        const newRotation = (localRotation + 15) % 360
        setLocalRotation(newRotation)
        onSavingStart()
        await updateMoodBlockLayout(block.id, { rotation: newRotation })
        onSavingEnd()
    }

    // Auto-rescue logic: if blocks are in pixels (>100), bring them to a stable center area
    const hash = stableHash(block.id);
    const displayX = block.x > 100 ? (20 + (hash % 60)) : block.x
    const displayY = block.y > 100 ? (20 + (hash % 60)) : block.y

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            initial={false}
            animate={{
                left: `${displayX}%`,
                top: `${displayY}%`,
                rotate: localRotation,
                zIndex: isDragging ? 999 : (block.zIndex || 1)
            }}
            className={cn(
                "absolute cursor-grab active:cursor-grabbing select-none"
            )}
            style={{ zIndex: isDragging ? 999 : (block.zIndex || 1) }}
        >
            <div className="group relative">
                {/* Control Overlay */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-50">
                    <button onClick={rotate} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <RotateCw className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                    <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800" />
                    <button onClick={handleDelete} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group/del">
                        <Trash2 className="w-3.5 h-3.5 text-zinc-500 group-hover/del:text-red-500" />
                    </button>
                </div>

                {/* Block Content */}
                <div className={cn(
                    "transition-transform duration-200",
                    isDragging && "scale-105 rotate-2"
                )}>
                    {block.type === 'text' && (
                        <div
                            className={cn(
                                "p-6 shadow-2xl transition-all duration-300 min-w-[200px] max-w-[400px]",
                                (block.content as any).style === 'postit' && "bg-[#ffff88] text-zinc-900 rotate-[-1deg] shadow-yellow-900/10 rounded-sm border-b-[15px] border-b-black/5",
                                (block.content as any).style === 'ripped' && "bg-white text-zinc-900 shadow-zinc-300/50",
                                (block.content as any).style === 'typewriter' && "bg-transparent dark:text-white border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-none",
                                (block.content as any).style === 'simple' && "bg-white dark:bg-zinc-900 dark:text-white rounded-lg border border-zinc-100 dark:border-zinc-800"
                            )}
                            style={{
                                backgroundColor: (block.content as any).bgColor,
                                clipPath: (block.content as any).style === 'ripped' ? 'polygon(0% 2%, 98% 0%, 100% 100%, 2% 98%, 0% 50%)' : 'none',
                                textAlign: (block.content as any).align as any || 'center'
                            }}
                        >
                            <p className={cn(
                                "leading-relaxed transition-all",
                                (block.content as any).fontSize === 'sm' && "text-sm",
                                (block.content as any).fontSize === 'xl' && "text-2xl font-serif italic",
                                (block.content as any).fontSize === '3xl' && "text-4xl font-black tracking-tighter font-mono uppercase",
                                (block.content as any).style === 'typewriter' && "font-mono underline decoration-dotted"
                            )}>
                                {(block.content as any).text}
                            </p>

                            {(block.content as any).style === 'simple' && (
                                <div className="mt-4 flex justify-center">
                                    <div className="w-8 h-[2px] bg-zinc-200 dark:bg-zinc-800" />
                                </div>
                            )}
                        </div>
                    )}

                    {block.type === 'gif' && (
                        <div className="p-2 bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl border border-zinc-100 dark:border-zinc-800 group-hover:rotate-1 transition-transform">
                            <img src={(block.content as any).url} alt="gif" className="rounded-xl w-48 h-auto pointer-events-none" />
                        </div>
                    )}

                    {block.type === 'tape' && (
                        <div
                            className="w-32 h-8 shadow-sm backdrop-blur-[2px]"
                            style={{
                                backgroundColor: (block.content as any).color,
                                backgroundImage: (block.content as any).pattern === 'dots' ? 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)' : 'none',
                                backgroundSize: '4px 4px',
                                clipPath: 'polygon(2% 0%, 98% 2%, 100% 100%, 0% 98%)'
                            }}
                        />
                    )}

                    {block.type === 'weather' && (
                        <div className="p-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 rounded-sm shadow-sm min-w-[150px] text-center space-y-1">
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Currently</p>
                            <p className="text-sm font-serif italic text-zinc-900 dark:text-white">{(block.content as any).vibe}</p>
                            <div className="h-[1px] w-4 bg-black/20 dark:bg-white/20 mx-auto" />
                            <p className="text-[9px] font-medium opacity-60 text-zinc-600 dark:text-zinc-400">{(block.content as any).location}</p>
                        </div>
                    )}

                    {block.type === 'media' && (
                        <div className={cn(
                            "p-3 py-6 min-w-[120px] max-w-[180px] shadow-2xl relative transition-transform",
                            (block.content as any).category === 'book' ? "bg-[#f5f5dc] text-zinc-800 rounded-r-md border-l-4 border-zinc-400" : "bg-black text-white rounded-md border-2 border-zinc-800"
                        )}>
                            <div className="absolute top-2 left-2 text-[8px] opacity-40 uppercase font-black">
                                {(block.content as any).category}
                            </div>
                            <p className="text-xs font-black text-center mt-2 leading-tight uppercase font-mono tracking-tighter">
                                {(block.content as any).title}
                            </p>
                            <div className="mt-4 pt-4 border-t border-current/10 text-[9px] italic text-center opacity-70">
                                {(block.content as any).review}
                            </div>
                        </div>
                    )}

                    {block.type === 'doodle' && (
                        <div className="pointer-events-none filter drop-shadow-xl">
                            <img
                                src={(block.content as any).image}
                                alt="doodle"
                                className="w-48 h-auto dark:invert contrast-125 brightness-110"
                            />
                        </div>
                    )}

                    {block.type === 'social' && <SocialBlock content={block.content} />}

                    {block.type === 'music' && (
                        <div className="w-80 p-2 bg-zinc-950 rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">
                            <iframe
                                src={`https://open.spotify.com/embed/track/${(block.content as any).trackId}`}
                                width="100%" height="80" frameBorder="0" allow="encrypted-media"
                                className="rounded-2xl pointer-events-none opacity-90"
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
