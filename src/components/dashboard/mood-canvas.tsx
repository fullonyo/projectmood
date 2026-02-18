"use client"

import { motion } from "framer-motion"
import { updateMoodBlockLayout, deleteMoodBlock } from "@/actions/profile"
import { Trash2, RotateCw, Instagram, Twitter, Github, Linkedin, Youtube, Link as LinkIcon, Pencil, Move } from "lucide-react"
import { DiscordIcon, TikTokIcon, SpotifyIcon, TwitchIcon, PinterestIcon, SteamIcon } from "@/components/icons"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const ICONS: Record<string, any> = {
    instagram: Instagram,
    twitter: Twitter,
    discord: DiscordIcon,
    tiktok: TikTokIcon,
    steam: SteamIcon,
    spotify: SpotifyIcon,
    twitch: TwitchIcon,
    pinterest: PinterestIcon,
    github: Github,
    linkedin: Linkedin,
    youtube: Youtube,
    custom: LinkIcon
}

const themeConfigs: Record<string, any> = {
    light: {
        bg: '#fafafa',
        primary: '#18181b',
        grid: 'radial-gradient(currentColor 1px, transparent 1px)',
        bgSize: '30px 30px',
        opacity: 'opacity-[0.05]'
    },
    dark: {
        bg: '#050505',
        primary: '#ffffff',
        grid: 'radial-gradient(currentColor 1px, transparent 1px)',
        bgSize: '30px 30px',
        opacity: 'opacity-[0.08]'
    },
    vintage: {
        bg: '#f4ead5',
        primary: '#5d4037',
        grid: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        bgSize: '200px 200px',
        opacity: 'opacity-25'
    },
    notebook: {
        bg: '#ffffff',
        primary: '#1e3a8a',
        grid: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, transparent 79px, #fca5a5 1px, #fca5a5 2px, transparent 81px)',
        bgSize: '100% 30px',
        opacity: 'opacity-100'
    },
    blueprint: {
        bg: '#1a3a5f',
        primary: '#ffffff',
        grid: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        bgSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
        opacity: 'opacity-100'
    },
    canvas: {
        bg: '#e7e5e4',
        primary: '#44403c',
        grid: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20L0 20z\' fill=\'%23000\' fill-opacity=\'.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
        bgSize: '40px 40px',
        opacity: 'opacity-100'
    },
    cyberpunk: {
        bg: '#000000',
        primary: '#ff00ff',
        grid: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px), linear-gradient(0deg, rgba(255,0,255,0.03) 50%, transparent 50%)',
        bgSize: '40px 40px, 40px 40px, 100% 4px',
        opacity: 'opacity-100'
    }
}

interface MoodCanvasProps {
    blocks: any[]
    profile: any
    selectedId: string | null
    setSelectedId: (id: string | null) => void
    onUpdateBlock: (id: string, content: any) => void
}

