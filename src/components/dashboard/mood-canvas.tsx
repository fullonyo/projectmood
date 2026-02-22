import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { deleteMoodBlock } from "@/actions/profile"
import { Trash2, RotateCw, Pencil, Move, MousePointer2, Lock, Eye, EyeOff } from "lucide-react"
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
import { StressTestButton } from "./stress-test-button"
import { MoodBlock, Profile, ThemeConfig } from "@/types/database"

interface MoodCanvasProps {
    blocks: MoodBlock[]
    profile: Profile
    backgroundEffect: string
    selectedId: string | null
    setSelectedId: (id: string | null) => void
    onUpdateBlock: (id: string, updates: Partial<MoodBlock>) => void
    isSaving: boolean
    blockToDelete: string | null
    setBlockToDelete: (id: string | null) => void
}


export function MoodCanvas({
    blocks,
    profile,
    backgroundEffect,
    selectedId,
    setSelectedId,
    onUpdateBlock,
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

    const theme = profile.theme || 'light'
    const config = themeConfigs[theme] || themeConfigs.light
    const bgColor = config.bg
    const primaryColor = config.primary
    const gridOpacity = config.gridOpacity

    useEffect(() => {
        if (blocks.length > 1) { // Adjusted for stress test or multiple blocks
            const currentMax = Math.max(...blocks.map(b => b.zIndex || 1))
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

        // Find all blocks above the current one, sorted by zIndex
        const above = blocks
            .filter(b => (b.zIndex || 0) > currentZ)
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

        if (above.length > 0) {
            // Set zIndex to be higher than the immediate next block
            onUpdateBlock(id, { zIndex: (above[0].zIndex || 0) + 1 })
        } else {
            // Already at top, but ensure maxZ is synced
            bringToFront(id)
        }
    }

    const sendBackward = (id: string) => {
        const currentBlock = blocks.find(b => b.id === id)
        if (!currentBlock) return
        const currentZ = currentBlock.zIndex || 0

        // Find all blocks below the current one, sorted by zIndex desc
        const below = blocks
            .filter(b => (b.zIndex || 0) < currentZ)
            .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))

        if (below.length > 0) {
            // Set zIndex to be lower than the immediate previous block
            const targetZ = (below[0].zIndex || 10) - 1
            onUpdateBlock(id, { zIndex: Math.max(10, targetZ) })
        } else {
            // Already at bottom
            sendToBack(id)
        }
    }


    const handleDuplicate = async (id: string) => {
        const result = await duplicateMoodBlock(id)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Bloco duplicado")
        }
    }

    const handleContextMenu = (e: React.MouseEvent, blockId: string) => {
        // Only trigger on right click
        if (e.button !== 2) return
        e.preventDefault()
        e.stopPropagation()
        setContextMenu({ x: e.clientX, y: e.clientY, blockId })
        setSelectedId(blockId)
    }

    const handleMenuAction = (actionId: string) => {
        if (!contextMenu) return
        const id = contextMenu.blockId

        switch (actionId) {
            case 'bring-to-front': bringToFront(id); break;
            case 'send-to-back': sendToBack(id); break;
            case 'bring-forward': bringForward(id); break;
            case 'send-backward': sendBackward(id); break;
            case 'duplicate': handleDuplicate(id); break;
            case 'delete': setBlockToDelete(id); break;
        }
        setContextMenu(null)
    }


    // ⌨️ Keyboard Mastery
    useCanvasKeyboard({
        selectedId,
        setSelectedId,
        onUpdateBlock,
        onDeleteRequest: (id) => setBlockToDelete(id),
        onDuplicate: handleDuplicate,
        blocks
    })

    const handleCanvasClick = (e: React.MouseEvent) => {
        // If clicking on the canvas directly (not a block bubbling up)
        if (e.target === e.currentTarget) {
            setSelectedId(null)
            setContextMenu(null)
        }
    }


    return (
        <div
            onClick={handleCanvasClick}
            onContextMenu={handleCanvasClick} // Close context menu if canvas is right-clicked
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
                "absolute top-20 right-8 z-[1500] flex items-center gap-2 px-3 py-1.5 rounded-none bg-white dark:bg-zinc-950/80 backdrop-blur-md border border-black dark:border-white transition-all duration-300 pointer-events-none shadow-none",
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

            {/* Guidelines Layer */}
            <div
                ref={canvasRef}
                className="relative w-full h-full cursor-crosshair overflow-hidden touch-none"
                onClick={handleCanvasClick}
                onContextMenu={(e) => e.preventDefault()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <motion.div
                    className="w-full h-full"
                    style={{
                        scale: zoom,
                        transformOrigin: 'center center'
                    }}
                >
                    <BoardStage>


                        {blocks.map((block) => (
                            <CanvasItem
                                key={block.id}
                                block={block}
                                canvasRef={canvasRef}
                                isSelected={selectedId === block.id}
                                onSelect={(editing = false) => {
                                    if (isPinching) return
                                    setSelectedId(block.id)
                                }}
                                onUpdate={(updates) => onUpdateBlock(block.id, updates)}

                                profile={profile}
                                themeConfig={config}
                                onDeleteRequest={setBlockToDelete}
                                blocks={blocks}
                                setGuidelines={(feedback: any) => setVisualFeedback(feedback)}
                                onContextMenu={handleContextMenu}
                            />
                        ))}

                        {/* Visual Guidelines for Snapping */}
                        <AnimatePresence>
                            {/* alignment guidelines */}
                            {visualFeedback.guidelines.map((g, i) => {
                                const canvas = canvasRef.current;
                                if (!canvas) return null;
                                const rect = canvas.getBoundingClientRect();
                                const w = canvas.clientWidth;
                                const h = canvas.clientHeight;

                                let pxPos = 0;
                                if (g.type === 'vertical') {
                                    const boardX = (g.pos / 100) * w;
                                    pxPos = rect.left + (w / 2) + zoom * (boardX - (w / 2));
                                } else {
                                    const boardY = (g.pos / 100) * h;
                                    pxPos = rect.top + (h / 2) + zoom * (boardY - (h / 2));
                                }

                                return (
                                    <motion.div
                                        key={`g-${i}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={cn(
                                            "fixed pointer-events-none z-[2000]",
                                            g.type === 'vertical' ? "w-[1px] h-screen bg-blue-500/50" : "h-[1px] w-screen bg-blue-500/50"
                                        )}
                                        style={{
                                            left: g.type === 'vertical' ? `${pxPos}px` : 0,
                                            top: g.type === 'horizontal' ? `${pxPos}px` : 0,
                                        }}
                                    />
                                );
                            })}
                        </AnimatePresence>

                        <AnimatePresence>
                            {/* distance guides */}
                            {visualFeedback.distances.map((d, i) => {
                                const canvas = canvasRef.current;
                                if (!canvas) return null;
                                const rect = canvas.getBoundingClientRect();
                                const w = canvas.clientWidth;
                                const h = canvas.clientHeight;

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
                                        <div className={cn("absolute bg-blue-600", d.type === 'vertical' ? "top-0 left-[-2px] w-1.5 h-[1px]" : "left-0 top-[-2px] h-1.5 w-[1px]")} />
                                        <div className={cn("absolute bg-blue-600", d.type === 'vertical' ? "bottom-0 left-[-2px] w-1.5 h-[1px]" : "right-0 top-[-2px] h-1.5 w-[1px]")} />
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </BoardStage>
                </motion.div>
            </div>

            {/* Hidden Stress Test Trigger (Ctrl+Shift+S) */}
            <StressTestButton onSpawn={(many: any[]) => {
                // In stress test, we just want to see the UI performance.
                // Doing 50 individual saves is not what we want to test here.
                // We just update the local state.
                // Note: these won't be persisted unless moved.
                const updatedBlocks = [...blocks, ...many];
                // Since we don't have setBlocks here (only onUpdateBlock), 
                // we'll just use onUpdateBlock for now or skip saving.
                // For a true stress test of the VIEW, just local state is enough.
                // But since MoodCanvas is just a renderer of blocks, we need a way 
                // to inject them without prop drilling setBlocks.
                // For now, let's just use the established pattern but warn.
                many.forEach((b: any) => onUpdateBlock(b.id, b))
            }} />


            {/* Context Menu */}
            {contextMenu && (
                <CanvasContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    block={blocks.find(b => b.id === contextMenu.blockId)!}
                    onClose={() => setContextMenu(null)}
                    onAction={handleMenuAction}
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

