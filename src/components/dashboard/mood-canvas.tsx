import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { deleteMoodBlock } from "@/actions/profile"
import { Trash2, RotateCw, Pencil, Move, MousePointer2, Lock, Eye, EyeOff } from "lucide-react"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
/* eslint-disable @typescript-eslint/no-unused-vars */
import { themeConfigs } from "@/lib/themes"
import { BlockRenderer } from "./block-renderer"
import { BackgroundEffect } from "../effects/background-effect"
import { StaticTextures } from "../effects/static-textures"
import { BoardStage } from "./board-stage"
import { useTranslation } from "@/i18n/context"
import { useCanvasManager } from "@/hooks/use-canvas-manager"
import { duplicateMoodBlock } from "@/actions/profile"
import { CanvasContextMenu } from "./canvas-context-menu"
import {
    calculateResize,
    getResizeCursor,
    ResizeHandle,
    ResizeCorner,
    calculateRotation,
    calculateSnap,
    Guideline,
    DistanceGuide
} from '@/lib/canvas-transforms'
import { useViewportScale } from '@/lib/canvas-scale'
import { useCanvasKeyboard } from '@/hooks/use-canvas-keyboard'

import { CanvasItem } from "./canvas-item"
import { StressTestButton } from "./StressTestButton"
import { MoodBlock, Profile, ThemeConfig } from "@/types/database"

interface MoodCanvasProps {
    blocks: MoodBlock[]
    profile: Profile
    backgroundEffect: string
    selectedIds: string[]
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void
    onUpdateBlock: (id: string, updates: Partial<MoodBlock>) => void
    onUpdateBlocks: (ids: string[], updates: Partial<MoodBlock> | ((block: MoodBlock) => Partial<MoodBlock>)) => void
    isSaving: boolean
    blockToDelete: string | null
    setBlockToDelete: (id: string | null) => void
}

