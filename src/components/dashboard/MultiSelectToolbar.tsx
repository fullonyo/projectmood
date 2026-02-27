"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
    AlignLeft,
    AlignCenterHorizontal,
    AlignRight,
    AlignStartVertical,
    AlignCenterVertical,
    AlignEndVertical,
    LayoutPanelLeft,
    LayoutPanelTop,
    GripVertical,
    Boxes,
    Ungroup
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiSelectToolbarProps {
    visible: boolean
    onAlign: (type: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => void
    onDistribute: (axis: 'horizontal' | 'vertical') => void
    onGroup: () => void
    onUngroup: () => void
    count: number
}

export function MultiSelectToolbar({ visible, onAlign, onDistribute, onGroup, onUngroup, count }: MultiSelectToolbarProps) {
    const isDistributionAllowed = count >= 3;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 20, opacity: 0, x: "-50%" }}
                    animate={{ y: 0, opacity: 1, x: "-50%" }}
                    exit={{ y: 20, opacity: 0, x: "-50%" }}
                    className="fixed bottom-24 left-1/2 z-[100] flex items-center gap-1.5 p-1 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 shadow-3xl rounded-none ring-1 ring-white/5"
                >
                    {/* HUD Corners */}
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/40" />
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/40" />
                    <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/40" />
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/40" />

                    <div className="flex items-center gap-2 px-4 py-2 border-r border-white/10 mr-1 bg-white/5">
                        <GripVertical className="w-3 h-3 text-zinc-500 opacity-50" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
                            {count} <span className="opacity-40">Nodes</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-0.5 px-2">
                        {/* Horizontal Alignment */}
                        <div className="flex items-center gap-0.5">
                            {[
                                { id: 'left', icon: AlignLeft, title: 'Align Left' },
                                { id: 'centerX', icon: AlignCenterHorizontal, title: 'Align Center X' },
                                { id: 'right', icon: AlignRight, title: 'Align Right' }
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    onClick={() => onAlign(btn.id as any)}
                                    className="p-2.5 hover:bg-white/10 transition-all text-white/30 hover:text-white group relative"
                                    title={btn.title}
                                >
                                    <btn.icon className="w-3.5 h-3.5" />
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-2" />

                        {/* Vertical Alignment */}
                        <div className="flex items-center gap-0.5">
                            {[
                                { id: 'top', icon: AlignStartVertical, title: 'Align Top' },
                                { id: 'centerY', icon: AlignCenterVertical, title: 'Align Center Y' },
                                { id: 'bottom', icon: AlignEndVertical, title: 'Align Bottom' }
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    onClick={() => onAlign(btn.id as any)}
                                    className="p-2.5 hover:bg-white/10 transition-all text-white/30 hover:text-white"
                                    title={btn.title}
                                >
                                    <btn.icon className="w-3.5 h-3.5" />
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-2" />

                        {/* Distribution */}
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => isDistributionAllowed && onDistribute('horizontal')}
                                className={cn(
                                    "p-2.5 transition-all",
                                    isDistributionAllowed
                                        ? "hover:bg-white/10 text-white/30 hover:text-white"
                                        : "opacity-20 cursor-not-allowed text-white/10"
                                )}
                                title={isDistributionAllowed ? "Distribute Horizontally" : "Need at least 3 items to distribute"}
                            >
                                <LayoutPanelLeft className="w-3.5 h-3.5" />
                            </button>

                            <button
                                onClick={() => isDistributionAllowed && onDistribute('vertical')}
                                className={cn(
                                    "p-2.5 transition-all",
                                    isDistributionAllowed
                                        ? "hover:bg-white/10 text-white/30 hover:text-white"
                                        : "opacity-20 cursor-not-allowed text-white/10"
                                )}
                                title={isDistributionAllowed ? "Distribute Vertically" : "Need at least 3 items to distribute"}
                            >
                                <LayoutPanelTop className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-2" />

                        {/* Grouping */}
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={onGroup}
                                className="p-2.5 hover:bg-white/10 transition-all text-white/30 hover:text-white"
                                title="Group (Ctrl+G)"
                            >
                                <Boxes className="w-3.5 h-3.5" />
                            </button>

                            <button
                                onClick={onUngroup}
                                className="p-2.5 hover:bg-white/10 transition-all text-white/30 hover:text-white"
                                title="Ungroup (Ctrl+Shift+G)"
                            >
                                <Ungroup className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
