import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { deleteMoodBlock } from "@/actions/profile"
import { Trash2, RotateCw, Pencil, Move, MousePointer2, Lock, Eye, EyeOff } from "lucide-react"
import { RoomEnvironment } from "./room-environment";
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { themeConfigs } from "@/lib/themes"
import { BlockEditorRegistry } from './block-editor-registry'

// Helper to extract absolute viewport coordinates reliably across mouse/touch
const getClientPos = (e: MouseEvent | TouchEvent | PointerEvent | any) => {
    const isTouch = 'touches' in e && e.touches.length > 0;
    return {
        x: isTouch ? e.touches[0].clientX : e.clientX,
        y: isTouch ? e.touches[0].clientY : e.clientY
    };
};

import { BlockRenderer } from "./block-renderer"
import { BoardStage } from "./board-stage"
import { useTranslation } from "@/i18n/context"
import { duplicateMoodBlock, addMoodBlock, addMoodBlocksBulk } from "@/actions/profile"
import { CanvasContextMenu } from "./canvas-context-menu"
import { MultiSelectToolbar } from "./MultiSelectToolbar"
import { CommandCenter } from "./command-center"
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
    onGroup: () => void
    onUngroup: () => void
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
    distributeSelected,
    onGroup,
    onUngroup
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
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const panOffset = useRef({ x: 0, y: 0 });
    const mvPanX = useMotionValue(0);
    const mvPanY = useMotionValue(0);

    // Pan & Space detection
    useEffect(() => {
        const hKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                setIsSpacePressed(true);
            }
        };
        const hKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
                setIsPanning(false);
            }
        };
        window.addEventListener('keydown', hKeyDown);
        window.addEventListener('keyup', hKeyUp);
        return () => {
            window.removeEventListener('keydown', hKeyDown);
            window.removeEventListener('keyup', hKeyUp);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isSpacePressed) {
            setIsPanning(true);
            panOffset.current = { x: e.clientX - mvPanX.get(), y: e.clientY - mvPanY.get() };
            return;
        }
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
        if (isPanning) {
            mvPanX.set(e.clientX - panOffset.current.x);
            mvPanY.set(e.clientY - panOffset.current.y);
            return;
        }
        if (!selectionRect) return;
        setSelectionRect(prev => prev ? ({ ...prev, x2: e.clientX, y2: e.clientY }) : null);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        setIsPanning(false);
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
                x: Math.max(0, Math.min(100, block.x + dx)),
                y: Math.max(0, Math.min(100, block.y + dy))
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
        redo,
        onGroup,
        onUngroup,
        zoomIn: () => setZoom(prev => Math.min(3, prev + 0.1)),
        zoomOut: () => setZoom(prev => Math.max(0.2, prev - 0.1)),
            resetZoom: () => {
                setZoom(1);
                mvPanX.set(0);
                mvPanY.set(0);
            },
            addMoodBlock,
            addMoodBlocksBulk
        })

    const [auraRotation, setAuraRotation] = useState(0);

    // Selection Bounds Calculation for Unified Aura
    const selectionBounds = useMemo(() => {
        if (selectedIds.length <= 1) return null;
        const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id));
        if (selectedBlocks.length === 0) return null;

        let minX = 100, minY = 100, maxX = 0, maxY = 0;
        selectedBlocks.forEach(b => {
            const w = (b.width || 200) / 20; 
            const h = (b.height || 200) / 20;
            minX = Math.min(minX, b.x);
            minY = Math.min(minY, b.y);
            maxX = Math.max(maxX, b.x + (typeof b.width === 'number' ? 15 : 20)); 
            maxY = Math.max(maxY, b.y + (typeof b.height === 'number' ? 15 : 20));
        });

        // Reset aura rotation when selection changes to a new group
        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }, [selectedIds, blocks]);

    useEffect(() => {
        if (selectedIds.length > 1) {
            const firstBlock = blocks.find(b => selectedIds.includes(b.id));
            if (firstBlock) setAuraRotation(firstBlock.rotation || 0);
        }
    }, [selectedIds]);

    const dragPivot = useRef<{ x: number, y: number, angle?: number, initialMouseAngle?: number, initialRotation?: number } | null>(null);
    const selectionAuraRef = useRef<HTMLDivElement>(null);
    
    return (
        <div
            className={cn(
                "w-full h-full relative overflow-hidden select-none touch-none mood-canvas",
                isSpacePressed ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair",
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
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        zIndex: 99999,
                        pointerEvents: 'none',
                        borderRadius: '2px'
                    }}
                />
            )}

            {/* UNIFIED MULTI-SELECTION AURA (MINIMALIST) */}
            <AnimatePresence>
                {selectionBounds && (
                    <motion.div
                        ref={selectionAuraRef}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="absolute pointer-events-none z-[5]"
                        style={{
                            left: `${selectionBounds.x}%`,
                            top: `${selectionBounds.y}%`,
                            width: `${selectionBounds.w}%`,
                            height: `${selectionBounds.h}%`,
                            rotate: auraRotation,
                            transition: 'none'
                        }}
                    >
                        {/* Atmospheric Glow */}
                        <div className="absolute -inset-12 bg-blue-500/5 blur-[80px] rounded-full" />
                        
                        {/* Group Label (Unified) */}
                        {(() => {
                            const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id));
                            const firstGroupId = selectedBlocks[0]?.groupId;
                            const isSameGroup = firstGroupId && selectedBlocks.every(b => b.groupId === firstGroupId);
                            
                            if (isSameGroup) {
                                const groupName = (selectedBlocks[0].content as any)?.groupName || `Group // ${firstGroupId.split('_')[1]?.substring(0, 4)}`;
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -top-12 left-0 flex items-center gap-2 px-3 py-1 bg-zinc-950/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse" />
                                        <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
                                            {groupName}
                                        </span>
                                    </motion.div>
                                );
                            }
                            return null;
                        })()}

                        {/* Minimalist Corner Markers (Brackets) */}
                        <div className="absolute inset-[-10px]">
                            {/* Top Left */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/30 rounded-tl-lg" />
                            {/* Top Right */}
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/30 rounded-tr-lg" />
                            {/* Bottom Left */}
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/30 rounded-bl-lg" />
                            {/* Bottom Right */}
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500/30 rounded-br-lg" />
                        </div>

                        {/* Pro Group Rotation Handles (Figma Style) */}
                        <div className="absolute inset-[-20px] pointer-events-none">
                            {['tl', 'tr', 'bl', 'br'].map(corner => (
                                <motion.div
                                    key={`rotate-group-${corner}`}
                                    onPointerDown={(e) => e.stopPropagation()} // BLOCK CANVAS DRAG CONFLICT
                                    onPanStart={(e, info) => {
                                        if (!selectionBounds || !canvasRef.current) return;
                                        const canvas = canvasRef.current.getBoundingClientRect();

                                        // STABLE GROUP CENTER (Viewport percentage to Viewport pixels)
                                        const cx = canvas.left + (selectionBounds.x * canvas.width / 100) + (selectionBounds.w * canvas.width / 200);
                                        const cy = canvas.top + (selectionBounds.y * canvas.height / 100) + (selectionBounds.h * canvas.height / 200);

                                        const { x: clientX, y: clientY } = getClientPos(e);

                                        dragPivot.current = {
                                            x: cx,
                                            y: cy,
                                            initialMouseAngle: Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI),
                                            initialRotation: auraRotation
                                        };
                                    }}
                                    onPan={(e, info) => {
                                        if (!dragPivot.current) return;
                                        
                                        const centerX = dragPivot.current.x;
                                        const centerY = dragPivot.current.y;
                                        
                                        const { x: clientX, y: clientY } = getClientPos(e);

                                        // Calculate delta using Viewport coordinates
                                        const currentMouseAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
                                        let deltaAngle = currentMouseAngle - (dragPivot.current.initialMouseAngle || 0);
                                        
                                        // ANGLE NORMALIZATION
                                        if (deltaAngle > 180) deltaAngle -= 360;
                                        if (deltaAngle < -180) deltaAngle += 360;
                                        
                                        let angleDeg = (dragPivot.current.initialRotation || 0) + deltaAngle;
                                        
                                        // Instant visual feedback for the aura
                                        setAuraRotation(angleDeg);
                                        
                                        // HIGH-PERFORMANCE DISPATCH (NO REACT RENDER, NO TEARING)
                                        if (dragPivot.current.angle !== angleDeg) {
                                            dragPivot.current.angle = angleDeg;
                                            window.dispatchEvent(new CustomEvent('mood-group-rotate', { detail: { deltaAngle } }));
                                        }
                                    }}
                                    onPanEnd={() => {
                                        if (!dragPivot.current || dragPivot.current.angle === undefined) return;
                                        
                                        // Calculate the final delta applied during this drag session
                                        const finalDelta = dragPivot.current.angle - (dragPivot.current.initialRotation || 0);
                                        
                                        // PERSIST TO DATABASE ONLY ON DROP (ZERO TEARING)
                                        onUpdateBlocks(selectedIds, (block) => {
                                            if (block.isLocked) return {};
                                            return { rotation: (block.rotation || 0) + finalDelta };
                                        });
                                        
                                        dragPivot.current = null;
                                    }}
                                    className={cn(
                                        "absolute w-12 h-12 pointer-events-auto cursor-alias opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center",
                                        corner === 'tl' && "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
                                        corner === 'tr' && "top-0 right-0 translate-x-1/2 -translate-y-1/2",
                                        corner === 'bl' && "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
                                        corner === 'br' && "bottom-0 right-0 translate-x-1/2 translate-y-1/2"
                                    )}
                                >
                                    <div className="w-6 h-6 rounded-full border-2 border-blue-500/40 bg-blue-500/10" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Pivot Point Indicator (Center Crosshair) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 flex items-center justify-center opacity-30">
                            <div className="absolute w-[1px] h-full bg-blue-500" />
                            <div className="absolute h-[1px] w-full bg-blue-500" />
                        </div>

                        {/* Corner Resize Handles */}
                        <div className="absolute inset-[-4px] pointer-events-auto">
                            {['tl', 'tr', 'bl', 'br'].map(handle => (
                                <motion.div
                                    key={handle}
                                    onPan={(e, info) => {
                                        if (selectedIds.length === 0 || !selectionBounds) return;
                                        
                                        const centerX = selectionBounds.x + selectionBounds.w / 2;
                                        const centerY = selectionBounds.y + selectionBounds.h / 2;
                                        
                                        const canvas = canvasRef.current!.getBoundingClientRect();
                                        const currentX = ((info.point.x - canvas.left) / canvas.width) * 100;
                                        const currentY = ((info.point.y - canvas.top) / canvas.height) * 100;
                                        
                                        const oldDist = Math.sqrt(Math.pow(selectionBounds.w / 2, 2) + Math.pow(selectionBounds.h / 2, 2));
                                        if (oldDist < 1) return; // Division by zero safety

                                        const newDist = Math.sqrt(Math.pow(currentX - centerX, 2) + Math.pow(currentY - centerY, 2));
                                        const scaleFactor = newDist / oldDist;

                                        // Safety bounds for scaling
                                        if (scaleFactor < 0.1 || scaleFactor > 5) return;

                                        onUpdateBlocks(selectedIds, (block) => {
                                            if (block.isLocked) return {};
                                            
                                            const relX = block.x - centerX;
                                            const relY = block.y - centerY;
                                            
                                            return {
                                                x: centerX + (relX * scaleFactor),
                                                y: centerY + (relY * scaleFactor),
                                                width: (block.width || 200) * scaleFactor,
                                                height: (block.height || 200) * scaleFactor
                                            };
                                        });
                                    }}
                                    className={cn(
                                        "absolute w-2.5 h-2.5 bg-white dark:bg-zinc-950 border-2 border-blue-500 rounded-full shadow-sm hover:scale-150 transition-transform cursor-nwse-resize",
                                        handle === 'tl' && "top-0 left-0",
                                        handle === 'tr' && "top-0 right-0 cursor-nesw-resize",
                                        handle === 'bl' && "bottom-0 left-0 cursor-nesw-resize",
                                        handle === 'br' && "bottom-0 right-0 cursor-nwse-resize"
                                    )}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                style={{
                    scale: zoom,
                    x: mvPanX,
                    y: mvPanY,
                }}
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
                onGroup={onGroup}
                onUngroup={onUngroup}
            />

            <CommandCenter />
        </div>
    )
}
