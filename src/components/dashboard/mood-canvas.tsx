import { motion } from "framer-motion"
import { updateMoodBlockLayout, deleteMoodBlock } from "@/actions/profile"
import { Trash2, RotateCw, Pencil, Move } from "lucide-react"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { themeConfigs } from "@/lib/themes"
import { BlockRenderer } from "./block-renderer"
import { BackgroundEffect } from "../effects/background-effect"
import { StaticTextures } from "../effects/static-textures"


interface MoodCanvasProps {
    blocks: any[]
    profile: any
    backgroundEffect: string
    selectedId: string | null
    setSelectedId: (id: string | null) => void
    onUpdateBlock: (id: string, content: any) => void
}

export function MoodCanvas({
    blocks,
    profile,
    backgroundEffect,
    selectedId,
    setSelectedId,
    onUpdateBlock
}: MoodCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null)
    const [maxZ, setMaxZ] = useState(10)
    const [isSaving, setIsSaving] = useState(false)
    const [blockToDelete, setBlockToDelete] = useState<string | null>(null)

    const theme = profile.theme || 'light'
    const config = themeConfigs[theme] || themeConfigs.light
    const bgColor = config.bg
    const primaryColor = config.primary
    const gridOpacity = config.gridOpacity

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
            <div className="absolute inset-0 z-0">
                <BackgroundEffect type={backgroundEffect} primaryColor={profile.primaryColor} />
            </div>
            <div className="absolute inset-0 z-[1]">
                <StaticTextures type={profile.staticTexture || 'none'} />
            </div>

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
                className={cn("absolute inset-0 z-[2] pointer-events-none transition-opacity duration-1000", gridOpacity)}
                style={{
                    backgroundImage: config.grid,
                    backgroundSize: config.bgSize,
                    filter: theme === 'vintage' ? 'contrast(110%) brightness(105%) sepia(20%)' : 'none'
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
                Zona de Criatividade Livre
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
        const deltaXPercent = (info.offset.x / canvasRect.width) * 100
        const deltaYPercent = (info.offset.y / canvasRect.height) * 100

        // Use toFixed(2) and parseFloat to round to 2 decimal places
        const newX = parseFloat(Math.max(0, Math.min(100, block.x + deltaXPercent)).toFixed(2))
        const newY = parseFloat(Math.max(0, Math.min(100, block.y + deltaYPercent)).toFixed(2))

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
            animate={{ x: 0, y: 0 }}
            whileDrag={{
                scale: 1.05,
                zIndex: 1000,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
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
                <BlockRenderer block={block} isPublic={false} />
            </div>
        </motion.div>
    )
}
