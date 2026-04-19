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
import { EditorHeader } from "./EditorUI"

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
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            <div className="p-8 pb-4 border-b border-zinc-100 dark:border-zinc-800 space-y-8">
                <EditorHeader 
                    title={t('canvas.layers')}
                    subtitle="Gerencie a hierarquia visual do seu espaço"
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1.5">{t('sidebar.insight.memories')}</span>
                            <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{blocks.length.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-zinc-100 dark:bg-zinc-800" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1.5">Status</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Ativo</span>
                            </div>
                        </div>
                    </div>

                    {onNormalize && (
                        <button
                            onClick={onNormalize}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm hover:border-blue-500 hover:text-blue-500 transition-all"
                            title={t('canvas.layers_normalize') || "Normalizar Camadas"}
                        >
                            <Wand2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
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
                    <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-4">
                            <Layers className="w-6 h-6 text-zinc-200 dark:text-zinc-800" />
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('block_manager.empty')}</p>
                    </div>
                )}
            </div>

            <footer className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                        <span>Sincronizado</span>
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
                "flex items-center gap-4 p-3 rounded-2xl group transition-all cursor-pointer border relative overflow-hidden",
                isSelected
                    ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
                    : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm",
                block.isHidden && "opacity-40 grayscale",
            )}
        >
            <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                isSelected
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
            )}>
                {getBlockIcon(block.type)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <p className={cn(
                        "text-[10px] truncate font-bold uppercase tracking-wide",
                        isSelected ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-200",
                    )}>
                        {getBlockLabel(block)}
                    </p>
                    {block.isLocked && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">
                        NODE // {(block.zIndex || 1).toString().padStart(3, '0')}
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
                        "p-1.5 rounded-lg transition-colors",
                        block.isHidden ? "bg-blue-100 text-blue-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    )}
                    title={block.isHidden ? t('canvas.layer_show') : t('canvas.layer_hide')}
                >
                    {block.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onUpdate(block.id, { isLocked: !block.isLocked })
                    }}
                    className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        block.isLocked ? "bg-amber-100 text-amber-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    )}
                    title={block.isLocked ? t('canvas.layer_unlock') : t('canvas.layer_lock')}
                >
                    {block.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete(block.id)
                    }}
                    className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title={t('common.delete')}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
})

LayerItem.displayName = 'LayerItem'

