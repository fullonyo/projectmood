import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { deleteMoodBlock } from "@/actions/profile"
import { Trash2, RotateCw, Pencil, Move, MousePointer2, Lock, Eye, EyeOff } from "lucide-react"
import { RoomEnvironment } from "./room-environment";
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { themeConfigs } from "@/lib/themes"
import { BlockRenderer } from "./block-renderer"
import { BoardStage } from "./board-stage"
import { useTranslation } from "@/i18n/context"
import { duplicateMoodBlock } from "@/actions/profile"
import { CanvasContextMenu } from "./canvas-context-menu"
import { MultiSelectToolbar } from "./MultiSelectToolbar"
import { useCanvasKeyboard } from "@/hooks/use-canvas-keyboard"
import {
    calculateRotation,
    Guideline,
    DistanceGuide
} from "@/lib/canvas-transforms"

import { CanvasItem } from "./canvas-item"
import { MoodBlock, Profile } from "@/types/database"
import { TemplateChooser } from "./template-chooser"

interface MoodCanvasProps {
    blocks: MoodBlock[]
    profile: Profile
    backgroundEffect: string
    selectedIds: string[]
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void
    onUpdateBlock: (id: string, updates: Partial<MoodBlock>) => void
    onUpdateBlocks: (ids: string[], updates: Partial<MoodBlock> | ((block: MoodBlock) => Partial<MoodBlock>)) => void
    removeBlocks: (ids: string[]) => void
    undo: () => void
    redo: () => void
    alignSelected: (type: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => void
    distributeSelected: (axis: 'horizontal' | 'vertical') => void
}

export function MoodCanvas({
    blocks,
    profile,
    backgroundEffect,
    selectedIds,
    setSelectedIds,
    onUpdateBlock,
    onUpdateBlocks,
    removeBlocks,
    undo,
    redo,
    alignSelected,
    distributeSelected
}: MoodCanvasProps) {

    const { t } = useTranslation()
    const canvasRef = useRef<HTMLDivElement>(null)

    // Calculate maxZ derived from blocks to avoid cascading renders
    const maxZ = useMemo(() => {
        if (blocks.length === 0) return 20;
        return Math.max(20, ...blocks.map(b => b.zIndex || 0));
    }, [blocks]);

    const [visualFeedback, setVisualFeedback] = useState<{
        guidelines: Guideline[],
        distances: DistanceGuide[]
    }>({ guidelines: [], distances: [] })
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, blockId: string } | null>(null)
    const [zoom, setZoom] = useState(1)
    const lastPinchDist = useRef<number | null>(null)

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
    }

    const handleMenuAction = (action: string, blockId: string) => {
        switch (action) {
            case 'delete':
                removeBlocks([blockId])
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

    const bringToFront = useCallback((id: string) => {
        onUpdateBlock(id, { zIndex: maxZ + 1 })
    }, [maxZ, onUpdateBlock])

    const sendToBack = useCallback((id: string) => {
        const minZ = Math.min(...blocks.map(b => b.zIndex || 10))
        onUpdateBlock(id, { zIndex: Math.max(1, minZ - 1) })
    }, [blocks, onUpdateBlock])

    const bringForward = useCallback((id: string) => {
        const currentBlock = blocks.find(b => b.id === id)
        if (!currentBlock) return
        const currentZ = currentBlock.zIndex || 0
        const above = blocks.filter(b => (b.zIndex || 0) > currentZ).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        if (above.length > 0) {
            onUpdateBlock(id, { zIndex: (above[0].zIndex || 0) + 1 })
        } else {
            bringToFront(id)
        }
    }, [blocks, bringToFront, onUpdateBlock])

    const sendBackward = useCallback((id: string) => {
        const currentBlock = blocks.find(b => b.id === id)
        if (!currentBlock) return
        const currentZ = currentBlock.zIndex || 0
        const below = blocks.filter(b => (b.zIndex || 0) < currentZ).sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
        if (below.length > 0) {
            onUpdateBlock(id, { zIndex: Math.max(1, (below[0].zIndex || 10) - 1) })
        } else {
            sendToBack(id)
        }
    }, [blocks, sendToBack, onUpdateBlock])

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
        removeBlocks,
        duplicateMoodBlock,
        bringToFront,
        sendToBack,
        blocks,
        undo,
        redo
    })

    return (
        <div
            className={cn(
                "w-full h-full relative cursor-crosshair overflow-hidden select-none touch-none",
                profile.theme === 'dark' ? "bg-zinc-950" : "bg-white"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setSelectionRect(null)}
        >
            {/* Template Chooser — Show if canvas is empty */}
            {blocks.length === 0 && <TemplateChooser />}

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

            {/* Room Environment Effects (Background, Textures, Atmosphere) */}
            <RoomEnvironment
                profile={profile}
                backgroundEffect={backgroundEffect}
                weatherSync={blocks.find(b => b.type === 'weather')?.content?.icon}
            />

            {/* 📸 CAMERA CONTEXT (ZOOM & PAN) */}
            <motion.div
                ref={canvasRef}
                className="w-full h-full p-4 relative z-10"
                animate={{ scale: zoom }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <motion.div
                    key={profile.theme} // Garante que a coreografia reinicie apenas na troca de Vibe
                    className="w-full h-full relative"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.03,
                                delayChildren: 0.05
                            }
                        }
                    }}
                >
                    <BoardStage className="mood-canvas-stage">
                        <AnimatePresence mode="popLayout">
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
                                    onDeleteRequest={(id) => removeBlocks([id])}
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
                        </AnimatePresence>

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

                            {visualFeedback.distances.map((d, i) => (
                                <motion.div
                                    key={`d-${i}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute pointer-events-none z-[1999] flex items-center justify-center overflow-visible"
                                    style={{
                                        left: d.type === 'vertical' ? `${d.pos}%` : `${d.start}%`,
                                        top: d.type === 'vertical' ? `${d.start}%` : `${d.pos}%`,
                                        width: d.type === 'vertical' ? 1 : `${d.end - d.start}%`,
                                        height: d.type === 'vertical' ? `${d.end - d.start}%` : 1,
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
                            ))}
                        </AnimatePresence>
                    </BoardStage>
                </motion.div>
            </motion.div>

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

            <MultiSelectToolbar
                visible={selectedIds.length > 1}
                count={selectedIds.length}
                onAlign={alignSelected}
                onDistribute={distributeSelected}
            />
        </div>
    )
}
