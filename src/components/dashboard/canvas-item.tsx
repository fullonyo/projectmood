"use client"

// Helper to extract absolute viewport coordinates reliably across mouse/touch
const getClientPos = (e: MouseEvent | TouchEvent | PointerEvent | any) => {
    const isTouch = 'touches' in e && e.touches.length > 0;
    return {
        x: isTouch ? e.touches[0].clientX : e.clientX,
        y: isTouch ? e.touches[0].clientY : e.clientY
    };
};

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { useState, useRef, useEffect, useCallback } from "react"
import { Pencil, Lock, Move, MousePointer2, Trash2, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { useViewportScale, scaleBlockSize } from "@/lib/canvas-scale"
import { BlockRenderer } from "./block-renderer"
import { addMoodBlock } from "@/actions/profile"
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
import { useCanvasInteraction } from "./canvas-interaction-context"

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

import React, { memo } from "react"

export const CanvasItem = memo(({
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
}: CanvasItemProps) => {
    const { t } = useTranslation()
    const viewportScale = useViewportScale()
    const { hoveredBlockIds, setHoveredBlockIds } = useCanvasInteraction()

    const unscaleValue = (v: number | 'auto') => typeof v === 'number' ? Math.round(v / viewportScale) : v
    const itemRef = useRef<HTMLDivElement>(null)

    const stateRef = useRef({
        x: block.x,
        y: block.y,
        width: scaleBlockSize(block.width, viewportScale, block.type, 'w') as number,
        height: scaleBlockSize(block.height, viewportScale, block.type, 'h') as number,
        rotation: block.rotation || 0,
        isInteracting: false,
        isInteractiveMode: false,
        isRotating: false,
        startX: block.x,
        startY: block.y,
        initialMouseAngle: 0,
        initialRotation: 0
    })

    const mvX = useMotionValue(stateRef.current.x)
    const mvY = useMotionValue(stateRef.current.y)
    const mvW = useMotionValue(stateRef.current.width)
    const mvH = useMotionValue(stateRef.current.height)
    const mvR = useMotionValue(stateRef.current.rotation)

    const styleLeft = useTransform(mvX, (v: number) => `${v}%`)
    const styleTop = useTransform(mvY, (v: number) => `${v}%`)

    const [shiftHeld, setShiftHeld] = useState(false)
    const [altHeld, setAltHeld] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [isRotating, setIsRotating] = useState(false)
    const [isInteractiveMode, setIsInteractiveMode] = useState(false)

    const isInteractiveBlock = ['video', 'music', 'guestbook', 'media'].includes(block.type)
    const isMultiSelect = selectedIds.length > 1;

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setShiftHeld(true)
            if (e.key === 'Alt') setAltHeld(true)
        }
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setShiftHeld(false)
            if (e.key === 'Alt') setAltHeld(false)
        }
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

    const handleDragPan = useCallback((e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (stateRef.current.isInteractiveMode || block.isLocked || stateRef.current.isRotating) return;
        if (!canvasRef.current) return;

        const canvas = canvasRef.current.getBoundingClientRect();
        const dxPercent = (info.delta.x / canvas.width) * 100;
        const dyPercent = (info.delta.y / canvas.height) * 100;

        if (isMultiSelect && isSelected && onMultiMove) {
            onMultiMove(dxPercent, dyPercent);

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
        if (stateRef.current.isInteractiveMode || block.isLocked || stateRef.current.isRotating) return;
        setIsDragging(true);
        stateRef.current.isInteracting = true;
        stateRef.current.startX = stateRef.current.x;
        stateRef.current.startY = stateRef.current.y;

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
            if (altHeld) {
                const wRaw = unscaleValue(stateRef.current.width);
                const hRaw = unscaleValue(stateRef.current.height);
                addMoodBlock(block.type, block.content, {
                    x: parseFloat(stateRef.current.x.toFixed(4)),
                    y: parseFloat(stateRef.current.y.toFixed(4)),
                    width: typeof wRaw === 'number' ? wRaw : undefined,
                    height: typeof hRaw === 'number' ? hRaw : undefined
                });
                mvX.set(stateRef.current.startX);
                mvY.set(stateRef.current.startY);
                stateRef.current.x = stateRef.current.startX;
                stateRef.current.y = stateRef.current.startY;
            } else {
                onUpdate({
                    x: parseFloat(stateRef.current.x.toFixed(4)),
                    y: parseFloat(stateRef.current.y.toFixed(4))
                });
            }
        }
        setGuidelines({ guidelines: [], distances: [] })
    }, [onUpdate, setGuidelines, isMultiSelect, isSelected, onMultiMoveEnd, altHeld, block.type, block.content])

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

    // --- ZERO-TEARING ARCHITECTURE: SYNC & CUSTOM DOM EVENTS ---
    
    // 1. Sync external DB changes cleanly to GPU when not interacting
    useEffect(() => {
        if (!stateRef.current.isInteracting && !isRotating && block.rotation !== undefined && block.rotation !== stateRef.current.rotation) {
            stateRef.current.rotation = block.rotation;
            mvR.set(block.rotation);
        }
    }, [block.rotation, isRotating, mvR]);

    // 2. Listen to custom High-Performance Group Rotation events
    useEffect(() => {
        if (!isSelected || block.isLocked) return;

        const handleGroupRotate = (e: any) => {
            const { deltaAngle } = e.detail;
            const newRotation = (block.rotation || 0) + deltaAngle;
            mvR.set(newRotation);
            stateRef.current.rotation = newRotation;
        };

        window.addEventListener('mood-group-rotate', handleGroupRotate);
        return () => window.removeEventListener('mood-group-rotate', handleGroupRotate);
    }, [isSelected, block.isLocked, block.rotation, mvR]);
    
    // -------------------------------------------------------------

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

    const renderHandle = (handle: ResizeHandle) => {
        if (isMultiSelect) return null;
        const isCorner = ['br', 'bl', 'tr', 'tl'].includes(handle)
        const handleSize = isCorner ? 'w-3 h-3' : (handle === 'top' || handle === 'bottom' ? 'w-8 h-1.5' : 'w-1.5 h-8')
        const positionClasses: Record<ResizeHandle, string> = {
            br: '-bottom-1.5 -right-1.5', bl: '-bottom-1.5 -left-1.5', tr: '-top-1.5 -right-1.5', tl: '-top-1.5 -left-1.5',
            top: '-top-0.75 left-1/2 -translate-x-1/2', bottom: '-bottom-0.75 left-1/2 -translate-x-1/2',
            left: 'top-1/2 -left-0.75 -translate-y-1/2', right: 'top-1/2 -right-0.75 -translate-y-1/2',
        }
        return (
            <motion.div
                key={handle}
                initial={false}
                onPanStart={handleResizeStart}
                onPan={(e, i) => handleResizePan(handle, e, i)}
                onPanEnd={handleResizeEnd}
                className={cn(
                    "absolute z-[1002] pointer-events-auto bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-white shadow-md hover:scale-[1.3] active:scale-95 transition-transform",
                    positionClasses[handle], handleSize, isCorner ? "rounded-full" : "rounded-full"
                )}
                style={{ cursor: getResizeCursor(handle), touchAction: 'none' }}
            />
        )
    }

    return (
        <motion.div
            ref={itemRef}
            variants={{
                hidden: {
                    opacity: 0,
                    scale: 0.96,
                    filter: 'blur(10px)',
                    y: 10
                },
                visible: {
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                    y: 0,
                    transition: {
                        type: 'spring',
                        damping: 20,
                        stiffness: 150,
                        opacity: { duration: 0.2 },
                        filter: { duration: 0.3 }
                    }
                },
                exit: {
                    opacity: 0,
                    scale: 0.92,
                    filter: 'blur(8px)',
                    transition: { duration: 0.2 }
                }
            }}
            onPanStart={handleDragStart}
            onPan={handleDragPan}
            onPanEnd={handleDragEnd}
            exit="exit"
            style={{
                willChange: 'transform, opacity, filter',
                left: styleLeft, top: styleTop, width: mvW, height: mvH, rotate: mvR,
                zIndex: isDragging || isSelected ? 999 : (block.zIndex || 10),
                boxShadow: (isSelected && !isMultiSelect) ? `0 0 0 2px ${themeConfig?.bg || '#000'}, 0 0 0 4px ${profile?.primaryColor || '#3b82f6'}` : 'none',
                touchAction: 'none', transformOrigin: 'center',
                display: block.isHidden ? 'none' : 'block',
                opacity: block.isHidden ? 0 : ((block.content as any).opacity ?? 1),
                pointerEvents: (block.isHidden || (block.isLocked && !isSelected)) ? 'none' : 'auto',
                mixBlendMode: (block.content as any).blendMode || 'normal',
                cursor: block.isLocked ? 'not-allowed' : (isSelected ? 'default' : 'grab')
            }}
            onClick={(e) => {
                if (isInteractiveMode || block.isLocked) return;
                e.stopPropagation();
                onSelect(e.shiftKey);
            }}
            onDoubleClick={(e) => {
                if (isInteractiveMode || block.isLocked) return;
                e.stopPropagation();
                onSelect(false);
            }}
            whileHover={{ zIndex: 998 }}
            className={cn(
                "absolute group will-change-transform",
                !isInteractiveMode && "select-none touch-none",
                block.isLocked ? "opacity-90" : (isSelected ? "cursor-default" : "cursor-grab active:cursor-grabbing")
            )}
            onMouseEnter={() => {
                if (isInteractiveMode) return;
                const siblings = block.groupId 
                    ? blocks.filter(b => b.groupId === block.groupId).map(b => b.id)
                    : [block.id];
                
                // Only update if the selection actually changed to prevent infinite loops
                const isSame = hoveredBlockIds.length === siblings.length && 
                              siblings.every(id => hoveredBlockIds.includes(id));
                
                if (!isSame) {
                    setHoveredBlockIds(siblings);
                }
            }}
            onMouseLeave={() => {
                if (hoveredBlockIds.length > 0) {
                    setHoveredBlockIds([]);
                }
            }}
            onContextMenu={(e) => onContextMenu(e, block.id)}
            data-block-id={block.id}
        >
            {/* Selection UI */}
            {isSelected && !isMultiSelect && (
                <>
                    <div className={cn(
                        "absolute -inset-[3px] pointer-events-none z-[1001] transition-all rounded-2xl",
                        isInteractiveMode ? "border-[3px] border-white shadow-none mix-blend-difference" : "border-2 border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
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
                                    "absolute left-1/2 flex items-center gap-1 px-1.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 z-[1001] pointer-events-auto shadow-2xl rounded-2xl",
                                    block.y < 15 ? "top-full mt-4" : "-top-[60px]"
                                )}
                            >
                                <button
                                    onClick={() => onSelect(false)}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors group/edit"
                                    title={t('common.edit')}
                                    aria-label={t('common.edit')}
                                >
                                    <Pencil className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover/edit:text-zinc-900 dark:group-hover/edit:text-white" />
                                </button>
                                <div className="w-[1px] h-4 bg-zinc-100 dark:bg-zinc-800 mx-1" />

                                {block.isLocked ? (
                                    <>
                                        <div className="p-2 text-amber-500" title={t('canvas.layer_unlock')} aria-label={t('canvas.layer_unlock')}>
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <div className="w-[1px] h-4 bg-zinc-100 dark:bg-zinc-800 mx-1" />
                                    </>
                                ) : (
                                    <>
                                        <div
                                            className={cn(
                                                "p-2 cursor-move rounded-xl transition-colors group/move",
                                                isDragging ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            )}
                                            title={t('common.move')}
                                            aria-label={t('common.move')}
                                        >
                                            <Move className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-active/move:text-current" />
                                        </div>
                                        <div className="w-[1px] h-4 bg-zinc-100 dark:bg-zinc-800 mx-1" />
                                    </>
                                )}

                                {isInteractiveBlock && (
                                    <>
                                        <button
                                            onClick={toggleInteraction}
                                            className={cn("p-2 rounded-xl transition-all", isInteractiveMode ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400")}
                                            title={isInteractiveMode ? t('common.disable_interaction') : t('common.enable_interaction')}
                                            aria-label={isInteractiveMode ? t('common.disable_interaction') : t('common.enable_interaction')}
                                        >
                                            <MousePointer2 className="w-4 h-4" />
                                        </button>
                                        <div className="w-[1px] h-4 bg-zinc-100 dark:bg-zinc-800 mx-1" />
                                    </>
                                )}

                                {/* Integrated Rotation Info/Reset */}
                                <button
                                    onClick={resetRotation}
                                    className={cn(
                                        "px-2 h-9 rounded-xl transition-all flex items-center gap-2 group/rot",
                                        stateRef.current.rotation !== 0 ? "text-blue-500 bg-blue-500/5" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                    )}
                                    title="Clique para resetar ângulo"
                                >
                                    <RotateCw className={cn("w-3.5 h-3.5 transition-transform", stateRef.current.rotation !== 0 && "animate-pulse")} />
                                    {stateRef.current.rotation !== 0 && (
                                        <span className="text-[9px] font-black tabular-nums">{Math.round(stateRef.current.rotation)}°</span>
                                    )}
                                </button>

                                <div className="w-[1px] h-4 bg-zinc-100 dark:bg-zinc-800 mx-1" />

                                {!block.isLocked && (
                                    <button
                                        onClick={() => onDeleteRequest(block.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400 group/del"
                                        title={`${t('common.delete')} (Del)`}
                                        aria-label={`${t('common.delete')} (Del)`}
                                    >
                                        <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                    </button>
                                )}
                            </motion.div>
                    )}

                    {/* Resize Handles */}
                    {!block.isLocked && ['br', 'bl', 'tr', 'tl', 'top', 'bottom', 'left', 'right'].map(h => renderHandle(h as ResizeHandle))}

                    {/* Pro Rotation Handles (Figma Style) */}
                    {!block.isLocked && !isMultiSelect && (
                        <div className="absolute inset-[-20px] pointer-events-none">
                            {['tl', 'tr', 'bl', 'br'].map(corner => (
                                <motion.div
                                    key={`rotate-${corner}`}
                                    onPointerDown={(e) => e.stopPropagation()} // BLOCK DRAG CONFLICT
                                    onPanStart={(e, info) => {
                                        setIsRotating(true)
                                        stateRef.current.isRotating = true
                                        const rect = itemRef.current?.getBoundingClientRect()
                                        if (!rect) return
                                        
                                        // The center of an axis-aligned bounding box of a center-rotated element IS ALWAYS its true center.
                                        // Adding scrollX/Y ensures it matches absolute viewport if page is scrolled.
                                        const cx = rect.left + window.scrollX + rect.width / 2
                                        const cy = rect.top + window.scrollY + rect.height / 2
                                        
                                        stateRef.current.startX = cx
                                        stateRef.current.startY = cy
                                        
                                        const { x: clientX, y: clientY } = getClientPos(e);
                                        
                                        stateRef.current.initialMouseAngle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI)
                                        stateRef.current.initialRotation = block.rotation || 0
                                    }}
                                    onPan={(e, info) => {
                                        const centerX = stateRef.current.startX
                                        const centerY = stateRef.current.startY
                                        
                                        const { x: clientX, y: clientY } = getClientPos(e);
                                        
                                        const currentMouseAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
                                        let deltaAngle = currentMouseAngle - stateRef.current.initialMouseAngle
                                        
                                        // ANGLE NORMALIZATION
                                        if (deltaAngle > 180) deltaAngle -= 360
                                        if (deltaAngle < -180) deltaAngle += 360
                                        
                                        let newRotation = stateRef.current.initialRotation + deltaAngle
                                        
                                        // INSTANT VISUAL FEEDBACK (FREE ROTATION)
                                        mvR.set(newRotation)
                                        stateRef.current.rotation = newRotation
                                    }}
                                    onPanEnd={() => {
                                        setIsRotating(false)
                                        stateRef.current.isRotating = false
                                        // Persist only at the end
                                        onUpdate({ rotation: stateRef.current.rotation })
                                    }}
                                    className={cn(
                                        "absolute w-10 h-10 pointer-events-auto cursor-alias opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center",
                                        corner === 'tl' && "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
                                        corner === 'tr' && "top-0 right-0 translate-x-1/2 -translate-y-1/2",
                                        corner === 'bl' && "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
                                        corner === 'br' && "bottom-0 right-0 translate-x-1/2 translate-y-1/2"
                                    )}
                                >
                                    <div className="w-5 h-5 rounded-full border-2 border-blue-500/30 bg-blue-500/10" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <div className={cn("w-full h-full transition-transform duration-200", isDragging && "scale-[1.02] rotate-1", (isDragging || isResizing) && "pointer-events-none")}>
                <BlockRenderer block={block} isPublic={isInteractiveMode} />
            </div>

            {/* Hover Highlight & Sibling Glow - Designer Edition */}
            {(hoveredBlockIds.includes(block.id) || isSelected) && (
                <div className="absolute -inset-6 pointer-events-none z-[1000]">
                    {/* Atmospheric Glow (Stronger for primary hover, subtle for siblings) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                            opacity: hoveredBlockIds[0] === block.id ? 1 : 0.4, 
                            scale: 1 
                        }}
                        className={cn(
                            "absolute inset-4 blur-2xl rounded-[3rem]",
                            isSelected ? "bg-blue-500/15" : "bg-blue-500/10"
                        )} 
                    />
                    
                    {/* Elegant Corner Brackets - Only for Primary Hover or Selection */}
                    {(hoveredBlockIds[0] === block.id || (isSelected && !isMultiSelect)) && (
                        <div className="absolute inset-0">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500/50 rounded-tl-2xl" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-500/50 rounded-tr-2xl" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-500/50 rounded-bl-2xl" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500/50 rounded-br-2xl" />
                        </div>
                    )}

                    {/* Parent Tag - Minimalist Group Label */}
                    {block.groupId && (hoveredBlockIds[0] === block.id || isSelected) && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-10 left-0 px-2 py-0.5 bg-zinc-900 dark:bg-white rounded-md flex items-center gap-1.5 shadow-xl border border-white/10 dark:border-black/10"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className="text-[8px] font-black text-white dark:text-zinc-900 uppercase tracking-widest whitespace-nowrap">
                                {(block.content as any)?.groupName || `Group // ${block.groupId.split('_')[1]?.substring(0, 4)}`}
                            </span>
                        </motion.div>
                    )}

                    {/* Subtle Inner Border */}
                    {(hoveredBlockIds[0] === block.id || (isSelected && !isMultiSelect)) && (
                        <div className="absolute inset-4 border border-blue-500/20 rounded-[2rem] ring-4 ring-blue-500/5" />
                    )}
                </div>
            )}
        </motion.div>
    )
})

CanvasItem.displayName = "CanvasItem"
