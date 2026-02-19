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


interface MoodCanvasProps {
    blocks: any[]
    profile: any
    backgroundEffect: string
    selectedId: string | null
    setSelectedId: (id: string | null) => void
    onUpdateBlock: (id: string, updates: any) => void
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
                <BackgroundEffect type={backgroundEffect} primaryColor={profile.primaryColor} />
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
    block: any,
    canvasRef: React.RefObject<HTMLDivElement | null>,
    isSelected: boolean,
    onSelect: (toggle?: boolean) => void,
    onUpdate: (content: any) => void,
    profile: any,
    themeConfig: any,
    onDeleteRequest: (id: string) => void
}) {
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [localRotation, setLocalRotation] = useState(block.rotation || 0)
    const [size, setSize] = useState({
        width: block.width || 0,
        height: block.height || 0
    })

    const [coords, setCoords] = useState({
        x: block.x || 0,
        y: block.y || 0
    })

    // Sync with external state (blocks from useCanvasManager)
    useEffect(() => {
        if (!isDragging && !isResizing) {
            setSize({
                width: block.width || 0,
                height: block.height || 0
            })
            setCoords({
                x: block.x || 0,
                y: block.y || 0
            })
        }
    }, [block.width, block.height, block.x, block.y, isDragging, isResizing])

    // 🏎️ GPU-ACCELERATED VALUES
    const mvX = useMotionValue(0)
    const mvY = useMotionValue(0)

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

        const newX = parseFloat(Math.max(0, Math.min(100, coords.x + deltaXPercent)).toFixed(4))
        const newY = parseFloat(Math.max(0, Math.min(100, coords.y + deltaYPercent)).toFixed(4))

        setCoords({ x: newX, y: newY })
        onUpdate({ x: newX, y: newY })

        mvX.set(0)
        mvY.set(0)
    }

    const resizeStartRef = useRef<{
        widthPercent: number,
        heightPercent: number,
        xPercent: number,
        yPercent: number,
        canvasWidth: number,
        canvasHeight: number
    } | null>(null)

    const handleResizeStart = (event: any, corner: string) => {
        if (!canvasRef.current) return
        const canvasRect = canvasRef.current.getBoundingClientRect()

        // Capture stabilized initial state in %
        resizeStartRef.current = {
            widthPercent: size.width || (event.target.parentElement.offsetWidth / canvasRect.width) * 100,
            heightPercent: size.height || (event.target.parentElement.offsetHeight / canvasRect.height) * 100,
            xPercent: coords.x,
            yPercent: coords.y,
            canvasWidth: canvasRect.width,
            canvasHeight: canvasRect.height
        }
    }

    const handleResize = (event: any, info: any, corner: 'br' | 'bl' | 'tr' | 'tl') => {
        setIsResizing(true)
        const start = resizeStartRef.current
        if (!start) return

        // Calculate deltas in %
        const dxPercent = (info.offset.x / start.canvasWidth) * 100
        const dyPercent = (info.offset.y / start.canvasHeight) * 100

        let newW = start.widthPercent
        let newH = start.heightPercent
        let newX = start.xPercent
        let newY = start.yPercent

        if (corner === 'br') {
            newW = start.widthPercent + dxPercent
            newH = start.heightPercent + dyPercent
        } else if (corner === 'bl') {
            newW = start.widthPercent - dxPercent
            newX = start.xPercent + dxPercent
            newH = start.heightPercent + dyPercent
        } else if (corner === 'tr') {
            newW = start.widthPercent + dxPercent
            newH = start.heightPercent - dyPercent
            newY = start.yPercent + dyPercent
        } else if (corner === 'tl') {
            newW = start.widthPercent - dxPercent
            newX = start.xPercent + dxPercent
            newH = start.heightPercent - dyPercent
            newY = start.yPercent + dyPercent
        }

        // Constraints in %
        const minW = (40 / start.canvasWidth) * 100
        const minH = (20 / start.canvasHeight) * 100

        if (newW < minW) {
            if (corner === 'tl' || corner === 'bl') newX = start.xPercent + (start.widthPercent - minW)
            newW = minW
        }
        if (newH < minH) {
            if (corner === 'tl' || corner === 'tr') newY = start.yPercent + (start.heightPercent - minH)
            newH = minH
        }

        setSize({ width: newW, height: newH })
        setCoords({ x: newX, y: newY })
    }

    const handleResizeEnd = () => {
        setIsResizing(false)
        resizeStartRef.current = null
        onUpdate({
            width: size.width,
            height: size.height,
            x: coords.x,
            y: coords.y
        })
    }

    const handleDelete = () => onDeleteRequest(block.id)

    const rotate = () => {
        const newRotation = (localRotation + 15) % 360
        setLocalRotation(newRotation)
        onUpdate({ rotation: newRotation })
    }

    const [isInteracting, setIsInteracting] = useState(false)
    const isInteractiveBlock = ['video', 'music', 'guestbook', 'media'].includes(block.type)

    // Reset interaction when deselected
    useEffect(() => {
        if (!isSelected) setIsInteracting(false)
    }, [isSelected])

    return (
        <motion.div
            drag={!isResizing && !isInteracting}
            dragMomentum={false}
            dragConstraints={canvasRef}
            dragElastic={0}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
                x: mvX,
                y: mvY,
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                width: size.width ? `${size.width}%` : 'auto',
                height: size.height ? `${size.height}%` : 'auto',
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
                // Evita o "toggle" que desmarca o bloco ao clicar nele. 
                // Seleção mantida; deseleção apenas no canvas.
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
        >
            {/* Selection Border Outline (Standardized) */}
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
                    <button onClick={rotate} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-none transition-colors" title="Girar">
                        <RotateCw className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
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

            {/* Resize Handles (Corners) */}
            {isSelected && (
                <>
                    {/* BR */}
                    <div
                        onPointerDown={(e) => {
                            e.stopPropagation()
                            setIsResizing(true)
                            handleResizeStart(e, 'br')
                        }}
                        onPointerUp={() => setIsResizing(false)}
                        className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-black dark:border-white rounded-none cursor-nwse-resize z-[1002] pointer-events-auto hover:scale-125 transition-transform"
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
                            handleResizeStart(e, 'bl')
                        }}
                        onPointerUp={() => setIsResizing(false)}
                        className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-black dark:border-white rounded-none cursor-nesw-resize z-[1002] pointer-events-auto hover:scale-125 transition-transform"
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
                            handleResizeStart(e, 'tr')
                        }}
                        onPointerUp={() => setIsResizing(false)}
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-black dark:border-white rounded-none cursor-nesw-resize z-[1002] pointer-events-auto hover:scale-125 transition-transform"
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
                            handleResizeStart(e, 'tl')
                        }}
                        onPointerUp={() => setIsResizing(false)}
                        className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-black dark:border-white rounded-none cursor-nwse-resize z-[1002] pointer-events-auto hover:scale-125 transition-transform"
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
