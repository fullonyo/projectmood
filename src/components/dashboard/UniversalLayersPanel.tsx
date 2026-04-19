"use client"
import { MoodBlock } from "@/types/database"
import { useTranslation } from "@/i18n/context"
import {
    Layers, Eye, EyeOff, Lock, Unlock,
    Trash2, Type, Image as ImageIcon, Music, Video,
    MessageSquare, Cloud, Clock, ShieldCheck, Pencil, 
    Wand2, X, GripVertical, FolderPlus, FolderMinus,
    ChevronDown, ChevronRight, Folder
} from "lucide-react"
import { memo, useState, useEffect, useMemo, useCallback } from "react"
import { Reorder, AnimatePresence, motion, useDragControls } from "framer-motion"

import { cn } from "@/lib/utils"
import { EditorHeader } from "./EditorUI"
import { useCanvasInteraction } from "./canvas-interaction-context"

interface LayersPanelProps {
    blocks: MoodBlock[]
    selectedIds: string[]
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void
    onUpdateBlock: (id: string, updates: Partial<MoodBlock>) => void
    onUpdateBlocks: (ids: string[], updates: Partial<MoodBlock> | ((block: MoodBlock) => Partial<MoodBlock>)) => void
    onDeleteRequest: (ids: string[]) => void
    onGroup?: () => void
    onUngroup?: () => void
    onNormalize?: () => void
}

type LayerEntity = 
    | { type: 'block', id: string, data: MoodBlock }
    | { type: 'header', id: string, groupId: string, name: string }

