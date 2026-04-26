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
    Hand,
    Activity
} from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { cn } from "@/lib/utils"

export function CommandCenter() {
    const [isOpen, setIsOpen] = useState(false)
    const { t } = useTranslation()

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
            {/* Toggle Button HUD Style */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[100] w-12 h-12 flex items-center justify-center bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl group relative overflow-hidden"
                title="Comandos (Shift + ?)"
            >
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white opacity-20 group-hover:opacity-100 transition-opacity" />
                <Keyboard className="w-5 h-5 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-black dark:bg-white rounded-none border border-zinc-200 dark:border-zinc-800" />
            </button>

            {/* Overlay UI */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[110] bg-black/40 dark:bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] w-full max-w-2xl bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 shadow-[0_30px_100px_rgba(0,0,0,0.3)] rounded-none overflow-hidden group/modal"
                        >
                            {/* HUD Markers */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-black dark:border-white opacity-20" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-black dark:border-white opacity-20" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-black dark:border-white opacity-20" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-black dark:border-white opacity-20" />

                            {/* Header */}
                            <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-3 h-3 text-black dark:text-white opacity-30" />
                                    <div>
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-black dark:text-white">
                                            System.Command_Center
                                        </h2>
                                        <p className="text-[7px] text-zinc-400 font-mono uppercase tracking-widest mt-0.5">
                                            v1.5.0 // Precision_Engine_Active
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </header>

                            {/* Content Grid */}
                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 bg-zinc-100 dark:bg-zinc-900 gap-[1px] max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {shortcutGroups.map((group, idx) => (
                                    <div key={idx} className="bg-white dark:bg-black/80 p-5 space-y-5 relative group/section">
                                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white opacity-10 group-hover/section:opacity-40 transition-opacity" />

                                        <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                                            {group.title}
                                        </h3>
                                        <div className="space-y-4">
                                            {group.items.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between group/item">
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className="w-3 h-3 text-zinc-400 group-hover/item:text-black dark:group-hover/item:text-white transition-colors" />
                                                        <span className="text-[9px] font-black uppercase tracking-tight text-zinc-500 group-hover/item:text-black dark:group-hover/item:text-white transition-colors">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <kbd className="px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-[8px] font-mono text-zinc-400 font-bold">
                                                        {item.key}
                                                    </kbd>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <footer className="p-5 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {[ArrowUp, ArrowDown, ArrowLeft, ArrowRight].map((Icon, i) => (
                                                <div key={i} className="w-4 h-4 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50">
                                                    <Icon className="w-2 h-2 text-zinc-400" />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[7px] text-zinc-400 font-black uppercase tracking-widest ml-1">Nudge.Nodes</span>
                                    </div>
                                    <div className="h-4 w-px bg-zinc-100 dark:border-zinc-900" />
                                    <div className="text-[7px] text-zinc-400 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                        Sync: Verified
                                    </div>
                                </div>
                                <div className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20">
                                    Precision.Engine
                                </div>
                            </footer>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
