"use client"

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { useState, useRef, useEffect, useCallback } from "react"
import { Pencil, Lock, Move, MousePointer2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { useViewportScale, scaleBlockSize } from "@/lib/canvas-scale"
import { BlockRenderer } from "./block-renderer"
import {
    calculateResize,
    getResizeCursor,
    ResizeHandle,
    calculateRotation,
    calculateSnap,
    Guideline,
    DistanceGuide
} from "@/lib/canvas-transforms"
import { MoodBlock, Profile, ThemeConfig } from "@/types/database"

interface CanvasItemProps {
    block: MoodBlock
    canvasRef: React.RefObject<HTMLDivElement | null>
    isSelected: boolean
    onSelect: (toggle?: boolean) => void
    onUpdate: (updates: Partial<MoodBlock>) => void
    profile: Profile
    themeConfig: ThemeConfig
    onDeleteRequest: (id: string) => void
    blocks: MoodBlock[]
    setGuidelines: (feedback: { guidelines: Guideline[], distances: DistanceGuide[] }) => void
    onContextMenu: (e: React.MouseEvent, id: string) => void
    selectedIds: string[]
    onMultiMove?: (dx: number, dy: number) => void
    onMultiMoveEnd?: () => void
}

export function CanvasItem({
    block,
    canvasRef,
    isSelected,
    onSelect,
    onUpdate,
    profile,
    themeConfig,
    onDeleteRequest,
    blocks,
    setGuidelines,
    onContextMenu,
    selectedIds,
    onMultiMove,
    onMultiMoveEnd
}: CanvasItemProps) {
    const { t } = useTranslation()
    const viewportScale = useViewportScale()

    const unscaleValue = (v: number | 'auto') => typeof v === 'number' ? Math.round(v / viewportScale) : v

    // --- State & Motion Values ---
    const stateRef = useRef({
        x: block.x,
        y: block.y,
        width: scaleBlockSize(block.width, viewportScale, block.type, 'w') as number,
        height: scaleBlockSize(block.height, viewportScale, block.type, 'h') as number,
        rotation: block.rotation || 0,
        isInteracting: false,
        isInteractiveMode: false,
        startX: block.x,
        startY: block.y
    })

    const mvX = useMotionValue(stateRef.current.x)
    const mvY = useMotionValue(stateRef.current.y)
    const mvW = useMotionValue(stateRef.current.width)
    const mvH = useMotionValue(stateRef.current.height)
    const mvR = useMotionValue(stateRef.current.rotation)

    const styleLeft = useTransform(mvX, (v: number) => `${v}%`)
    const styleTop = useTransform(mvY, (v: number) => `${v}%`)

    const [shiftHeld, setShiftHeld] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [isRotating, setIsRotating] = useState(false)
    const [isInteractiveMode, setIsInteractiveMode] = useState(false)

    const isInteractiveBlock = ['video', 'music', 'guestbook', 'media'].includes(block.type)
    const isMultiSelect = selectedIds.length > 1;

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

    useEffect(() => {
        if (!stateRef.current.isInteracting) {
            const newW = scaleBlockSize(block.width, viewportScale, block.type, 'w') as number;
            const newH = scaleBlockSize(block.height, viewportScale, block.type, 'h') as number;
            stateRef.current.x = block.x;
            stateRef.current.y = block.y;
            stateRef.current.width = newW;
            stateRef.current.height = newH;
            stateRef.current.rotation = block.rotation || 0;
            mvX.set(block.x);
            mvY.set(block.y);
            mvW.set(newW);
            mvH.set(newH);
            mvR.set(block.rotation || 0);
        }
    }, [block.x, block.y, block.width, block.height, block.rotation, viewportScale])

    useEffect(() => {
        if (!isSelected) {
            setIsInteractiveMode(false)
            stateRef.current.isInteractiveMode = false
        }
    }, [isSelected])

    // --- Interaction Handlers ---
    const handleDragPan = useCallback((e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (stateRef.current.isInteractiveMode || block.isLocked) return;
        if (!canvasRef.current) return;

        const canvas = canvasRef.current.getBoundingClientRect();
        const dxPercent = (info.delta.x / canvas.width) * 100;
        const dyPercent = (info.delta.y / canvas.height) * 100;

        // Multi-select drag logic
        if (isMultiSelect && isSelected && onMultiMove) {
            onMultiMove(dxPercent, dyPercent);

            // Must also move ourselves visually since we are the source of the interaction
            stateRef.current.x += dxPercent;
            stateRef.current.y += dyPercent;
            mvX.set(stateRef.current.x);
            mvY.set(stateRef.current.y);
            return;
        }

        const totalDxPercent = (info.offset.x / canvas.width) * 100;
        const totalDyPercent = (info.offset.y / canvas.height) * 100;

        let newX = stateRef.current.startX + totalDxPercent;
        let newY = stateRef.current.startY + totalDyPercent;

        if (shiftHeld) {
            if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
                newY = stateRef.current.startY;
            } else {
                newX = stateRef.current.startX;
            }
        }

        const otherBlocks = blocks.filter(b => b.id !== block.id).map(b => ({
            ...b,
            width: b.width ?? 'auto',
            height: b.height ?? 'auto'
        }))

        const snap = calculateSnap(
            newX, newY, stateRef.current.width, stateRef.current.height,
            canvas.width, canvas.height,
            otherBlocks as any
        )

        stateRef.current.x = snap.x;
        stateRef.current.y = snap.y;
        setGuidelines({ guidelines: snap.guidelines, distances: snap.distances })
        mvX.set(snap.x);
        mvY.set(snap.y);
    }, [block.id, block.isLocked, blocks, canvasRef, mvX, mvY, setGuidelines, isMultiSelect, isSelected, onMultiMove, shiftHeld])

    const handleDragStart = useCallback(() => {
        if (stateRef.current.isInteractiveMode || block.isLocked) return;
        setIsDragging(true);
        stateRef.current.isInteracting = true;
        stateRef.current.startX = stateRef.current.x;
        stateRef.current.startY = stateRef.current.y;

        // If not selected yet, select it (unless shift is held, which is handled in onClick)
        if (!isSelected) {
            onSelect(false);
        }
    }, [block.isLocked, isSelected, onSelect])

    const handleDragEnd = useCallback(() => {
        if (stateRef.current.isInteractiveMode) return;
        setIsDragging(false);
        stateRef.current.isInteracting = false;

        if (isMultiSelect && isSelected && onMultiMoveEnd) {
            onMultiMoveEnd();
        } else {
            onUpdate({
                x: parseFloat(stateRef.current.x.toFixed(4)),
                y: parseFloat(stateRef.current.y.toFixed(4))
            });
        }
        setGuidelines({ guidelines: [], distances: [] })
    }, [onUpdate, setGuidelines, isMultiSelect, isSelected, onMultiMoveEnd])

    const handleResizePan = useCallback((handle: ResizeHandle, e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (block.isLocked) return;
        if (!canvasRef.current) return;
        const canvas = canvasRef.current.getBoundingClientRect();
        const result = calculateResize(
            handle, info.delta.x, info.delta.y,
            { x: stateRef.current.x, y: stateRef.current.y, width: stateRef.current.width, height: stateRef.current.height },
            canvas.width, canvas.height, shiftHeld
        );
        stateRef.current.x = result.x; stateRef.current.y = result.y;
        stateRef.current.width = result.width; stateRef.current.height = result.height;
        mvX.set(result.x); mvY.set(result.y); mvW.set(result.width); mvH.set(result.height);
    }, [block.isLocked, canvasRef, mvH, mvW, mvX, mvY, shiftHeld])

    const handleResizeStart = useCallback((e: any, info: PanInfo) => {
        if (block.isLocked) return;
        setIsResizing(true); stateRef.current.isInteracting = true;
    }, [block.isLocked])

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false); stateRef.current.isInteracting = false;
        onUpdate({
            x: parseFloat(stateRef.current.x.toFixed(4)),
            y: parseFloat(stateRef.current.y.toFixed(4)),
            width: unscaleValue(stateRef.current.width) as number,
            height: unscaleValue(stateRef.current.height) as number
        });
    }, [onUpdate, viewportScale])

    const handleRotatePan = useCallback((e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (block.isLocked) return;
        if (!canvasRef.current) return;
        const canvas = canvasRef.current.getBoundingClientRect();
        const blockCenterX = canvas.left + (stateRef.current.x / 100) * canvas.width + (stateRef.current.width / 2);
        const blockCenterY = canvas.top + (stateRef.current.y / 100) * canvas.height + (stateRef.current.height / 2);
        const newRot = calculateRotation(blockCenterX, blockCenterY, info.point.x, info.point.y, shiftHeld);
        stateRef.current.rotation = newRot;
        mvR.set(newRot);
    }, [block.isLocked, canvasRef, mvR, shiftHeld])

    const handleRotateStart = useCallback((e: any, info: PanInfo) => {
        if (block.isLocked) return;
        setIsRotating(true); stateRef.current.isInteracting = true;
    }, [block.isLocked])

    const handleRotateEnd = useCallback(() => {
        stateRef.current.isInteracting = false; setIsRotating(false);
        onUpdate({ rotation: stateRef.current.rotation });
    }, [onUpdate])

    const resetRotation = useCallback(() => {
        stateRef.current.rotation = 0; mvR.set(0);
        onUpdate({ rotation: 0 })
    }, [mvR, onUpdate])

    const toggleInteraction = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const nextState = !isInteractiveMode;
        setIsInteractiveMode(nextState);
        stateRef.current.isInteractiveMode = nextState;
    }, [isInteractiveMode])

    // --- Sub-Renders ---
    const renderHandle = (handle: ResizeHandle) => {
        if (isMultiSelect) return null; // Hide handles in multi-select
        const isCorner = ['br', 'bl', 'tr', 'tl'].includes(handle)
        const handleSize = isCorner ? 'w-2.5 h-2.5' : (handle === 'top' || handle === 'bottom' ? 'w-6 h-1' : 'w-1 h-6')
        const positionClasses: Record<ResizeHandle, string> = {
            br: '-bottom-1.5 -right-1.5', bl: '-bottom-1.5 -left-1.5', tr: '-top-1.5 -right-1.5', tl: '-top-1.5 -left-1.5',
            top: '-top-0.5 left-1/2 -translate-x-1/2', bottom: '-bottom-0.5 left-1/2 -translate-x-1/2',
            left: 'top-1/2 -left-0.5 -translate-y-1/2', right: 'top-1/2 -right-0.5 -translate-y-1/2',
        }
        return (
            <motion.div
                key={handle}
                onPanStart={handleResizeStart}
                onPan={(e, i) => handleResizePan(handle, e, i)}
                onPanEnd={handleResizeEnd}
                className={cn(
                    "absolute z-[1002] pointer-events-auto bg-black dark:bg-white border hover:scale-[1.2] active:scale-95 transition-transform",
                    positionClasses[handle], handleSize, isCorner ? "border-transparent" : "border-white dark:border-black"
                )}
                style={{ cursor: getResizeCursor(handle), touchAction: 'none' }}
            />
        )
    }

    return (
        <motion.div
            onPanStart={handleDragStart}
            onPan={handleDragPan}
            onPanEnd={handleDragEnd}
            style={{
                left: styleLeft, top: styleTop, width: mvW, height: mvH, rotate: mvR,
                zIndex: isDragging || isSelected ? 999 : (block.zIndex || 10),
                boxShadow: isSelected ? `0 0 0 2px ${themeConfig?.bg || '#000'}, 0 0 0 4px ${profile?.primaryColor || '#3b82f6'}` : 'none',
                touchAction: 'none', transformOrigin: 'center',
                display: block.isHidden ? 'none' : 'block',
                opacity: block.isHidden ? 0 : 1,
                pointerEvents: block.isHidden ? 'none' : 'auto'
            }}
            onClick={(e) => {
                if (isInteractiveMode) return;
                e.stopPropagation();
                onSelect(e.shiftKey);
            }}
            onDoubleClick={(e) => {
                if (isInteractiveMode) return;
                e.stopPropagation();
                onSelect(false);
            }}
            whileHover={{ zIndex: 998 }}
            className={cn(
                "absolute group will-change-transform",
                !isInteractiveMode && "select-none touch-none",
                isSelected ? "cursor-default" : "cursor-grab active:cursor-grabbing"
            )}
            onContextMenu={(e) => onContextMenu(e, block.id)}
            data-block-id={block.id}
        >
            {/* Selection UI */}
            {isSelected && (
                <>
                    <div className={cn(
                        "absolute -inset-[3px] pointer-events-none z-[1001] transition-all",
                        isInteractiveMode ? "border-[3px] border-white shadow-none mix-blend-difference" : "border border-dashed border-black/50 dark:border-white/50 bg-black/5"
                    )} />

                    {/* Action Toolbar - HIDE IF MULTI-SELECT */}
                    {!isMultiSelect && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                            transition={{
                                type: 'spring',
                                damping: 20,
                                stiffness: 300,
                                mass: 0.8
                            }}
                            className={cn(
                                "absolute left-1/2 flex items-center gap-1.5 px-2 py-1.5 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border border-black/10 dark:border-white/10 z-[1001] pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-none",
                                block.y < 15 ? "top-full mt-4" : "-top-[50px]"
                            )}
                        >
                            <button
                                onClick={() => onSelect(false)}
                                className="p-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group/edit"
                                title={t('common.edit')}
                                aria-label={t('common.edit')}
                            >
                                <Pencil className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover/edit:text-current" />
                            </button>
                            <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />

                            {block.isLocked ? (
                                <>
                                    <div className="p-1.5 text-amber-500" title={t('canvas.layer_unlock')} aria-label={t('canvas.layer_unlock')}>
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                                </>
                            ) : (
                                <>
                                    <div
                                        className={cn(
                                            "p-1.5 cursor-move transition-colors group/move",
                                            isDragging ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/5"
                                        )}
                                        title={t('common.move')}
                                        aria-label={t('common.move')}
                                    >
                                        <Move className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-active/move:text-current" />
                                    </div>
                                    <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                                </>
                            )}

                            {isInteractiveBlock && (
                                <>
                                    <button
                                        onClick={toggleInteraction}
                                        className={cn("p-1.5 transition-all outline outline-1 -outline-offset-1", isInteractiveMode ? "bg-black text-white dark:bg-white dark:text-black animate-pulse" : "hover:bg-black/5 text-zinc-600 dark:text-zinc-400")}
                                        title={isInteractiveMode ? t('common.disable_interaction') : t('common.enable_interaction')}
                                        aria-label={isInteractiveMode ? t('common.disable_interaction') : t('common.enable_interaction')}
                                    >
                                        <MousePointer2 className="w-4 h-4" />
                                    </button>
                                    <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                                </>
                            )}

                            {stateRef.current.rotation !== 0 && (
                                <>
                                    <button
                                        onClick={resetRotation}
                                        disabled={block.isLocked}
                                        className={cn("px-2 transition-colors text-[9px] font-black uppercase tracking-widest", block.isLocked ? "text-zinc-300 dark:text-zinc-700" : "hover:bg-black hover:text-white text-zinc-600 dark:text-zinc-400")}
                                        aria-label={`${t('canvas.layers_normalize')} rotation`}
                                    >
                                        {stateRef.current.rotation}°
                                    </button>
                                    <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                                </>
                            )}

                            {!block.isLocked && (
                                <button
                                    onClick={() => onDeleteRequest(block.id)}
                                    className="p-1.5 hover:bg-red-500/10 hover:text-red-500 transition-colors text-zinc-600 dark:text-zinc-400 group/del"
                                    title={`${t('common.delete')} (Del)`}
                                    aria-label={`${t('common.delete')} (Del)`}
                                >
                                    <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                </button>
                            )}
                        </motion.div>
                    )}

                    {!block.isLocked && ['br', 'bl', 'tr', 'tl', 'top', 'bottom', 'left', 'right'].map(h => renderHandle(h as ResizeHandle))}

                    {!block.isLocked && !isMultiSelect && (
                        <div className="absolute left-1/2 -top-8 -translate-x-1/2 w-[2px] h-8 bg-black dark:bg-white z-[1002] pointer-events-auto origin-bottom">
                            <motion.div
                                onPanStart={handleRotateStart} onPan={handleRotatePan} onPanEnd={handleRotateEnd}
                                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white dark:bg-zinc-950 border-2 border-black dark:border-white hover:scale-125 transition-transform cursor-grab active:cursor-grabbing"
                                style={{ touchAction: 'none' }}
                            />
                        </div>
                    )}
                </>
            )}

            <div className={cn("w-full h-full transition-transform duration-200", isDragging && "scale-[1.02] rotate-1", (isDragging || isResizing) && "pointer-events-none")}>
                <BlockRenderer block={block} isPublic={isInteractiveMode} />
            </div>
        </motion.div>
    )
}