export function UniversalLayersPanel({
    blocks,
    selectedIds,
    setSelectedIds,
    onUpdateBlock,
    onUpdateBlocks,
    onDeleteRequest,
    onGroup,
    onUngroup,
    onNormalize
}: LayersPanelProps) {
    const { t } = useTranslation()
    const { setHoveredBlockIds } = useCanvasInteraction()
    
    const [collapsedGroups, setCollapsedGroups] = useState<string[]>([])

    // Elite Entity Generation Logic
    const entities = useMemo(() => {
        // 1. Sort blocks by zIndex (primary) and groupId (secondary to keep groups together)
        const sortedBlocks = [...blocks].sort((a, b) => {
            if (a.groupId && a.groupId === b.groupId) {
                return (b.zIndex || 0) - (a.zIndex || 0)
            }
            return (b.zIndex || 0) - (a.zIndex || 0)
        })

        const result: LayerEntity[] = []
        const processedGroups = new Set<string>()

        sortedBlocks.forEach(block => {
            // Ensure group header is only created once and stays with its members
            if (block.groupId && !processedGroups.has(block.groupId)) {
                const groupName = (block.content as any)?.groupName || `Group // ${block.groupId.split('_')[1]?.substring(0, 4)}`
                result.push({ type: 'header', id: `header_${block.groupId}`, groupId: block.groupId, name: groupName })
                processedGroups.add(block.groupId)
            }
            
            const isCollapsed = block.groupId && collapsedGroups.includes(block.groupId)
            if (!isCollapsed) {
                result.push({ type: 'block', id: block.id, data: block })
            }
        })

        return result
    }, [blocks, collapsedGroups])

    // Atomic Reorder Handler
    const handleReorderEntities = useCallback((newEntities: LayerEntity[]) => {
        const updatedBlocksIds: string[] = []
        const processedGroups = new Set<string>()
        
        newEntities.forEach(entity => {
            if (entity.type === 'block') {
                if (!updatedBlocksIds.includes(entity.id)) {
                    updatedBlocksIds.push(entity.id)
                }
            } else if (entity.type === 'header') {
                if (processedGroups.has(entity.groupId)) return
                
                // Pull all members (even collapsed ones) to this position
                const members = blocks
                    .filter(b => b.groupId === entity.groupId)
                    .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
                
                members.forEach(m => {
                    if (!updatedBlocksIds.includes(m.id)) {
                        updatedBlocksIds.push(m.id)
                    }
                })
                processedGroups.add(entity.groupId)
            }
        })

        // Normalization step to prevent zIndex drift
        onUpdateBlocks(updatedBlocksIds, (block) => {
            const index = updatedBlocksIds.indexOf(block.id)
            return { zIndex: (updatedBlocksIds.length - index) + 10 }
        })
    }, [blocks, onUpdateBlocks])

    const toggleGroupCollapse = (groupId: string) => {
        setCollapsedGroups(prev => 
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        )
    }

    const hasGroupsInSelection = selectedIds.some(id => blocks.find(b => b.id === id)?.groupId)

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden select-none">
            {/* Header Section */}
            <div className="p-8 pb-4 border-b border-zinc-100 dark:border-zinc-800 space-y-6">
                <EditorHeader 
                    title={t('canvas.layers')}
                    subtitle={t('canvas.layers_subtitle')}
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1.5">{t('canvas.layers_status')}</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">{t('canvas.layers_status_active')}</span>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-zinc-100 dark:bg-zinc-800" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1.5">{t('sidebar.insight.memories')}</span>
                            <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{blocks.length.toString().padStart(2, '0')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onNormalize && (
                            <button
                                onClick={onNormalize}
                                className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm hover:border-blue-500 hover:text-blue-500 transition-all active:scale-95"
                                title={t('canvas.layers_normalize')}
                            >
                                <Wand2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="flex items-center justify-between p-2 px-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20"
                        >
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'selecionados'}
                            </span>
                            <div className="flex items-center gap-0.5">
                                {selectedIds.length > 1 && onGroup && !hasGroupsInSelection && (
                                    <button onClick={onGroup} className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors" title="Agrupar">
                                        <FolderPlus className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                {hasGroupsInSelection && onUngroup && (
                                    <button onClick={onUngroup} className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors" title="Desagrupar">
                                        <FolderMinus className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <div className="w-[1px] h-4 bg-white/20 mx-1" />
                                <button 
                                    onClick={() => onUpdateBlocks(selectedIds, (b) => ({ isHidden: !b.isHidden }))} 
                                    className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors" title="Ocultar"
                                >
                                    <EyeOff className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                    onClick={() => onUpdateBlocks(selectedIds, (b) => ({ isLocked: !b.isLocked }))}
                                    className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors" title="Bloquear"
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onDeleteRequest(selectedIds)} className="p-1.5 hover:bg-red-500 rounded-lg text-white transition-colors" title="Deletar">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <div className="w-[1px] h-4 bg-white/20 mx-1" />
                                <button onClick={() => setSelectedIds([])} className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* List Section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 pt-6">
                <Reorder.Group 
                    axis="y" 
                    values={entities} 
                    onReorder={handleReorderEntities}
                    className="space-y-1.5"
                >
                    {entities.map((entity) => (
                        <Reorder.Item 
                            key={entity.id} 
                            value={entity}
                            className="relative"
                        >
                            {entity.type === 'header' ? (
                                <FolderHeader 
                                    groupId={entity.groupId}
                                    name={entity.name}
                                    isCollapsed={collapsedGroups.includes(entity.groupId)}
                                    onToggle={() => toggleGroupCollapse(entity.groupId)}
                                    onSelect={() => {
                                        const ids = blocks.filter(b => b.groupId === entity.groupId).map(b => b.id)
                                        setSelectedIds(ids)
                                    }}
                                    onUpdateGroup={(updates: any) => {
                                        const ids = blocks.filter(b => b.groupId === entity.groupId).map(b => b.id)
                                        onUpdateBlocks(ids, updates)
                                    }}
                                    onDelete={() => {
                                        const ids = blocks.filter(b => b.groupId === entity.groupId).map(b => b.id)
                                        onDeleteRequest(ids)
                                    }}
                                    membersCount={blocks.filter(b => b.groupId === entity.groupId).length}
                                    membersIds={blocks.filter(b => b.groupId === entity.groupId).map(b => b.id)}
                                    t={t}
                                    setHoveredBlockIds={setHoveredBlockIds}
                                />
                            ) : (
                                <LayerItem
                                    block={entity.data}
                                    isSelected={selectedIds.includes(entity.id)}
                                    onSelect={(id, multi) => {
                                        setSelectedIds(prev => {
                                            if (multi) {
                                                if (prev.includes(id)) return prev.filter(i => i !== id)
                                                return [...prev, id]
                                            }
                                            return [id]
                                        })
                                    }}
                                    onUpdate={onUpdateBlock}
                                    t={t}
                                    setHoveredBlockIds={setHoveredBlockIds}
                                    onDelete={(id) => onDeleteRequest([id])}
                                />
                            )}
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                {blocks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-4">
                            <Layers className="w-6 h-6 text-zinc-200 dark:text-zinc-800" />
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('block_manager.empty')}</p>
                    </div>
                )}
            </div>

            {/* Footer Section */}
            <footer className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-pulse" />
                        <span>{t('canvas.layers_synced')}</span>
                    </div>
                    <span>{t('canvas.layers_safe')}</span>
                </div>
            </footer>
        </div>
    )
}

const FolderHeader = ({ groupId, name, isCollapsed, onToggle, onSelect, onUpdateGroup, onDelete, membersCount, membersIds, t, setHoveredBlockIds }: any) => {
    const [isEditing, setIsEditing] = useState(false)
    const [tempName, setTempName] = useState(name)
    const dragControls = useDragControls()

    const handleSaveName = () => {
        onUpdateGroup((block: MoodBlock) => ({ 
            content: { ...(block.content || {}), groupName: tempName } 
        }))
        setIsEditing(false)
    }

    return (
        <div 
            onClick={onSelect}
            onMouseEnter={() => setHoveredBlockIds(membersIds)}
            onMouseLeave={() => setHoveredBlockIds([])}
            className={cn(
                "flex items-center gap-2 px-2 py-2 group/folder cursor-pointer rounded-xl transition-all border border-transparent mb-1",
                "bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-200 dark:hover:border-zinc-800 hover:shadow-sm",
                !isCollapsed && "bg-blue-50/10 dark:bg-blue-900/5 border-blue-500/10"
            )}
        >
            <div onPointerDown={(e) => dragControls.start(e)} className="cursor-grab active:cursor-grabbing p-1 text-zinc-300 hover:text-zinc-500 transition-colors">
                <GripVertical className="w-3.5 h-3.5" />
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="p-1 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors shadow-sm"
            >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                <Folder className="w-3.5 h-3.5 fill-blue-500/10" />
            </div>

            <div className="flex-1 min-w-0 px-1">
                {isEditing ? (
                    <input 
                        autoFocus
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleSaveName}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-blue-600 outline-none w-full"
                    />
                ) : (
                    <p 
                        onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-200 truncate"
                    >
                        {name}
                    </p>
                )}
                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
                    {membersCount} {t('common.items')}
                </p>
            </div>

            <div className="flex items-center gap-0.5 opacity-0 group-hover/folder:opacity-100 transition-opacity pr-1">
                <button 
                    onClick={(e) => { e.stopPropagation(); onUpdateGroup((b: any) => ({ isHidden: !b.isHidden })); }}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                >
                    <Eye className="w-3.5 h-3.5" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600 transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

const LayerItem = memo(({ block, isSelected, onSelect, onUpdate, onDelete, t, setHoveredBlockIds }: any) => {
    const [isEditingName, setIsEditingName] = useState(false)
    const [tempName, setTempName] = useState((block.content as any).customName || "")
    const dragControls = useDragControls()

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
        if (content.customName) return content.customName
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

    const handleSaveName = () => {
        onUpdate(block.id, { content: { ...(block.content as any), customName: tempName } })
        setIsEditingName(false)
    }

    return (
        <div 
            onMouseEnter={() => setHoveredBlockIds([block.id])}
            onMouseLeave={() => setHoveredBlockIds([])}
            className="flex items-center"
        >
            {block.groupId && (
                <div className="absolute left-[1.15rem] top-0 bottom-0 w-[1.5px] bg-zinc-200 dark:bg-zinc-800 transition-colors" />
            )}

            <div
                className={cn(
                    "flex-1 flex items-center gap-3 p-2 rounded-2xl transition-all cursor-pointer border relative overflow-hidden mb-1",
                    isSelected
                        ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
                        : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700",
                    block.isHidden && "opacity-40 grayscale",
                    block.groupId && "ml-8"
                )}
                onClick={(e) => onSelect(block.id, e.shiftKey || e.metaKey)}
            >
                <div 
                    onPointerDown={(e) => !block.isLocked && dragControls.start(e)}
                    className={cn(
                        "p-1 cursor-grab active:cursor-grabbing text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors",
                        block.isLocked && "opacity-0 pointer-events-none"
                    )}
                >
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                    isSelected
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                )}>
                    {getBlockIcon(block.type)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        {isEditingName ? (
                            <input 
                                autoFocus
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-transparent text-[10px] font-bold uppercase tracking-wide text-blue-600 outline-none w-full border-b border-blue-500/50"
                            />
                        ) : (
                            <p 
                                onDoubleClick={(e) => {
                                    e.stopPropagation()
                                    setIsEditingName(true)
                                }}
                                className={cn(
                                    "text-[10px] truncate font-bold uppercase tracking-wide",
                                    isSelected ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-200",
                                )}
                            >
                                {getBlockLabel(block)}
                            </p>
                        )}
                        {block.isLocked && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase opacity-60">
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
                    >
                        {block.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(block.id)
                        }}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    )
})

LayerItem.displayName = 'LayerItem'
