"use client"

import { useEffect, useState, useRef } from "react"
import {
    Trash2,
    Copy,
    ArrowUp,
    ArrowDown,
    Lock,
    Unlock,
    BringToFront,
    SendToBack,
    Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

import { useTranslation } from "@/i18n/context"
import { MoodBlock } from "@/types/database"

interface ContextMenuProps {
    x: number
    y: number
    block: MoodBlock
    onClose: () => void
    onAction: (action: string) => void
}

export function CanvasContextMenu({ x, y, block, onClose, onAction }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)
    const { t } = useTranslation()

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    const items = [
        { id: 'bring-to-front', label: t('canvas.layer_to_front'), icon: BringToFront, shortcut: ']' },
        { id: 'bring-forward', label: t('canvas.layer_forward'), icon: ArrowUp },
        { id: 'send-backward', label: t('canvas.layer_backward'), icon: ArrowDown },
        { id: 'send-to-back', label: t('canvas.layer_to_back'), icon: SendToBack, shortcut: '[' },
        { id: 'divider', type: 'divider' },
        { id: 'duplicate', label: t('common.duplicate'), icon: Copy, disabled: block.isLocked, shortcut: 'Ctrl+D' },
        { id: 'delete', label: t('common.delete'), icon: Trash2, variant: 'danger', disabled: block.isLocked, shortcut: 'Del' },
    ]


    return (
        <div
            ref={menuRef}
            className="fixed z-[2000] w-48 bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-0 animate-in fade-in zoom-in duration-150 rounded-none overflow-hidden"
            style={{ left: x, top: y }}
        >
            <header className="flex items-center gap-2 opacity-30 px-3 py-2 border-b border-zinc-100 dark:border-zinc-900">
                <Activity className="w-2 h-2 text-black dark:text-white" />
                <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('canvas.layers')}</h3>
            </header>

            <div className="p-1">
                {items.map((item, index) => {
                    if (item.type === 'divider') {
                        return <div key={`divider-${index}`} className="my-1 border-t border-zinc-100 dark:border-zinc-900 mx-1" />
                    }

                    const Icon = item.icon

                    return (
                        <button
                            key={item.id}
                            disabled={item.disabled}
                            onClick={() => {
                                if (item.disabled) return
                                onAction(item.id!)
                                onClose()
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 text-[7.5px] font-black uppercase tracking-[0.4em] transition-all font-mono group relative",
                                item.disabled
                                    ? "opacity-20 cursor-not-allowed"
                                    : item.variant === 'danger'
                                        ? "text-red-500 hover:bg-red-500/5"
                                        : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                            )}
                        >
                            {/* HUD corner mark on hover */}
                            {!item.disabled && (
                                <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}

                            {Icon && (
                                <Icon className={cn(
                                    "w-3 h-3 transition-transform duration-300 group-hover:scale-110",
                                    item.variant === 'danger' ? "text-red-500" : "text-zinc-400 group-hover:text-current"
                                )} />
                            )}
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.shortcut && (
                                <span className="opacity-30 text-[7px] font-mono tracking-tighter">
                                    {item.shortcut}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
