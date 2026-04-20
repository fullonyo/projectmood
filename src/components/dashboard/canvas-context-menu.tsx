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

    if (!block) return null;

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
            className="fixed z-[2000] w-56 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-zinc-100 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-1.5 animate-in fade-in zoom-in-95 duration-150 rounded-2xl overflow-hidden"
            style={{ left: x, top: y }}
        >
            <div className="flex flex-col gap-0.5">
                {items.map((item, index) => {
                    if (item.type === 'divider') {
                        return <div key={`divider-${index}`} className="my-1.5 border-t border-zinc-100 dark:border-zinc-800/50 mx-2" />
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
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all group relative",
                                item.disabled
                                    ? "opacity-20 cursor-not-allowed"
                                    : item.variant === 'danger'
                                        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                            )}
                        >
                            {Icon && (
                                <Icon className={cn(
                                    "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                                    item.variant === 'danger' ? "text-red-500" : "text-zinc-400 group-hover:text-current"
                                )} />
                            )}
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.shortcut && (
                                <span className="opacity-40 text-[9px] font-medium tracking-tight bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
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
