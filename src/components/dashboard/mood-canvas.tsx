import { motion, useMotionValue } from "framer-motion"
import { toast } from "sonner"
import { deleteMoodBlock } from "@/actions/profile"
import { Trash2, RotateCw, Pencil, Move, MousePointer2 } from "lucide-react"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { themeConfigs } from "@/lib/themes"
import { BlockRenderer } from "./block-renderer"
import { BackgroundEffect } from "../effects/background-effect"
import { StaticTextures } from "../effects/static-textures"
import { BoardStage } from "./board-stage"
import { useCanvasManager } from "@/hooks/use-canvas-manager"
import { calculateResize, getResizeCursor, ResizeHandle, ResizeCorner, calculateRotation } from '@/lib/canvas-transforms'


import { MoodBlock, Profile, ThemeConfig } from "@/types/database"

interface MoodCanvasProps {
    blocks: MoodBlock[]
    profile: Profile
    backgroundEffect: string
    selectedId: string | null
    setSelectedId: (id: string | null) => void
    onUpdateBlock: (id: string, updates: Partial<MoodBlock>) => void
    isSaving: boolean
}

export function MoodCanvas({
    blocks,
    profile,
    backgroundEffect,
    selectedId,
    setSelectedId,
    onUpdateBlock,
    isSaving
}: MoodCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null)
    const [maxZ, setMaxZ] = useState(10)
    const [blockToDelete, setBlockToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

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
        onUpdateBlock(blockId, { zIndex: newZ })
    }

    const handleCanvasClick = (e: React.MouseEvent) => {
        setSelectedId(null)
    }

    return (
        <div
            onClick={handleCanvasClick}
            className="relative w-full h-full overflow-hidden cursor-crosshair transition-colors duration-1000"
            style={{ backgroundColor: bgColor, color: primaryColor }}
        >
            <div className="absolute inset-0 z-0">
                <BackgroundEffect type={backgroundEffect} primaryColor={profile.primaryColor || undefined} />
            </div>
            <div className="absolute inset-0 z-[1]">
                <StaticTextures type={profile.staticTexture || 'none'} />
            </div>

            {/* Saving Indicator */}
            <div className={cn(
                "absolute top-20 right-8 z-50 flex items-center gap-2 px-3 py-1.5 rounded-none bg-white dark:bg-zinc-950/80 backdrop-blur-md border border-black dark:border-white transition-all duration-300 pointer-events-none shadow-none",
                isSaving ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            )}>
                <div className="w-1.5 h-1.5 rounded-none bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">SYNC_ACTIVE</span>
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

            <BoardStage ref={canvasRef}>
                {blocks.map((block) => (
                    <CanvasItem
                        key={block.id}
                        block={block}
                        canvasRef={canvasRef}
                        isSelected={selectedId === block.id}
                        profile={profile}
                        themeConfig={config}
                        onSelect={(toggle = false) => {
                            if (toggle && selectedId === block.id) {
                                setSelectedId(null)
                            } else {
                                setSelectedId(block.id)
                                if (selectedId !== block.id) {
                                    bringToFront(block.id)
                                }
                            }
                        }}
                        onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                        onDeleteRequest={(id) => setBlockToDelete(id)}
                    />
                ))}
            </BoardStage>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-none bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm border border-black/10 dark:border-white/10 text-[9px] font-black tracking-[0.5em] uppercase text-zinc-400">
                CREATIVITY_DOMAIN_S01
            </div>

            <ConfirmModal
                isOpen={!!blockToDelete}
                onClose={() => setBlockToDelete(null)}
                onConfirm={async () => {
                    if (blockToDelete) {
                        setIsDeleting(true)
                        await deleteMoodBlock(blockToDelete)
                        setIsDeleting(false)
                        setBlockToDelete(null)
                    }
                }}
                title="Deletar Item?"
                message="Essa ação não pode ser desfeita. O item será removido permanentemente do seu mural."
                confirmText="Excluir"
                type="danger"
                isLoading={isDeleting}
            />
        </div>
    )
}


