"use client"

import { MoodBlock } from "@/types/database"
import { useTranslation } from "@/i18n/context"
import {
    Layers, Eye, EyeOff, Lock, Unlock,
    ChevronUp, ChevronDown, GripVertical,
    Trash2, Type, Image as ImageIcon, Music, Video,
    MessageSquare, Cloud, Clock, ShieldCheck, Heart,
    Minus, Pencil, Wand2, Activity
} from "lucide-react"
import { useMemo, memo } from "react"

import { cn } from "@/lib/utils"

interface LayersPanelProps {
    blocks: MoodBlock[]
    selectedIds: string[]
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void
    onUpdateBlock: (id: string, updates: Partial<MoodBlock>) => void
    onDeleteRequest: (id: string) => void
    onNormalize?: () => void
}

export function UniversalLayersPanel({
    blocks,
    selectedIds,
    setSelectedIds,
    onUpdateBlock,
    onDeleteRequest,
    onNormalize
}: LayersPanelProps) {
    const { t } = useTranslation()

    // Odenar blocos por Z-Index (descendente para mostrar o que está no topo primeiro)
    const sortedBlocks = useMemo(() =>
        [...blocks].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0)),
        [blocks]
    )


    const getBlockIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type className="w-3.5 h-3.5" />
            case 'photo':
            case 'gif': return <ImageIcon className="w-3.5 h-3.5" />
            case 'music': return <Music className="w-3.5 h-3.5" />
            case 'video': return <Video className="w-3.5 h-3.5" />
            case 'guestbook': return <MessageSquare className="w-3.5 h-3.5" />
            case 'weather': return <Cloud className="w-3.5 h-3.5" />
            case 'countdown': return <Clock className="w-3.5 h-3.5" />
            case 'moodStatus': return <ShieldCheck className="w-3.5 h-3.5" />
            case 'doodle': return <Pencil className="w-3.5 h-3.5" />
            default: return <Layers className="w-3.5 h-3.5" />
        }
    }

    const getBlockLabel = (block: MoodBlock) => {
        const content = block.content as any
        switch (block.type) {
            case 'text': return content.text?.substring(0, 20) || t('block_manager.labels.text')
            case 'photo': return t('block_manager.labels.photo')
            case 'gif': return t('block_manager.labels.gif')
            case 'music': return content.trackName || t('block_manager.labels.music')
            case 'video': return t('block_manager.labels.video')
            case 'quote': return t('block_manager.labels.quote')
            case 'moodStatus': return t('block_manager.labels.moodStatus')
            case 'countdown': return t('block_manager.labels.countdown')
            case 'weather': return t('block_manager.labels.weather')
            default: return t(`block_manager.labels.${block.type as any}`) || block.type.charAt(0).toUpperCase() + block.type.slice(1)
        }
    }


    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
            <header className="p-6 border-b border-zinc-100 dark:border-zinc-900 space-y-4">
                <div className="flex items-center gap-2 opacity-30">
                    <Activity className="w-2.5 h-2.5" />
                    <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('sidebar.insight.atmosphere')} // {t('canvas.layers')}</h3>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">{t('sidebar.insight.memories')}</span>
                            <span className="text-xl font-black italic tracking-tighter">{blocks.length.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-zinc-100 dark:bg-zinc-900" />
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Status</span>
                            <span className="text-[9px] font-black uppercase italic text-emerald-500">Active</span>
                        </div>
                    </div>

                    {onNormalize && (
                        <button
                            onClick={onNormalize}
                            className="h-8 w-8 flex items-center justify-center border border-zinc-100 dark:border-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                            title={t('canvas.layers_normalize') || "Normalizar Camadas"}
                        >
                            <Wand2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 p-2 space-y-1">
                {sortedBlocks.map((block) => (
                    <LayerItem
                        key={block.id}
                        block={block}
                        isSelected={selectedIds.includes(block.id)}
                        onSelect={(id) => {
                            setSelectedIds(prev => {
                                if (prev.includes(id)) return prev.filter(i => i !== id)
                                return [...prev, id]
                            })
                        }}
                        onUpdate={onUpdateBlock}
                        onDelete={onDeleteRequest}
                        t={t}
                    />
                ))}

                {blocks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-center px-4 opacity-50">
                        <Minus className="w-8 h-8 mb-2 text-zinc-300" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t('block_manager.empty')}</p>
                    </div>
                )}
            </div>

            <footer className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20">
                <div className="flex items-center justify-between text-[7px] font-mono text-zinc-400 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-current animate-pulse" />
                        <span>Precision: 0.1%</span>
                    </div>
                    <span>{t('canvas.layers_safe')}</span>
                </div>
            </footer>
        </div>
    )
}