export function MoodCanvas({
    blocks,
    profile,
    backgroundEffect,
    selectedIds,
    setSelectedIds,
    onUpdateBlock,
    onUpdateBlocks,
    isSaving,
    blockToDelete,
    setBlockToDelete
}: MoodCanvasProps) {

    const { t } = useTranslation()
    const canvasRef = useRef<HTMLDivElement>(null)
    const [maxZ, setMaxZ] = useState(20)
    const [isDeleting, setIsDeleting] = useState(false)
    const [visualFeedback, setVisualFeedback] = useState<{
        guidelines: Guideline[],
        distances: DistanceGuide[]
    }>({ guidelines: [], distances: [] })
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, blockId: string } | null>(null)
    const [zoom, setZoom] = useState(1)
    const [isPinching, setIsPinching] = useState(false)
    const lastPinchDist = useRef<number | null>(null)

    const viewportScale = useViewportScale() * zoom
    const [selectionRect, setSelectionRect] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only trigger on left click
        if (e.button !== 0 || e.ctrlKey || e.metaKey) return;

        const target = e.target as HTMLElement;
        const isBlock = target.closest('[data-block-id]');
        const isTool = target.closest('button, .action-toolbar, .context-menu');

        // If we click on a block or tool, don't start lasso
        if (isBlock || isTool) return;

        setSelectionRect({
            x1: e.clientX,
            y1: e.clientY,
            x2: e.clientX,
            y2: e.clientY
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!selectionRect) return;
        setSelectionRect(prev => prev ? ({ ...prev, x2: e.clientX, y2: e.clientY }) : null);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!selectionRect) return;

        const rect = {
            left: Math.min(selectionRect.x1, selectionRect.x2),
            top: Math.min(selectionRect.y1, selectionRect.y2),
            right: Math.max(selectionRect.x1, selectionRect.x2),
            bottom: Math.max(selectionRect.y1, selectionRect.y2)
        };

        // Distinguish between a simple click and a drag for lasso
        const isDrag = Math.abs(rect.right - rect.left) > 10 || Math.abs(rect.bottom - rect.top) > 10;

        if (!isDrag) {
            // It's a click: clear selection unless Shift is held
            if (!e.shiftKey) setSelectedIds([]);
            setSelectionRect(null);
            return;
        }

        const newSelectedIds: string[] = e.shiftKey ? [...selectedIds] : [];
        const blockElements = document.querySelectorAll('[data-block-id]');

        blockElements.forEach(el => {
            const blockRect = el.getBoundingClientRect();
            const blockId = el.getAttribute('data-block-id');

            // Intersection detection in viewport coordinates
            if (blockId &&
                blockRect.left < rect.right &&
                blockRect.right > rect.left &&
                blockRect.top < rect.bottom &&
                blockRect.bottom > rect.top
            ) {
                if (!newSelectedIds.includes(blockId)) {
                    newSelectedIds.push(blockId);
                }
            }
        });

        setSelectedIds(newSelectedIds);
        setSelectionRect(null);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            )
            lastPinchDist.current = dist
            setIsPinching(true)
        }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && lastPinchDist.current !== null) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            )
            const delta = dist / lastPinchDist.current
            setZoom(prev => Math.max(0.2, Math.min(3, prev * delta)))
            lastPinchDist.current = dist
        }
    }

    const handleTouchEnd = () => {
        lastPinchDist.current = null
        setIsPinching(false)
    }

    const handleMenuAction = (action: string, blockId: string) => {
        switch (action) {
            case 'delete':
                setBlockToDelete(blockId)
                break
            case 'duplicate':
                duplicateMoodBlock(blockId)
                break
            case 'front':
                bringToFront(blockId)
                break
            case 'back':
                sendToBack(blockId)
                break
            case 'forward':
                bringForward(blockId)
                break
            case 'backward':
                sendBackward(blockId)
                break
            case 'lock':
                const block = blocks.find(b => b.id === blockId)
                if (block) onUpdateBlock(blockId, { isLocked: !block.isLocked })
                break
            case 'hide':
                const hb = blocks.find(b => b.id === blockId)
                if (hb) onUpdateBlock(blockId, { isHidden: !hb.isHidden })
                break
        }
        setContextMenu(null)
    }

    useEffect(() => {
        if (blocks.length > 0) {
            const currentMax = Math.max(...blocks.map(b => b.zIndex || 10))
            setMaxZ(prev => Math.max(prev, currentMax))
        }
    }, [blocks])

    const bringToFront = (id: string) => {
        const newZ = maxZ + 1
        setMaxZ(newZ)
        onUpdateBlock(id, { zIndex: newZ })
    }

    const sendToBack = (id: string) => {
        const minZ = Math.min(...blocks.map(b => b.zIndex || 10))
        const newZ = Math.max(10, minZ - 1)
        onUpdateBlock(id, { zIndex: newZ })
    }

    const bringForward = (id: string) => {
        const currentBlock = blocks.find(b => b.id === id)
        if (!currentBlock) return
        const currentZ = currentBlock.zIndex || 0
        const above = blocks.filter(b => (b.zIndex || 0) > currentZ).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        if (above.length > 0) {
            onUpdateBlock(id, { zIndex: (above[0].zIndex || 0) + 1 })
        } else {
            bringToFront(id)
        }
    }

    const sendBackward = (id: string) => {
        const currentBlock = blocks.find(b => b.id === id)
        if (!currentBlock) return
        const currentZ = currentBlock.zIndex || 0
        const below = blocks.filter(b => (b.zIndex || 0) < currentZ).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        if (below.length > 0) {
            const targetZ = (below[0].zIndex || 10) - 1
            onUpdateBlock(id, { zIndex: Math.max(10, targetZ) })
        } else {
            sendToBack(id)
        }
    }

    const handleMultiMove = useCallback((dx: number, dy: number) => {
        if (selectedIds.length <= 1) return;

        onUpdateBlocks(selectedIds, (block) => {
            if (block.isLocked) return {};
            return {
                x: block.x + dx,
                y: block.y + dy
            };
        });
    }, [selectedIds, onUpdateBlocks]);

    const handleMultiMoveEnd = useCallback(() => {
        // Persistence handled by useCanvasManager
    }, []);

    useCanvasKeyboard({
        selectedIds,
        setSelectedIds,
        onUpdateBlock,
        setBlockToDelete,
        duplicateMoodBlock,
        bringToFront,
        sendToBack,
        blocks
    })

    return (
        <div
            className="w-full h-full relative cursor-crosshair overflow-hidden canvas-background select-none touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setSelectionRect(null)}
        >
            {/* Lasso Selection Rect */}
            {selectionRect && (
                <div
                    style={{
                        position: 'fixed',
                        left: Math.min(selectionRect.x1, selectionRect.x2),
                        top: Math.min(selectionRect.y1, selectionRect.y2),
                        width: Math.abs(selectionRect.x2 - selectionRect.x1),
                        height: Math.abs(selectionRect.y2 - selectionRect.y1),
                        border: '1.5px solid #3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        zIndex: 99999,
                        pointerEvents: 'none',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)'
                    }}
                />
            )}

            <motion.div
                ref={canvasRef}
                className="w-full h-full p-4 relative"
                animate={{ scale: zoom }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="absolute inset-0 z-[-1] pointer-events-none">
                    <BackgroundEffect type={backgroundEffect as any} />
                    <StaticTextures type={profile.staticTexture || 'none'} />
                </div>

                <motion.div className="w-full h-full relative">
                    <BoardStage>
                        {blocks.map((block) => (
                            <CanvasItem
                                key={block.id}
                                block={block}
                                canvasRef={canvasRef}
                                isSelected={selectedIds.includes(block.id)}
                                onSelect={(toggle = false) => {
                                    if (toggle) {
                                        setSelectedIds(prev =>
                                            prev.includes(block.id)
                                                ? prev.filter(id => id !== block.id)
                                                : [...prev, block.id]
                                        )
                                    } else {
                                        // If already selected, don't clear others (to allow dragging group)
                                        if (!selectedIds.includes(block.id)) {
                                            setSelectedIds([block.id])
                                        }
                                    }
                                }}
                                onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                                profile={profile}
                                themeConfig={themeConfigs[profile.theme as keyof typeof themeConfigs] || themeConfigs.dark}
                                onDeleteRequest={(id) => setBlockToDelete(id)}
                                blocks={blocks}
                                setGuidelines={setVisualFeedback}
                                onContextMenu={(e) => {
                                    e.preventDefault()
                                    setContextMenu({ x: e.clientX, y: e.clientY, blockId: block.id })
                                    setSelectedIds([block.id])
                                }}
                                selectedIds={selectedIds}
                                onMultiMove={handleMultiMove}
                                onMultiMoveEnd={handleMultiMoveEnd}
                            />
                        ))}

                        <AnimatePresence>
                            {visualFeedback.guidelines.map((g, i) => (
                                <motion.div
                                    key={`g-${i}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={cn(
                                        "fixed pointer-events-none z-[2000] bg-blue-500/50",
                                        g.type === 'vertical' ? "w-px h-[200vh] -translate-y-1/2" : "h-px w-[200vw] -translate-x-1/2"
                                    )}
                                    style={{
                                        left: g.type === 'vertical' ? g.pos : '0',
                                        top: g.type === 'horizontal' ? g.pos : '0',
                                    }}
                                />
                            ))}

                            {visualFeedback.distances.map((d, i) => {
                                const rect = canvasRef.current?.getBoundingClientRect();
                                if (!rect) return null;
                                const w = rect.width;
                                const h = rect.height;

                                const getPx = (p: number, axis: 'x' | 'y') => {
                                    const size = axis === 'x' ? w : h;
                                    const boardPos = (p / 100) * size;
                                    return axis === 'x'
                                        ? rect.left + (w / 2) + zoom * (boardPos - (w / 2))
                                        : rect.top + (h / 2) + zoom * (boardPos - (h / 2));
                                }

                                const centerPx = d.type === 'vertical' ? getPx(d.pos, 'x') : getPx(d.pos, 'y');
                                const startPx = d.type === 'vertical' ? getPx(d.start, 'y') : getPx(d.start, 'x');
                                const endPx = d.type === 'vertical' ? getPx(d.end, 'y') : getPx(d.end, 'x');

                                return (
                                    <motion.div
                                        key={`d-${i}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="fixed pointer-events-none z-[1999] flex items-center justify-center overflow-visible"
                                        style={{
                                            left: d.type === 'vertical' ? centerPx - 0.5 : startPx,
                                            top: d.type === 'vertical' ? startPx : centerPx - 0.5,
                                            width: d.type === 'vertical' ? 1 : endPx - startPx,
                                            height: d.type === 'vertical' ? endPx - startPx : 1,
                                            backgroundColor: 'rgba(59, 130, 246, 0.4)'
                                        }}
                                    >
                                        <div className={cn(
                                            "absolute bg-blue-600 text-white text-[8px] px-1 py-0.5 font-black rounded-none shadow-sm whitespace-nowrap",
                                            d.type === 'vertical' ? "left-3" : "-top-5"
                                        )}>
                                            {d.label}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </BoardStage>
                </motion.div>
            </motion.div>

            <StressTestButton onSpawn={(many: any[]) => { many.forEach((b: any) => onUpdateBlock(b.id, b)) }} />

            {contextMenu && (
                <CanvasContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    block={blocks.find(b => b.id === contextMenu.blockId)!}
                    onClose={() => setContextMenu(null)}
                    onAction={(action) => handleMenuAction(action, contextMenu.blockId)}
                />
            )}

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
