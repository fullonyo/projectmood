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
import { useTranslation } from "@/i18n/context"
import { useCanvasManager } from "@/hooks/use-canvas-manager"
import { calculateResize, getResizeCursor, ResizeHandle, ResizeCorner, calculateRotation } from '@/lib/canvas-transforms'
import { useViewportScale, getBlockFallbackSize } from '@/lib/canvas-scale'


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
    const { t } = useTranslation()
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
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{t('canvas.sync_active')}</span>
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
                {t('canvas.creativity_domain')}
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
                title={t('canvas.delete_modal_title')}
                message={t('canvas.delete_modal_message')}
                confirmText={t('canvas.delete_modal_confirm')}
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
    const { t } = useTranslation()
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [isRotating, setIsRotating] = useState(false)
    const [localRotation, setLocalRotation] = useState(block.rotation || 0)
    const [shiftHeld, setShiftHeld] = useState(false)
    const getFallbackSize = (type: string) => getBlockFallbackSize(type)

    // 📌 Escala proporcional — consistente com página pública
    const viewportScale = useViewportScale()

    // State armazena valores em PIXELS DE TELA (já escalados)
    // Isso garante que resize/drag opera no espaço visual correto
    const scaleValue = (v: number | 'auto') => typeof v === 'number' ? v * viewportScale : v
    const unscaleValue = (v: number | 'auto') => typeof v === 'number' ? Math.round(v / viewportScale) : v

    const [size, setSize] = useState({
        width: scaleValue(block.width || getFallbackSize(block.type) as number | 'auto'),
        height: scaleValue(block.height || getFallbackSize(block.type) as number | 'auto')
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
    // Converte de pixels de referência para pixels de tela
    useEffect(() => {
        if (!isResizingRef.current) {
            const newSize = {
                width: scaleValue(block.width || getFallbackSize(block.type) as number | 'auto'),
                height: scaleValue(block.height || getFallbackSize(block.type) as number | 'auto')
            }
            setSize(newSize)
            sizeRef.current = newSize
        }
    }, [block.width, block.height, viewportScale])

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

        // Normalizar: dividir por scale para salvar em "pixels de referência"
        // State já está em pixels de tela, então dividimos para obter referência
        if (typeof finalSize.width === 'number') updates.width = unscaleValue(finalSize.width)
        if (typeof finalSize.height === 'number') updates.height = unscaleValue(finalSize.height)

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
            handle === 'top' || handle === 'bottom' ? 'w-6 h-1' : 'w-1 h-6'
        )

        const positionClasses: Record<ResizeHandle, string> = {
            br: '-bottom-1.5 -right-1.5',
            bl: '-bottom-1.5 -left-1.5',
            tr: '-top-1.5 -right-1.5',
            tl: '-top-1.5 -left-1.5',
            top: '-top-0.5 left-1/2 -translate-x-1/2',
            bottom: '-bottom-0.5 left-1/2 -translate-x-1/2',
            left: 'top-1/2 -left-0.5 -translate-y-1/2',
            right: 'top-1/2 -right-0.5 -translate-y-1/2',
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
                    "absolute z-[1002] pointer-events-auto bg-black dark:bg-white border hover:scale-[1.2] active:scale-95 transition-transform",
                    positionClasses[handle],
                    handleSize,
                    isCorner ? "border-transparent" : "border-white dark:border-black"
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
                        "absolute -inset-[3px] pointer-events-none z-[1001] transition-all",
                        isInteracting ? "border-[3px] border-white shadow-none mix-blend-difference" : "border border-dashed border-black/50 dark:border-white/50 bg-black/5"
                    )}
                />
            )}
            {/* Action Toolbar */}
            {isSelected && (
                <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-zinc-950 border border-black dark:border-white z-[1001] animate-in fade-in zoom-in duration-200 pointer-events-auto">
                    <button
                        onClick={() => onSelect(false)}
                        className="p-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group/edit"
                        title={t('common.edit')}
                    >
                        <Pencil className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover/edit:text-current" />
                    </button>
                    <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                    <div className="p-1.5 cursor-move transition-colors border border-transparent hover:bg-black/5 dark:hover:bg-white/5 group/move" title={t('common.move')}>
                        <Move className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                    {localRotation !== 0 && (
                        <>
                            <button onClick={resetRotation} className="px-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400" title={t('common.reset_rotation')}>
                                {localRotation}°
                            </button>
                            <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                        </>
                    )}
                    {isInteractiveBlock && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsInteracting(!isInteracting)
                                }}
                                className={cn(
                                    "p-1.5 transition-all outline outline-1 -outline-offset-1 border border-transparent",
                                    isInteracting
                                        ? "bg-black text-white dark:bg-white dark:text-black outline-current animate-pulse"
                                        : "hover:bg-black/5 text-zinc-600 dark:text-zinc-400 outline-transparent"
                                )}
                                title={isInteracting ? t('common.disable_interaction') : t('common.enable_interaction')}
                            >
                                <MousePointer2 className="w-4 h-4" />
                            </button>
                            <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                        </>
                    )}
                    <button onClick={handleDelete} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 transition-colors group/del text-zinc-600 dark:text-zinc-400" title={t('common.delete')}>
                        <Trash2 className="w-4 h-4 group-hover/del:text-red-500" />
                    </button>
                </div>
            )}

            {/* Resize Handles — 4 Corners + 4 Edges */}
            {isSelected && (
                <>
                    {allHandles.map(renderHandle)}

                    {/* Rotation Handle (Lollipop Reto e Arestas Vivas) */}
                    <div
                        className="absolute left-1/2 -top-8 -translate-x-1/2 w-[2px] h-8 bg-black dark:bg-white z-[1002] pointer-events-auto cursor-grab active:cursor-grabbing origin-bottom"
                    >
                        <motion.div
                            drag
                            dragMomentum={false}
                            dragElastic={0}
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            onPan={handleRotate}
                            onPanEnd={handleRotateEnd}
                            className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white dark:bg-zinc-950 border-2 border-black dark:border-white hover:scale-125 transition-transform"
                        />
                    </div>
                </>
            )}

            <div className={cn(
                "w-full h-full transition-transform duration-200",
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