export function MoodCanvas({ blocks, profile, selectedId, setSelectedId, onUpdateBlock }: MoodCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null)
    const [maxZ, setMaxZ] = useState(10)
    const [isSaving, setIsSaving] = useState(false)
    const [blockToDelete, setBlockToDelete] = useState<string | null>(null)

    const theme = profile.theme || 'light'
    const config = themeConfigs[theme] || themeConfigs.light
    const bgColor = config.bg
    const primaryColor = config.primary

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

    const handleCanvasClick = (e: React.MouseEvent) => {
        // Se o clique foi diretamente no fundo (container ou grid)
        const target = e.target as HTMLElement
        const isBackground = target === canvasRef.current ||
            target.id === 'canvas-grid-layer' ||
            target.classList.contains('canvas-items-wrapper')

        if (isBackground) {
            setSelectedId(null)
        }
    }

    return (
        <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="relative w-full h-full overflow-hidden cursor-crosshair transition-colors duration-1000"
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

            {/* Canvas Grid Layer */}
            <div
                id="canvas-grid-layer"
                className={cn(
                    "absolute inset-0 transition-opacity duration-1000",
                    config.opacity
                )}
                style={{
                    backgroundImage: config.grid,
                    backgroundSize: config.bgSize,
                    filter: theme === 'vintage' ? 'contrast(110%) brightness(105%) sepia(20%)' : 'none',
                }}
            />

            <div className="relative w-full h-full canvas-items-wrapper">
                {blocks.map((block) => (
                    <CanvasItem
                        key={block.id}
                        block={block}
                        canvasRef={canvasRef}
                        isSelected={selectedId === block.id}
                        profile={profile}
                        themeConfig={config}
                        onSelect={() => {
                            setSelectedId(block.id)
                            bringToFront(block.id)
                        }}
                        onUpdate={(content) => onUpdateBlock(block.id, content)}
                        onDeleteRequest={(id) => setBlockToDelete(id)}
                        onSavingStart={() => setIsSaving(true)}
                        onSavingEnd={() => setIsSaving(false)}
                    />
                ))}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold tracking-widest uppercase text-zinc-400">
                Lona de Criatividade Livre
            </div>

            <ConfirmModal
                isOpen={!!blockToDelete}
                onClose={() => setBlockToDelete(null)}
                onConfirm={async () => {
                    if (blockToDelete) {
                        setIsSaving(true)
                        await deleteMoodBlock(blockToDelete)
                        setIsSaving(false)
                        setBlockToDelete(null)
                    }
                }}
                title="Deletar Item?"
                message="Essa ação não pode ser desfeita. O item será removido permanentemente do seu mural."
                confirmText="Excluir"
                type="danger"
                isLoading={isSaving}
            />
        </div>
    )
}

function SocialBlock({ content }: { content: any }) {
    const Icon = ICONS[content.platform] || LinkIcon
    const { style, label } = content

    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 transition-all duration-300 pointer-events-none shadow-xl h-full w-full",
            style === 'tag' && "bg-[#fefefe] dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-[2px] border border-zinc-200 dark:border-zinc-700 border-l-[6px] border-l-black dark:border-l-white",
            style === 'glass' && "bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 text-current",
            style === 'minimal' && "bg-transparent text-current font-black tracking-tighter text-xl",
            style === 'neon' && "bg-black text-green-400 rounded-full border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
        )}>
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                style === 'minimal' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-100 dark:bg-zinc-700/50"
            )}>
                <Icon className="w-4 h-4" />
            </div>
            <span className={cn(
                "text-sm font-bold truncate",
                style === 'tag' && "font-serif italic",
                style === 'minimal' && "uppercase tracking-widest text-[10px]"
            )}>
                {label}
            </span>
        </div>
    )
}

const stableHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
};

