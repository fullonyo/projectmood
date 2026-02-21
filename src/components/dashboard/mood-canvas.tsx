import { motion, useMotionValue, useTransform } from "framer-motion"
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
    const getFallbackSize = (type: string) => getBlockFallbackSize(type)

    // 📌 Viewport Scale
    const viewportScale = useViewportScale()
    const scaleValue = (v: number | 'auto') => typeof v === 'number' ? v * viewportScale : (v === 'auto' ? 200 * viewportScale : v)
    const unscaleValue = (v: number | 'auto') => typeof v === 'number' ? Math.round(v / viewportScale) : v

    // ─── 1. ABSOLUTE SOURCE OF TRUTH (Bypasses React Render Cycle) ───
    const stateRef = useRef({
        x: block.x,
        y: block.y,
        width: typeof block.width === 'number' ? scaleValue(block.width) : scaleValue(getFallbackSize(block.type) as number),
        height: typeof block.height === 'number' ? scaleValue(block.height) : scaleValue(getFallbackSize(block.type) as number),
        rotation: block.rotation || 0,
        isInteracting: false,
        isInteractiveMode: false
    })

    // ─── 2. HIGH-PERFORMANCE DOM BINDINGS ───
    const mvX = useMotionValue(stateRef.current.x)
    const mvY = useMotionValue(stateRef.current.y)
    const mvW = useMotionValue(stateRef.current.width)
    const mvH = useMotionValue(stateRef.current.height)
    const mvR = useMotionValue(stateRef.current.rotation)

    // CSS bindings for absolute positioning based on Canvas Parent
    const styleLeft = useTransform(mvX, (v: number) => `${v}%`)
    const styleTop = useTransform(mvY, (v: number) => `${v}%`)

    // Shift key tracking
    const [shiftHeld, setShiftHeld] = useState(false)
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

    // Sync from server / other clients (ONLY when not user-interactings here)
    useEffect(() => {
        if (!stateRef.current.isInteracting) {
            const newW = typeof block.width === 'number' ? scaleValue(block.width) : scaleValue(getFallbackSize(block.type) as number);
            const newH = typeof block.height === 'number' ? scaleValue(block.height) : scaleValue(getFallbackSize(block.type) as number);

            stateRef.current.x = block.x;
            stateRef.current.y = block.y;
            stateRef.current.width = newW as number;
            stateRef.current.height = newH as number;
            stateRef.current.rotation = block.rotation || 0;

            mvX.set(block.x);
            mvY.set(block.y);
            mvW.set(newW as number);
            mvH.set(newH as number);
            mvR.set(block.rotation || 0);
        }
    }, [block.x, block.y, block.width, block.height, block.rotation, viewportScale])

    // UI flags for styled classes (opacity, pointer-events, active borders)
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [isInteractiveMode, setIsInteractiveMode] = useState(false)
    const isInteractiveBlock = ['video', 'music', 'guestbook', 'media'].includes(block.type)

    useEffect(() => {
        if (!isSelected) {
            setIsInteractiveMode(false)
            stateRef.current.isInteractiveMode = false
        }
    }, [isSelected])

    // ─── 3. PAN HANDLERS (Drag, Resize, Rotate) ───

    // DRAG BODY (Replacing unreliable drag={true} of Framer Motion)
    const handleDragPan = (e: any, info: any) => {
        if (stateRef.current.isInteractiveMode) return;
        if (!canvasRef.current) return;

        const canvas = canvasRef.current.getBoundingClientRect();
        const dxPercent = (info.delta.x / canvas.width) * 100;
        const dyPercent = (info.delta.y / canvas.height) * 100;

        let newX = stateRef.current.x + dxPercent;
        let newY = stateRef.current.y + dyPercent;

        // Smart edge collision
        const wPercent = (stateRef.current.width / canvas.width) * 100;
        const hPercent = (stateRef.current.height / canvas.height) * 100;

        newX = Math.max(0, Math.min(100 - wPercent, newX));
        newY = Math.max(0, Math.min(100 - hPercent, newY));

        stateRef.current.x = newX;
        stateRef.current.y = newY;

        mvX.set(newX);
        mvY.set(newY);
    }

    const handleDragStart = (e: any) => {
        if (stateRef.current.isInteractiveMode) return;
        setIsDragging(true);
        stateRef.current.isInteracting = true;
        onSelect(false);
    }

    const handleDragEnd = () => {
        if (stateRef.current.isInteractiveMode) return;
        setIsDragging(false);
        stateRef.current.isInteracting = false;

        onUpdate({
            x: parseFloat(stateRef.current.x.toFixed(4)),
            y: parseFloat(stateRef.current.y.toFixed(4))
        });
    }

    // RESIZE HANDLES
    const handleResizePan = (handle: ResizeHandle, e: any, info: any) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current.getBoundingClientRect();

        const result = calculateResize(
            handle,
            info.delta.x,
            info.delta.y,
            {
                x: stateRef.current.x,
                y: stateRef.current.y,
                width: stateRef.current.width,
                height: stateRef.current.height
            },
            canvas.width,
            canvas.height,
            shiftHeld
        );

        stateRef.current.x = result.x;
        stateRef.current.y = result.y;
        stateRef.current.width = result.width;
        stateRef.current.height = result.height;

        mvX.set(result.x);
        mvY.set(result.y);
        mvW.set(result.width);
        mvH.set(result.height);
    }

    const handleResizeStart = (e: any) => {
        e.stopPropagation();
        setIsResizing(true);
        stateRef.current.isInteracting = true;
    }

    const handleResizeEnd = () => {
        setIsResizing(false);
        stateRef.current.isInteracting = false;

        onUpdate({
            x: parseFloat(stateRef.current.x.toFixed(4)),
            y: parseFloat(stateRef.current.y.toFixed(4)),
            width: unscaleValue(stateRef.current.width) as number,
            height: unscaleValue(stateRef.current.height) as number
        });
    }

    // ROTATE HANDLE
    const handleRotatePan = (e: any, info: any) => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current.getBoundingClientRect();
        const blockCenterX = canvas.left + (stateRef.current.x / 100) * canvas.width + (stateRef.current.width / 2);
        const blockCenterY = canvas.top + (stateRef.current.y / 100) * canvas.height + (stateRef.current.height / 2);

        const newRot = calculateRotation(blockCenterX, blockCenterY, info.point.x, info.point.y, shiftHeld);

        stateRef.current.rotation = newRot;
        mvR.set(newRot);
    }

    const handleRotateStart = (e: any) => {
        e.stopPropagation();
        stateRef.current.isInteracting = true;
    }

    const handleRotateEnd = () => {
        stateRef.current.isInteracting = false;
        onUpdate({ rotation: stateRef.current.rotation });
    }

    const resetRotation = () => {
        stateRef.current.rotation = 0;
        mvR.set(0);
        onUpdate({ rotation: 0 })
    }

    const handleDelete = () => onDeleteRequest(block.id)

    const toggleInteraction = (e: any) => {
        e.stopPropagation();
        const nextState = !isInteractiveMode;
        setIsInteractiveMode(nextState);
        stateRef.current.isInteractiveMode = nextState;
    }

    // ─── Render Components ───────────────────────────────────────────
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
            <motion.div
                key={handle}
                onPanStart={handleResizeStart}
                onPan={(e, i) => handleResizePan(handle, e, i)}
                onPanEnd={handleResizeEnd}
                className={cn(
                    "absolute z-[1002] pointer-events-auto bg-black dark:bg-white border hover:scale-[1.2] active:scale-95 transition-transform",
                    positionClasses[handle],
                    handleSize,
                    isCorner ? "border-transparent" : "border-white dark:border-black"
                )}
                style={{ cursor: getResizeCursor(handle), touchAction: 'none' }}
            />
        )
    }

    const allHandles: ResizeHandle[] = ['br', 'bl', 'tr', 'tl', 'top', 'bottom', 'left', 'right']

    return (
        <motion.div
            onPanStart={handleDragStart}
            onPan={handleDragPan}
            onPanEnd={handleDragEnd}
            style={{
                left: styleLeft,
                top: styleTop,
                width: mvW,
                height: mvH,
                rotate: mvR,
                zIndex: isDragging || isSelected ? 999 : (block.zIndex || 1),
                boxShadow: isSelected ? `0 0 0 2px ${themeConfig.bg}, 0 0 0 4px ${profile.primaryColor || '#3b82f6'}` : 'none',
                touchAction: 'none',
                transformOrigin: 'center'
            }}
            onClick={(e) => {
                if (isInteractiveMode) return
                e.stopPropagation()
                onSelect(false)
            }}
            onDoubleClick={(e) => {
                if (isInteractiveMode) return
                e.stopPropagation()
                onSelect(false)
            }}
            whileHover={{ zIndex: 998 }}
            className={cn(
                "absolute group",
                !isInteractiveMode && "select-none touch-none",
                isSelected ? "cursor-default" : "cursor-grab active:cursor-grabbing"
            )}
            data-block-id={block.id}
        >
            {/* Selection Border Outline */}
            {isSelected && (
                <div
                    className={cn(
                        "absolute -inset-[3px] pointer-events-none z-[1001] transition-all",
                        isInteractiveMode ? "border-[3px] border-white shadow-none mix-blend-difference" : "border border-dashed border-black/50 dark:border-white/50 bg-black/5"
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
                    {stateRef.current.rotation !== 0 && (
                        <>
                            <button onClick={resetRotation} className="px-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400" title={t('common.reset_rotation')}>
                                {stateRef.current.rotation}°
                            </button>
                            <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                        </>
                    )}
                    {isInteractiveBlock && (
                        <>
                            <button
                                onClick={toggleInteraction}
                                className={cn(
                                    "p-1.5 transition-all outline outline-1 -outline-offset-1 border border-transparent",
                                    isInteractiveMode
                                        ? "bg-black text-white dark:bg-white dark:text-black outline-current animate-pulse"
                                        : "hover:bg-black/5 text-zinc-600 dark:text-zinc-400 outline-transparent"
                                )}
                                title={isInteractiveMode ? t('common.disable_interaction') : t('common.enable_interaction')}
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

                    {/* Rotation Handle */}
                    <div className="absolute left-1/2 -top-8 -translate-x-1/2 w-[2px] h-8 bg-black dark:bg-white z-[1002] pointer-events-auto origin-bottom">
                        <motion.div
                            onPanStart={handleRotateStart}
                            onPan={handleRotatePan}
                            onPanEnd={handleRotateEnd}
                            className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white dark:bg-zinc-950 border-2 border-black dark:border-white hover:scale-125 transition-transform cursor-grab active:cursor-grabbing"
                            style={{ touchAction: 'none' }}
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
                    isPublic={isInteractiveMode}
                />
            </div>
        </motion.div>
    )
}
