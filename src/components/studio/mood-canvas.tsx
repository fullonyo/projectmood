"use client"
import { motion, useMotionValue, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { themeConfigs } from "@/lib/themes"
import { BoardStage } from "./board-stage"
import { useTranslation } from "@/i18n/context"
import { duplicateMoodBlock, addMoodBlock, addMoodBlocksBulk } from "@/actions/profile"
import { CanvasContextMenu } from "./canvas-context-menu"
import { MultiSelectToolbar } from "./MultiSelectToolbar"
import { CommandCenter } from "./command-center"
import { useCanvasKeyboard } from "@/hooks/use-canvas-keyboard"
import { Guideline, DistanceGuide } from "@/lib/canvas-transforms"
import { CanvasItem } from "./canvas-item"
import { MoodBlock, Room } from "@/types/database"
import { TemplateChooser } from "./template-chooser"
import { SelectionAura } from "./selection-aura"
import { LassoSelector } from "./lasso-selector"
import { getClientPos, dispatchCanvasEvent, CANVAS_EVENTS } from "@/lib/canvas-utils"
import { RoomEnvironment } from "./room-environment"

interface MoodCanvasProps {
    blocks: MoodBlock[]
    profile: Room
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
    maxZ: number
    bringToFront: (id: string) => void
    sendToBack: (id: string) => void
    bringForward: (id: string) => void
    sendBackward: (id: string) => void
    isPreview?: boolean
    onExitPreview?: () => void
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
    onUngroup,
    maxZ,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    isPreview = false,
    onExitPreview
}: MoodCanvasProps) {

    const { t } = useTranslation()
    const canvasRef = useRef<HTMLDivElement>(null)

    const [visualFeedback, setVisualFeedback] = useState<{
        guidelines: Guideline[],
        distances: DistanceGuide[]
    }>({ guidelines: [], distances: [] })
    
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, blockId: string } | null>(null)
    const [zoom, setZoom] = useState(1)
    const lastPinchDist = useRef<number | null>(null)

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
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            mvPanX.set(e.clientX - panOffset.current.x);
            mvPanY.set(e.clientY - panOffset.current.y);
            return;
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
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
            case 'delete': removeBlocks([blockId]); break
            case 'duplicate': duplicateMoodBlock(blockId); break
            case 'front': bringToFront(blockId); break
            case 'back': sendToBack(blockId); break
            case 'forward': bringForward(blockId); break
            case 'backward': sendBackward(blockId); break
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

    useCanvasKeyboard({
        selectedIds,
        setSelectedIds,
        onUpdateBlock: isPreview ? () => {} : onUpdateBlock,
        removeBlocks: isPreview ? () => {} : removeBlocks,
        duplicateMoodBlock: isPreview ? () => {} : duplicateMoodBlock,
        bringToFront: isPreview ? () => {} : bringToFront,
        sendToBack: isPreview ? () => {} : sendToBack,
        blocks,
        undo: isPreview ? () => {} : undo,
        redo: isPreview ? () => {} : redo,
        onGroup: isPreview ? () => {} : onGroup,
        onUngroup: isPreview ? () => {} : onUngroup,
        zoomIn: () => setZoom(prev => Math.min(3, prev + 0.1)),
        zoomOut: () => setZoom(prev => Math.max(0.2, prev - 0.1)),
        resetZoom: () => {
            setZoom(1);
            mvPanX.set(0);
            mvPanY.set(0);
        },
        addMoodBlock: isPreview ? () => {} : addMoodBlock,
        addMoodBlocksBulk: isPreview ? () => {} : addMoodBlocksBulk
    })

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
            onMouseLeave={handleMouseUp}
        >
            {/* Template Chooser */}
            {blocks.length === 0 && <TemplateChooser roomId={profile.id} />}

            {/* Lasso Selection */}
            <LassoSelector 
                canvasRef={canvasRef} 
                isSpacePressed={isSpacePressed} 
                onSelectionChange={(ids, isShift) => {
                    if (isShift) {
                        setSelectedIds(prev => [...new Set([...prev, ...ids])])
                    } else {
                        setSelectedIds(ids)
                    }
                }} 
            />

            {/* Selection Aura */}
            <SelectionAura 
                selectedIds={selectedIds} 
                blocks={blocks} 
                onUpdateBlocks={onUpdateBlocks} 
                canvasRef={canvasRef} 
            />

            {/* Room Environment */}
            <RoomEnvironment
                profile={profile}
                backgroundEffect={backgroundEffect}
                weatherSync={blocks.find(b => b.type === 'weather')?.content?.icon}
            />

            {/* CAMERA CONTEXT */}
            <motion.div
                ref={canvasRef}
                className="w-full h-full p-4 relative z-10"
                style={{ scale: zoom, x: mvPanX, y: mvPanY }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <motion.div
                    key={profile.theme}
                    className="w-full h-full relative"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.05 } }
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
                                        } else if (!selectedIds.includes(block.id)) {
                                            setSelectedIds([block.id])
                                        }
                                    }}
                                    onUpdate={(updates) => !isPreview && onUpdateBlock(block.id, updates)}
                                    profile={profile}
                                    themeConfig={themeConfigs[profile.theme as keyof typeof themeConfigs] || themeConfigs.dark}
                                    onDeleteRequest={(id) => !isPreview && removeBlocks([id])}
                                    blocks={blocks}
                                    setGuidelines={setVisualFeedback}
                                    onContextMenu={(e) => {
                                        if (isPreview) return
                                        e.preventDefault()
                                        setContextMenu({ x: e.clientX, y: e.clientY, blockId: block.id })
                                        setSelectedIds([block.id])
                                    }}
                                    selectedIds={selectedIds}
                                    onMultiMove={handleMultiMove}
                                    isPreview={isPreview}
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
            
            <AnimatePresence>
                {isPreview && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[5000] flex flex-col items-center gap-4"
                    >
                        <div className="px-8 py-4 bg-blue-600/90 dark:bg-blue-500/90 backdrop-blur-xl border border-white/20 shadow-[0_0_50px_rgba(59,130,246,0.3)] flex items-center gap-8 rounded-3xl">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Visualização de Histórico</span>
                                <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Modo Somente Leitura</span>
                            </div>
                            <div className="h-8 w-px bg-white/20" />
                            <button 
                                onClick={onExitPreview}
                                className="px-6 h-10 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-all active:scale-95"
                            >
                                Sair da Visualização
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
