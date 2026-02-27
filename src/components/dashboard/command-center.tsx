"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Keyboard,
    X,
    MousePointer2,
    Move,
    Trash2,
    Copy,
    Boxes,
    Ungroup,
    Undo2,
    Redo2,
    Layers,
    Command,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Search,
    Maximize,
    MinusSquare,
    PlusSquare,
    Hand
} from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { cn } from "@/lib/utils"

export function CommandCenter() {
    const [isOpen, setIsOpen] = useState(false)
    const { t } = useTranslation()

    // Shortcut to open with "?"
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                setIsOpen(prev => !prev)
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
            }
        }
        const handleOpenEvent = () => setIsOpen(true)
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('open-command-center', handleOpenEvent)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('open-command-center', handleOpenEvent)
        }
    }, [isOpen])

    const shortcutGroups = [
        {
            title: t('hotkeys.sections.basics'),
            items: [
                { key: "Esc", label: t('hotkeys.keys.escape'), icon: MousePointer2 },
                { key: "Del", label: t('hotkeys.keys.delete'), icon: Trash2 },
                { key: "Ctrl + D", label: t('hotkeys.keys.duplicate'), icon: Copy },
                { key: "Ctrl + C", label: t('hotkeys.keys.copy'), icon: Copy },
                { key: "Ctrl + V", label: t('hotkeys.keys.paste'), icon: Copy },
                { key: "Ctrl + Z", label: t('hotkeys.keys.undo'), icon: Undo2 },
                { key: "Ctrl + Y", label: t('hotkeys.keys.redo'), icon: Redo2 },
            ]
        },
        {
            title: t('hotkeys.sections.organize'),
            items: [
                { key: "Ctrl + G", label: t('hotkeys.keys.group'), icon: Boxes },
                { key: "Ctrl+Shift+G", label: t('hotkeys.keys.ungroup'), icon: Ungroup },
                { key: "Space + Drag", label: t('hotkeys.keys.pan'), icon: Hand },
                { key: "Ctrl + +/-", label: t('hotkeys.keys.zoom'), icon: Search },
            ]
        },
        {
            title: t('hotkeys.sections.layers'),
            items: [
                { key: "[", label: t('canvas.layer_to_back'), icon: Layers },
                { key: "]", label: t('canvas.layer_to_front'), icon: Layers },
                { key: "Shift + Click", label: t('common.select'), icon: MousePointer2 },
                { key: "Shift + Drag", label: t('hotkeys.keys.snapping'), icon: MousePointer2 },
                { key: "Alt + Drag", label: t('hotkeys.keys.duplicate'), icon: Copy },
            ]
        }
    ]

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[100] w-12 h-12 flex items-center justify-center bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl group"
                title="Comandos (Shift + ?)"
            >
                <Keyboard className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-zinc-400 rounded-full animate-pulse border-2 border-zinc-950" />
            </motion.button>

            {/* Overlay UI */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] w-[90%] max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl shadow-3xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-br from-white/[0.03] to-transparent">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
                                        <Command className="w-6 h-6 text-zinc-500" />
                                        {t('hotkeys.title')}
                                    </h2>
                                    <p className="text-xs text-zinc-500 font-medium tracking-wide mt-1">
                                        {t('hotkeys.subtitle')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {shortcutGroups.map((group, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">
                                            {group.title}
                                        </h3>
                                        <div className="space-y-3">
                                            {group.items.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between group/item">
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className="w-4 h-4 text-zinc-600 group-hover/item:text-zinc-400 transition-colors" />
                                                        <span className="text-xs text-zinc-400 group-hover/item:text-zinc-200 transition-colors">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <kbd className="px-2 py-1 bg-zinc-900 border border-white/5 rounded-md text-[9px] font-bold text-zinc-500 font-mono">
                                                        {item.key}
                                                    </kbd>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer hint */}
                            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center"><ArrowUp className="w-2 h-2" /></div>
                                        <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center"><ArrowDown className="w-2 h-2" /></div>
                                        <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center"><ArrowLeft className="w-2 h-2" /></div>
                                        <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center"><ArrowRight className="w-2 h-2" /></div>
                                    </div>
                                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest leading-none">Nudge</span>
                                </div>
                                <div className="text-[9px] text-zinc-600 uppercase tracking-widest">
                                    MoodSpace Version 1.4 // Precision Engine
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