function CanvasItem({ block, canvasRef, isSelected, onSelect, onUpdate, onSavingStart, onSavingEnd, profile, themeConfig, onDeleteRequest }: {
    block: any,
    canvasRef: React.RefObject<HTMLDivElement | null>,
    isSelected: boolean,
    onSelect: () => void,
    onUpdate: (content: any) => void,
    onSavingStart: () => void,
    onSavingEnd: () => void,
    profile: any,
    themeConfig: any,
    onDeleteRequest: (id: string) => void
}) {
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [localRotation, setLocalRotation] = useState(block.rotation || 0)
    const [size, setSize] = useState({
        width: block.width || 'auto',
        height: block.height || 'auto'
    })

    const handleDragStart = () => {
        setIsDragging(true)
        onSelect()
    }

    const handleDragEnd = async (event: any, info: any) => {
        setIsDragging(false)
        if (!canvasRef.current) return

        const canvasRect = canvasRef.current.getBoundingClientRect()

        // Calculate the new percentage position
        // We use the block's current position + the delta moved
        const deltaXPercent = (info.offset.x / canvasRect.width) * 100
        const deltaYPercent = (info.offset.y / canvasRect.height) * 100

        let newX = Math.max(0, Math.min(100, block.x + deltaXPercent))
        let newY = Math.max(0, Math.min(100, block.y + deltaYPercent))

        // Optimistic update
        onUpdate({ x: newX, y: newY })

        onSavingStart()
        await updateMoodBlockLayout(block.id, {
            x: newX,
            y: newY
        })
        onSavingEnd()
    }

    const handleResize = (event: any, info: any, corner: 'br' | 'bl' | 'tr' | 'tl') => {
        setIsResizing(true)
        const currentWidth = typeof size.width === 'number' ? size.width : event.target.parentElement.offsetWidth
        const currentHeight = typeof size.height === 'number' ? size.height : event.target.parentElement.offsetHeight

        let newWidth = currentWidth
        let newHeight = currentHeight

        if (corner === 'br') {
            newWidth = currentWidth + info.delta.x
            newHeight = currentHeight + info.delta.y
        } else if (corner === 'bl') {
            newWidth = currentWidth - info.delta.x
            newHeight = currentHeight + info.delta.y
        } else if (corner === 'tr') {
            newWidth = currentWidth + info.delta.x
            newHeight = currentHeight - info.delta.y
        } else if (corner === 'tl') {
            newWidth = currentWidth - info.delta.x
            newHeight = currentHeight - info.delta.y
        }

        setSize({
            width: Math.max(60, newWidth),
            height: Math.max(30, newHeight)
        })
    }

    const handleResizeEnd = async () => {
        setIsResizing(false)

        const updates = {
            width: typeof size.width === 'number' ? Math.round(size.width) : undefined,
            height: typeof size.height === 'number' ? Math.round(size.height) : undefined
        }

        // Optimistic update
        onUpdate(updates)

        onSavingStart()
        await updateMoodBlockLayout(block.id, updates)
        onSavingEnd()
    }

    const handleDelete = async () => {
        onDeleteRequest(block.id)
    }

    const rotate = async () => {
        const newRotation = (localRotation + 15) % 360
        setLocalRotation(newRotation)

        // Optimistic update
        onUpdate({ rotation: newRotation })

        onSavingStart()
        await updateMoodBlockLayout(block.id, { rotation: newRotation })
        onSavingEnd()
    }

    const hash = stableHash(block.id)
    const displayX = block.x
    const displayY = block.y

    return (
        <motion.div
            drag={!isResizing}
            dragMomentum={false}
            dragConstraints={canvasRef}
            dragElastic={0}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={(e) => {
                e.stopPropagation()
                onSelect()
            }}
            onDoubleClick={(e) => {
                e.stopPropagation()
                onSelect()
            }}
            initial={false}
            className={cn(
                "absolute select-none group touch-none",
                isSelected ? "cursor-default" : "cursor-grab active:cursor-grabbing"
            )}
            style={{
                left: `${displayX}%`,
                top: `${displayY}%`,
                width: size.width,
                height: size.height,
                rotate: localRotation,
                zIndex: isDragging || isSelected ? 999 : (block.zIndex || 1),
                boxShadow: isSelected ? `0 0 0 2px ${themeConfig.bg}, 0 0 0 4px ${profile.primaryColor || '#3b82f6'}` : 'none'
            }}
        >
            {/* Selection Border Outline (Standardized) */}
            {isSelected && (
                <div
                    className="absolute -inset-[3px] border-2 border-dashed rounded-lg pointer-events-none z-[1001]"
                    style={{ borderColor: profile.primaryColor || '#3b82f6', opacity: 0.5 }}
                />
            )}
            {/* Action Toolbar */}
            {isSelected && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-[1001] animate-in fade-in zoom-in duration-200 pointer-events-auto">
                    <button
                        onClick={onSelect}
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group/edit"
                        title="Editar"
                    >
                        <Pencil className="w-3.5 h-3.5 text-zinc-500 group-hover/edit:text-blue-500" />
                    </button>
                    <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800" />
                    <div className="p-1.5 cursor-move rounded-lg transition-colors" title="Mover">
                        <Move className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800" />
                    <button onClick={rotate} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Girar">
                        <RotateCw className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                    <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800" />
                    <button onClick={handleDelete} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group/del" title="Excluir">
                        <Trash2 className="w-3.5 h-3.5 text-zinc-500 group-hover/del:text-red-500" />
                    </button>
                </div>
            )}

            {/* Resize Handles (Corners) */}
            {isSelected && (
                <>
                    {/* BR */}
                    <div
                        onPointerDown={(e) => {
                            e.stopPropagation()
                            setIsResizing(true)
                        }}
                        onPointerUp={() => setIsResizing(false)}
                        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nwse-resize z-[1002] pointer-events-auto shadow-sm"
                    >
                        <motion.div
                            onPan={(e, i) => handleResize(e, i, 'br')}
                            onPanEnd={handleResizeEnd}
                            className="w-full h-full"
                        />
                    </div>
                    {/* BL */}
                    <div
                        onPointerDown={(e) => {
                            e.stopPropagation()
                            setIsResizing(true)
                        }}
                        onPointerUp={() => setIsResizing(false)}
                        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nesw-resize z-[1002] pointer-events-auto shadow-sm"
                    >
                        <motion.div
                            onPan={(e, i) => handleResize(e, i, 'bl')}
                            onPanEnd={handleResizeEnd}
                            className="w-full h-full"
                        />
                    </div>
                    {/* TR */}
                    <div
                        onPointerDown={(e) => {
                            e.stopPropagation()
                            setIsResizing(true)
                        }}
                        onPointerUp={() => setIsResizing(false)}
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nesw-resize z-[1002] pointer-events-auto shadow-sm"
                    >
                        <motion.div
                            onPan={(e, i) => handleResize(e, i, 'tr')}
                            onPanEnd={handleResizeEnd}
                            className="w-full h-full"
                        />
                    </div>
                    {/* TL */}
                    <div
                        onPointerDown={(e) => {
                            e.stopPropagation()
                            setIsResizing(true)
                        }}
                        onPointerUp={() => setIsResizing(false)}
                        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nwse-resize z-[1002] pointer-events-auto shadow-sm"
                    >
                        <motion.div
                            onPan={(e, i) => handleResize(e, i, 'tl')}
                            onPanEnd={handleResizeEnd}
                            className="w-full h-full"
                        />
                    </div>

                    {/* Selection Border Overlay */}
                    <div className="absolute inset-0 border border-blue-500/20 pointer-events-none" />
                </>
            )}

            <div className={cn(
                "w-full h-full transition-transform duration-200 overflow-hidden",
                isDragging && "scale-[1.02] rotate-1"
            )}>
                {block.type === 'text' && (
                    <div
                        className={cn(
                            "p-6 shadow-2xl transition-all duration-300 h-full w-full flex flex-col justify-center",
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
                    </div>
                )}

                {block.type === 'gif' && (
                    <div className="bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl border border-zinc-100 dark:border-zinc-800 h-full w-full overflow-hidden flex items-center justify-center">
                        {(block.content as any).url ? (
                            <img
                                src={(block.content as any).url}
                                alt="gif"
                                className="w-full h-full object-cover pointer-events-none"
                                key={(block.content as any).url} // Forçar re-render se a URL mudar
                            />
                        ) : (
                            <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 w-full h-full" />
                        )}
                    </div>
                )}

                {block.type === 'video' && (
                    <div className="bg-black shadow-2xl rounded-2xl overflow-hidden h-full w-full relative group/video">
                        <iframe
                            src={`https://www.youtube.com/embed/${(block.content as any).videoId}?autoplay=1&loop=1&playlist=${(block.content as any).videoId}&controls=0&rel=0&modestbranding=1`}
                            className="w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        {/* Overlay to allow interaction with the block instead of the iframe */}
                        <div className="absolute inset-0 bg-transparent z-10" />
                    </div>
                )}

                {block.type === 'tape' && (
                    <div
                        className="w-full h-full shadow-sm backdrop-blur-[2px]"
                        style={{
                            backgroundColor: (block.content as any).color,
                            backgroundImage: (block.content as any).pattern === 'dots' ? 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)' : 'none',
                            backgroundSize: '4px 4px',
                            clipPath: 'polygon(2% 0%, 98% 2%, 100% 100%, 0% 98%)'
                        }}
                    />
                )}

                {block.type === 'weather' && (
                    <div className="p-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 rounded-sm shadow-sm h-full w-full text-center space-y-1 flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Currently</p>
                        <p className="font-serif italic text-zinc-900 dark:text-white truncate">{(block.content as any).vibe}</p>
                        <div className="h-[1px] w-4 bg-black/20 dark:bg-white/20 mx-auto" />
                        <p className="text-[9px] font-medium opacity-60 text-zinc-600 dark:text-zinc-400">{(block.content as any).location}</p>
                    </div>
                )}

                {block.type === 'media' && (
                    <div className={cn(
                        "p-3 py-6 h-full w-full shadow-2xl relative transition-transform flex flex-col justify-center",
                        (block.content as any).category === 'book' ? "bg-[#f5f5dc] text-zinc-800 rounded-r-md border-l-4 border-zinc-400" : "bg-black text-white rounded-md border-2 border-zinc-800"
                    )}>
                        <div className="absolute top-2 left-2 text-[8px] opacity-40 uppercase font-black">
                            {(block.content as any).category}
                        </div>
                        <p className="text-xs font-black text-center mt-2 leading-tight uppercase font-mono tracking-tighter truncate">
                            {(block.content as any).title}
                        </p>
                    </div>
                )}

                {block.type === 'doodle' && (
                    <img
                        src={(block.content as any).image}
                        alt="doodle"
                        className="w-full h-full object-contain dark:invert contrast-125 brightness-110 pointer-events-none"
                    />
                )}

                {block.type === 'social' && <SocialBlock content={block.content} />}

                {block.type === 'music' && (
                    <div className="h-full w-full bg-zinc-950 rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">
                        <iframe
                            src={`https://open.spotify.com/embed/track/${(block.content as any).trackId}`}
                            width="100%" height="100%" frameBorder="0" allow="encrypted-media"
                            className="pointer-events-none opacity-90"
                        />
                    </div>
                )}

                {block.type === 'ticker' && (
                    <div
                        className={cn(
                            "py-3 overflow-hidden whitespace-nowrap shadow-2xl h-full w-full transition-all duration-500 flex items-center",
                            (block.content as any).style === 'neon' && "border-y border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]",
                            (block.content as any).style === 'glass' && "backdrop-blur-md border-y border-white/10"
                        )}
                        style={{ backgroundColor: (block.content as any).bgColor }}
                    >
                        <motion.div
                            animate={{
                                x: (block.content as any).direction === 'right' ? ["-50%", "0%"] : ["0%", "-50%"]
                            }}
                            transition={{
                                duration: (block.content as any).speed || 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="inline-block"
                        >
                            <span className={cn(
                                "text-sm font-black uppercase tracking-[0.2em] px-4",
                                (block.content as any).style === 'neon' && "animate-pulse"
                            )} style={{ color: (block.content as any).textColor }}>
                                {(block.content as any).text} • {(block.content as any).text} • {(block.content as any).text} • {(block.content as any).text} •
                            </span>
                        </motion.div>
                    </div>
                )}

                {block.type === 'subtitle' && (
                    <div className="h-full w-full p-4 flex items-center justify-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 1 },
                                visible: { opacity: 1, transition: { staggerChildren: (block.content as any).speed || 0.05 } }
                            }}
                            className={cn(
                                "px-10 py-6 shadow-2xl relative overflow-hidden transition-all duration-500 w-full",
                                (block.content as any).style === 'vhs' && "bg-[#050505] border-l-[8px] border-l-red-600 rounded-sm",
                                (block.content as any).style === 'minimal' && "bg-transparent border-none",
                                (block.content as any).style === 'modern' && "bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"
                            )}
                            style={{ backgroundColor: (block.content as any).style !== 'minimal' ? (block.content as any).bgColor : 'transparent' }}
                        >
                            <p className={cn(
                                "text-center leading-relaxed whitespace-pre-wrap",
                                (block.content as any).style === 'vhs' && "font-mono font-bold italic tracking-tighter uppercase",
                                (block.content as any).style === 'minimal' && "font-serif italic",
                                (block.content as any).style === 'modern' && "font-sans font-medium"
                            )} style={{ color: (block.content as any).textColor }}>
                                {(block.content as any).text}
                            </p>
                        </motion.div>
                    </div>
                )}

                {block.type === 'floating' && (
                    <div className="h-full w-full flex items-center justify-center p-4">
                        <motion.div
                            animate={(block.content as any).style === 'ghost' ? { opacity: [0.3, 0.6, 0.3], scale: [0.98, 1, 0.98] } : { y: [-10, 10] }}
                            transition={{ duration: (block.content as any).speed || 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                            className="text-4xl font-light tracking-tight text-center"
                            style={{ color: (block.content as any).textColor }}
                        >
                            {(block.content as any).text}
                        </motion.div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
