"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { MoodBlock } from "@/types/database"
import { calculateSelectionBounds, getClientPos, dispatchCanvasEvent, CANVAS_EVENTS } from "@/lib/canvas-utils"

interface SelectionAuraProps {
    selectedIds: string[]
    blocks: MoodBlock[]
    onUpdateBlocks: (ids: string[], updates: Partial<MoodBlock> | ((block: MoodBlock) => Partial<MoodBlock>)) => void
    canvasRef: React.RefObject<HTMLDivElement | null>
}

export function SelectionAura({ selectedIds, blocks, onUpdateBlocks, canvasRef }: SelectionAuraProps) {
    const [auraRotation, setAuraRotation] = useState(0)
    const dragPivot = useRef<{ x: number, y: number, angle?: number, initialMouseAngle?: number, initialRotation?: number } | null>(null)

    const selectionBounds = useMemo(() => {
        const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id));
        if (selectedBlocks.length === 0 || !canvasRef.current) return null;
        
        const canvas = canvasRef.current.getBoundingClientRect();
        return calculateSelectionBounds(selectedBlocks, canvas.width, canvas.height);
    }, [selectedIds, blocks, canvasRef]);

    useEffect(() => {
        if (selectedIds.length > 1) {
            const firstBlock = blocks.find(b => selectedIds.includes(b.id))
            if (firstBlock) setAuraRotation(firstBlock.rotation || 0)
        }
    }, [selectedIds, blocks])

    if (!selectionBounds || selectedIds.length <= 1) return null

    const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id))
    const firstGroupId = selectedBlocks[0]?.groupId
    const isSameGroup = firstGroupId && selectedBlocks.every(b => b.groupId === firstGroupId)

    return (
        <motion.div
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
            
            {/* Group Label */}
            {isSameGroup && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 left-0 flex items-center gap-2 px-3 py-1 bg-zinc-950/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl"
                >
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse" />
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
                        {(selectedBlocks[0].content as any)?.groupName || `Group // ${firstGroupId.split('_')[1]?.substring(0, 4)}`}
                    </span>
                </motion.div>
            )}

            {/* Minimalist Corner Markers */}
            <div className="absolute inset-[-10px]">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/30 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/30 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/30 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500/30 rounded-br-lg" />
            </div>

            {/* Rotation Handles */}
            <div className="absolute inset-[-20px] pointer-events-none">
                {['tl', 'tr', 'bl', 'br'].map(corner => (
                    <motion.div
                        key={`rotate-group-${corner}`}
                        onPointerDown={(e) => e.stopPropagation()}
                        onPanStart={(e) => {
                            if (!canvasRef.current) return
                            const canvas = canvasRef.current.getBoundingClientRect()
                            const cx = canvas.left + (selectionBounds.x * canvas.width / 100) + (selectionBounds.w * canvas.width / 200)
                            const cy = canvas.top + (selectionBounds.y * canvas.height / 100) + (selectionBounds.h * canvas.height / 200)
                            const { x: clientX, y: clientY } = getClientPos(e)

                            dragPivot.current = {
                                x: cx,
                                y: cy,
                                initialMouseAngle: Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI),
                                initialRotation: auraRotation
                            }
                        }}
                        onPan={(e) => {
                            if (!dragPivot.current) return
                            const { x: centerX, y: centerY } = dragPivot.current
                            const { x: clientX, y: clientY } = getClientPos(e)
                            const currentMouseAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
                            let deltaAngle = currentMouseAngle - (dragPivot.current.initialMouseAngle || 0)
                            
                            if (deltaAngle > 180) deltaAngle -= 360
                            if (deltaAngle < -180) deltaAngle += 360
                            
                            let angleDeg = (dragPivot.current.initialRotation || 0) + deltaAngle
                            setAuraRotation(angleDeg)
                            
                            if (dragPivot.current.angle !== angleDeg) {
                                dragPivot.current.angle = angleDeg
                                dispatchCanvasEvent(CANVAS_EVENTS.GROUP_ROTATE, { deltaAngle })
                            }
                        }}
                        onPanEnd={() => {
                            if (!dragPivot.current || dragPivot.current.angle === undefined) return
                            const finalDelta = dragPivot.current.angle - (dragPivot.current.initialRotation || 0)
                            onUpdateBlocks(selectedIds, (block) => {
                                if (block.isLocked) return {}
                                return { rotation: (block.rotation || 0) + finalDelta }
                            })
                            dragPivot.current = null
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

            {/* Resize Handles */}
            <div className="absolute inset-[-4px] pointer-events-auto">
                {['tl', 'tr', 'bl', 'br'].map(handle => (
                    <motion.div
                        key={handle}
                        onPan={(e, info) => {
                            const centerX = selectionBounds.x + selectionBounds.w / 2
                            const centerY = selectionBounds.y + selectionBounds.h / 2
                            const canvas = canvasRef.current!.getBoundingClientRect()
                            const currentX = ((info.point.x - canvas.left) / canvas.width) * 100
                            const currentY = ((info.point.y - canvas.top) / canvas.height) * 100
                            const oldDist = Math.sqrt(Math.pow(selectionBounds.w / 2, 2) + Math.pow(selectionBounds.h / 2, 2))
                            if (oldDist < 1) return

                            const newDist = Math.sqrt(Math.pow(currentX - centerX, 2) + Math.pow(currentY - centerY, 2))
                            const scaleFactor = newDist / oldDist
                            if (scaleFactor < 0.1 || scaleFactor > 5) return

                            onUpdateBlocks(selectedIds, (block) => {
                                if (block.isLocked) return {}
                                const relX = block.x - centerX
                                const relY = block.y - centerY
                                return {
                                    x: centerX + (relX * scaleFactor),
                                    y: centerY + (relY * scaleFactor),
                                    width: (block.width || 200) * scaleFactor,
                                    height: (block.height || 200) * scaleFactor
                                }
                            })
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
    )
}