const LayerItem = memo(({ block, isSelected, onSelect, onUpdate, onDelete, t }: {
    block: MoodBlock
    isSelected: boolean
    onSelect: (id: string) => void
    onUpdate: (id: string, updates: Partial<MoodBlock>) => void
    onDelete: (id: string) => void
    t: any
}) => {
    const getBlockIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type className="w-3.5 h-3.5" />
            case 'photo':
            case 'gif': return <ImageIcon className="w-3.5 h-3.5" />
            case 'music': return <Music className="w-3.5 h-3.5" />
            case 'video': return <Video className="w-3.5 h-3.5" />
            case 'guestbook': return <MessageSquare className="w-3.5 h-3.5" />
            case 'weather': return <Cloud className="w-3.5 h-3.5" />
            case 'countdown': return <Clock className="w-3.5 h-3.5" />
            case 'moodStatus': return <ShieldCheck className="w-3.5 h-3.5" />
            case 'doodle': return <Pencil className="w-3.5 h-3.5" />
            default: return <Layers className="w-3.5 h-3.5" />
        }
    }

    const getBlockLabel = (block: MoodBlock) => {
        const content = block.content as any
        switch (block.type) {
            case 'text': return content.text?.substring(0, 20) || t('block_manager.labels.text')
            case 'photo': return t('block_manager.labels.photo')
            case 'gif': return t('block_manager.labels.gif')
            case 'music': return content.trackName || t('block_manager.labels.music')
            case 'video': return t('block_manager.labels.video')
            case 'quote': return t('block_manager.labels.quote')
            case 'moodStatus': return t('block_manager.labels.moodStatus')
            case 'countdown': return t('block_manager.labels.countdown')
            case 'weather': return t('block_manager.labels.weather')
            default: return t(`block_manager.labels.${block.type as any}`) || block.type.charAt(0).toUpperCase() + block.type.slice(1)
        }
    }

    return (
        <div
            onClick={() => onSelect(block.id)}
            className={cn(
                "flex items-center gap-4 p-4 group transition-all cursor-pointer border-b border-zinc-100 dark:border-zinc-900 relative overflow-hidden",
                isSelected
                    ? "bg-zinc-50 dark:bg-zinc-900/40"
                    : "bg-transparent hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20",
                block.isHidden && "opacity-40 grayscale",
            )}
        >
            {/* Selection HUD Indicator */}
            {isSelected && (
                <>
                    <div className="absolute top-0 left-0 w-1 h-full bg-black dark:bg-white" />
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black dark:border-white" />
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-black dark:border-white" />
                </>
            )}

            <div className={cn(
                "w-8 h-8 flex items-center justify-center border transition-all",
                isSelected
                    ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                    : "border-zinc-100 dark:border-zinc-800 text-zinc-400 group-hover:border-zinc-300 dark:group-hover:border-zinc-600"
            )}>
                {getBlockIcon(block.type)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <p className={cn(
                        "text-[7.5px] truncate font-black uppercase tracking-[0.4em]",
                        isSelected ? "text-black dark:text-white" : "text-zinc-500",
                    )}>
                        {getBlockLabel(block)}
                    </p>
                    {block.isLocked && <Lock className="w-2 h-2 text-amber-500" />}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[7px] font-mono text-zinc-400 tracking-tighter uppercase whitespace-nowrap">
                        Node // {(block.zIndex || 1).toString().padStart(3, '0')}
                    </span>
                    <div className="h-[2px] w-[2px] rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <span className="text-[7px] font-mono text-zinc-400 tracking-tighter uppercase">
                        {block.type}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onUpdate(block.id, { isHidden: !block.isHidden })
                    }}
                    className={cn(
                        "p-1 transition-colors",
                        block.isHidden ? "text-blue-500" : "text-zinc-400 hover:text-current"
                    )}
                    title={block.isHidden ? t('canvas.layer_show') : t('canvas.layer_hide')}
                >
                    {block.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onUpdate(block.id, { isLocked: !block.isLocked })
                    }}
                    className={cn(
                        "p-1 transition-colors",
                        block.isLocked ? "text-amber-500" : "text-zinc-400 hover:text-current"
                    )}
                    title={block.isLocked ? t('canvas.layer_unlock') : t('canvas.layer_lock')}
                >
                    {block.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete(block.id)
                    }}
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                    title={t('common.delete')}
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    )
})

LayerItem.displayName = 'LayerItem'