function CanvasItem({ block, canvasRef, isSelected, onSelect, onUpdate, profile, themeConfig, onDeleteRequest }: {
    block: MoodBlock,
    canvasRef: React.RefObject<HTMLDivElement | null>,
    isSelected: boolean,
    onSelect: (toggle?: boolean) => void,
    onUpdate: (content: Partial<MoodBlock>) => void,
    profile: Profile,
    themeConfig: ThemeConfig,
    onDeleteRequest: (id: string) => void
}) {
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [isRotating, setIsRotating] = useState(false)
    const [localRotation, setLocalRotation] = useState(block.rotation || 0)
    const [shiftHeld, setShiftHeld] = useState(false)
    const [size, setSize] = useState({
        width: block.width || 'auto' as number | 'auto',
        height: block.height || 'auto' as number | 'auto'
    })
    const [localPosition, setLocalPosition] = useState({ x: block.x, y: block.y })

    // ─── REFS: Source of truth for gesture handlers (avoid stale closures) ───
    const sizeRef = useRef(size)
    const positionRef = useRef(localPosition)
    const isResizingRef = useRef(false)

    // Keep refs in sync with state
    useEffect(() => { sizeRef.current = size }, [size])
    useEffect(() => { positionRef.current = localPosition }, [localPosition])

    // 🏎️ GPU-ACCELERATED VALUES: MotionValues bypass the React Render cycle
    const mvX = useMotionValue(0)
    const mvY = useMotionValue(0)

    // Sync size with server props (when not actively resizing)
    useEffect(() => {
        if (!isResizingRef.current) {
            const newSize = {
                width: block.width || 'auto' as number | 'auto',
                height: block.height || 'auto' as number | 'auto'
            }
            setSize(newSize)
            sizeRef.current = newSize
        }
    }, [block.width, block.height])

    // Sync position with server props (when not resizing/dragging)
    useEffect(() => {
        if (!isResizingRef.current && !isDragging) {
            const newPos = { x: block.x, y: block.y }
            setLocalPosition(newPos)
            positionRef.current = newPos
        }
    }, [block.x, block.y, isDragging])

    // Shift key tracking for aspect ratio lock
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') setShiftHeld(true) }
        const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') setShiftHeld(false) }
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    const handleDragStart = () => {
        setIsDragging(true)
        onSelect(false)
    }

    const handleDragEnd = (event: any, info: any) => {
        setIsDragging(false)
        if (!canvasRef.current) return

        const canvasRect = canvasRef.current.getBoundingClientRect()

        const deltaXPercent = (info.offset.x / canvasRect.width) * 100
        const deltaYPercent = (info.offset.y / canvasRect.height) * 100

        const newX = parseFloat(Math.max(0, Math.min(100, block.x + deltaXPercent)).toFixed(4))
        const newY = parseFloat(Math.max(0, Math.min(100, block.y + deltaYPercent)).toFixed(4))

        onUpdate({ x: newX, y: newY })

        mvX.set(0)
        mvY.set(0)
    }

    // ─── Figma-like Resize (reads from REFS to avoid stale closures) ────
    const handleResize = (event: any, info: any, handle: ResizeHandle) => {
        if (!canvasRef.current) return
        setIsResizing(true)
        isResizingRef.current = true

        const canvasRect = canvasRef.current.getBoundingClientRect()

        // Read from REFS (always latest values, immune to stale closures)
        const currentSize = sizeRef.current
        const currentPos = positionRef.current

        const currentWidth = typeof currentSize.width === 'number' ? currentSize.width : event.target.closest('.absolute')?.offsetWidth || 200
        const currentHeight = typeof currentSize.height === 'number' ? currentSize.height : event.target.closest('.absolute')?.offsetHeight || 100

        const result = calculateResize(
            handle,
            info.delta.x,
            info.delta.y,
            { x: currentPos.x, y: currentPos.y, width: currentWidth, height: currentHeight },
            canvasRect.width,
            canvasRect.height,
            shiftHeld
        )

        // Update BOTH state (for React render) and refs (for next gesture frame)
        const newSize = { width: result.width, height: result.height }
        const newPos = { x: result.x, y: result.y }
        setSize(newSize)
        setLocalPosition(newPos)
        sizeRef.current = newSize
        positionRef.current = newPos
    }

    const handleResizeEnd = (handle: ResizeHandle) => {
        setIsResizing(false)
        isResizingRef.current = false

        // Read from REFS (guaranteed latest values after gesture)
        const finalSize = sizeRef.current
        const finalPos = positionRef.current

        const updates: any = {}

        if (typeof finalSize.width === 'number') updates.width = Math.round(finalSize.width)
        if (typeof finalSize.height === 'number') updates.height = Math.round(finalSize.height)

        // Send position for handles that move position
        if (['tl', 'bl', 'tr', 'top', 'left'].includes(handle)) {
            updates.x = finalPos.x
            updates.y = finalPos.y
        }

        onUpdate(updates)
    }

    const handleRotate = (event: any, info: any) => {
        if (!canvasRef.current) return
        setIsRotating(true)

        const canvasRect = canvasRef.current.getBoundingClientRect()
        const currentPos = positionRef.current
        const currentSize = sizeRef.current

        // Fallback para DOM se size for auto (igual ao resize)
        const currentWidth = typeof currentSize.width === 'number' ? currentSize.width : (canvasRef.current.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement)?.offsetWidth || 100
        const currentHeight = typeof currentSize.height === 'number' ? currentSize.height : (canvasRef.current.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement)?.offsetHeight || 100

        // Centro do bloco em pixels relativos ao viewport
        const blockCenterX = canvasRect.left + (currentPos.x / 100) * canvasRect.width + (currentWidth / 2)
        const blockCenterY = canvasRect.top + (currentPos.y / 100) * canvasRect.height + (currentHeight / 2)

        const newRotation = calculateRotation(
            blockCenterX,
            blockCenterY,
            info.point.x,
            info.point.y,
            shiftHeld
        )

        setLocalRotation(newRotation)
    }

    const handleRotateEnd = () => {
        setIsRotating(false)
        onUpdate({ rotation: localRotation })
    }

    const resetRotation = () => {
        setLocalRotation(0)
        onUpdate({ rotation: 0 })
    }

    const handleDelete = () => onDeleteRequest(block.id)

    const [isInteracting, setIsInteracting] = useState(false)
    const isInteractiveBlock = ['video', 'music', 'guestbook', 'media'].includes(block.type)

    useEffect(() => {
        if (!isSelected) setIsInteracting(false)
    }, [isSelected])

    // ─── Render Resize Handle ───────────────────────────────────────────
    const renderHandle = (handle: ResizeHandle) => {
        const isCorner = ['br', 'bl', 'tr', 'tl'].includes(handle)
        const handleSize = isCorner ? 'w-2.5 h-2.5' : (
            handle === 'top' || handle === 'bottom' ? 'w-6 h-2' : 'w-2 h-6'
        )

        const positionClasses: Record<ResizeHandle, string> = {
            br: '-bottom-1.5 -right-1.5',
            bl: '-bottom-1.5 -left-1.5',
            tr: '-top-1.5 -right-1.5',
            tl: '-top-1.5 -left-1.5',
            top: '-top-1 left-1/2 -translate-x-1/2',
            bottom: '-bottom-1 left-1/2 -translate-x-1/2',
            left: 'top-1/2 -left-1 -translate-y-1/2',
            right: 'top-1/2 -right-1 -translate-y-1/2',
        }

        return (
            <div
                key={handle}
                onPointerDown={(e) => {
                    e.stopPropagation()
                    setIsResizing(true)
                }}
                onPointerUp={() => setIsResizing(false)}
                className={cn(
                    "absolute z-[1002] pointer-events-auto",
                    positionClasses[handle],
                    handleSize,
                    "bg-white border-2 rounded-sm shadow-sm",
                    isCorner ? "border-blue-500" : "border-blue-400"
                )}
                style={{ cursor: getResizeCursor(handle) }}
            >
                <motion.div
                    onPan={(e, i) => handleResize(e, i, handle)}
                    onPanEnd={() => handleResizeEnd(handle)}
                    className="w-full h-full"
                />
            </div>
        )
    }

    // All handles: 4 corners + 4 edges
    const allHandles: ResizeHandle[] = ['br', 'bl', 'tr', 'tl', 'top', 'bottom', 'left', 'right']

    return (
        <motion.div
            drag={!isResizing && !isRotating && !isInteracting}
            dragMomentum={false}
            dragConstraints={canvasRef}
            dragElastic={0}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
                x: mvX,
                y: mvY,
                left: `${localPosition.x}%`,
                top: `${localPosition.y}%`,
                width: size.width,
                height: size.height,
                rotate: localRotation,
                zIndex: isDragging || isSelected ? 999 : (block.zIndex || 1),
                boxShadow: isSelected ? `0 0 0 2px ${themeConfig.bg}, 0 0 0 4px ${profile.primaryColor || '#3b82f6'}` : 'none',
                touchAction: 'none'
            }}
            whileDrag={{
                opacity: 0.8,
                zIndex: 1000,
            }}
            onClick={(e) => {
                if (isInteracting) return
                e.stopPropagation()
                onSelect(false)
            }}
            onDoubleClick={(e) => {
                if (isInteracting) return
                e.stopPropagation()
                onSelect(false)
            }}
            className={cn(
                "absolute group",
                !isInteracting && "select-none touch-none",
                isSelected ? "cursor-default" : "cursor-grab active:cursor-grabbing"
            )}
            data-block-id={block.id}
        >
            {/* Selection Border Outline */}
            {isSelected && (
                <div
                    className={cn(
                        "absolute -inset-[3px] border-2 rounded-none pointer-events-none z-[1001] transition-all",
                        isInteracting ? "border-white opacity-100 shadow-none" : "border-dashed border-zinc-400 opacity-50 font-mono"
                    )}
                    style={!isInteracting ? { borderColor: profile.primaryColor || '#3b82f6' } : {}}
                />
            )}
            {/* Action Toolbar */}
            {isSelected && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-none bg-white dark:bg-zinc-950 shadow-none border border-black dark:border-white z-[1001] animate-in fade-in zoom-in duration-200 pointer-events-auto">
                    <button
                        onClick={() => onSelect(false)}
                        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-none transition-colors group/edit"
                        title="Editar"
                    >
                        <Pencil className="w-3.5 h-3.5 text-zinc-500 group-hover/edit:text-white" />
                    </button>
                    <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800" />
                    <div className="p-1.5 cursor-move rounded-none transition-colors border border-transparent" title="Mover">
                        <Move className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800" />
                    {localRotation !== 0 && (
                        <>
                            <button onClick={resetRotation} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-none transition-colors text-xs font-mono text-blue-500" title="Resetar Rotação">
                                {localRotation}°
                            </button>
                            <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800" />
                        </>
                    )}
                    {isInteractiveBlock && (
                        <>
                            <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800" />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsInteracting(!isInteracting)
                                }}
                                className={cn(
                                    "p-1.5 rounded-none transition-all border",
                                    isInteracting
                                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                                        : "hover:bg-black/5 border-transparent text-zinc-500"
                                )}
                                title={isInteracting ? "Modo Interação Ativo" : "Ativar Modo Interação"}
                            >
                                <MousePointer2 className={cn("w-3.5 h-3.5", isInteracting && "animate-pulse")} />
                            </button>
                        </>
                    )}
                    <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800" />
                    <button onClick={handleDelete} className="p-1.5 hover:bg-red-500/10 rounded-none transition-colors group/del" title="Excluir">
                        <Trash2 className="w-3.5 h-3.5 text-zinc-500 group-hover/del:text-red-500" />
                    </button>
                </div>
            )}

            {/* Resize Handles — 4 Corners + 4 Edges */}
            {isSelected && (
                <>
                    {allHandles.map(renderHandle)}

                    {/* Rotation Handle (Lollipop) */}
                    <div
                        className="absolute left-1/2 -top-8 -translate-x-1/2 w-0.5 h-8 bg-blue-400 z-[1002] pointer-events-auto cursor-grab active:cursor-grabbing origin-bottom"
                    >
                        <motion.div
                            drag
                            dragMomentum={false}
                            dragElastic={0}
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            onPan={handleRotate}
                            onPanEnd={handleRotateEnd}
                            className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full shadow-sm hover:scale-110 transition-transform"
                        />
                    </div>

                    <div className="absolute inset-0 border border-blue-500/20 pointer-events-none" />
                </>
            )}

            <div className={cn(
                "w-full h-full transition-transform duration-200 overflow-hidden",
                isDragging && "scale-[1.02] rotate-1",
                (isDragging || isResizing) && "pointer-events-none"
            )}>
                <BlockRenderer
                    block={block}
                    isPublic={isInteracting}
                />
            </div>
        </motion.div>
    )
}
