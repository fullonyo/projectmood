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
    GripVertical
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiSelectToolbarProps {
    visible: boolean
    onAlign: (type: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => void
    onDistribute: (axis: 'horizontal' | 'vertical') => void
    count: number
}

export function MultiSelectToolbar({ visible, onAlign, onDistribute, count }: MultiSelectToolbarProps) {
    const isDistributionAllowed = count >= 3;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 20, opacity: 0, x: "-50%" }}
                    animate={{ y: 0, opacity: 1, x: "-50%" }}
                    exit={{ y: 20, opacity: 0, x: "-50%" }}
                    className="fixed bottom-24 left-1/2 z-[100] flex items-center gap-1.5 p-1.5 bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full"
                >
                    <div className="flex items-center gap-2 px-3 py-1 border-r border-white/10 mr-1">
                        <GripVertical className="w-3 h-3 text-zinc-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            {count} Selected
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Horizontal Alignment */}
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => onAlign('left')}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                                title="Align Left"
                            >
                                <AlignLeft className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => onAlign('centerX')}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                                title="Align Center X"
                            >
                                <AlignCenterHorizontal className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => onAlign('right')}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                                title="Align Right"
                            >
                                <AlignRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-px h-4 bg-white/5 mx-1" />

                        {/* Vertical Alignment */}
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => onAlign('top')}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                                title="Align Top"
                            >
                                <AlignStartVertical className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => onAlign('centerY')}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                                title="Align Center Y"
                            >
                                <AlignCenterVertical className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => onAlign('bottom')}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                                title="Align Bottom"
                            >
                                <AlignEndVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-px h-4 bg-white/5 mx-1" />

                        {/* Distribution */}
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => isDistributionAllowed && onDistribute('horizontal')}
                                className={cn(
                                    "p-2 rounded-full transition-colors",
                                    isDistributionAllowed
                                        ? "hover:bg-white/10 text-white/50 hover:text-white"
                                        : "opacity-20 cursor-not-allowed text-white/20"
                                )}
                                title={isDistributionAllowed ? "Distribute Horizontally" : "Need at least 3 items to distribute"}
                            >
                                <LayoutPanelLeft className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => isDistributionAllowed && onDistribute('vertical')}
                                className={cn(
                                    "p-2 rounded-full transition-colors",
                                    isDistributionAllowed
                                        ? "hover:bg-white/10 text-white/50 hover:text-white"
                                        : "opacity-20 cursor-not-allowed text-white/20"
                                )}
                                title={isDistributionAllowed ? "Distribute Vertically" : "Need at least 3 items to distribute"}
                            >
                                <LayoutPanelTop className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
