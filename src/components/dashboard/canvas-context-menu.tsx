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
    SendToBack
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
            className="fixed z-[2000] w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl p-1 animate-in fade-in zoom-in duration-150"
            style={{ left: x, top: y }}
        >
            {items.map((item, index) => {
                if (item.type === 'divider') {
                    return <div key={`divider-${index}`} className="my-1 border-t border-zinc-100 dark:border-zinc-900" />
                }

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
                            "w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors",
                            item.disabled
                                ? "opacity-30 cursor-not-allowed text-zinc-400"
                                : item.variant === 'danger'
                                    ? "text-red-500 hover:bg-red-500/10"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        )}
                    >
                        {item.icon && <item.icon className="w-3.5 h-3.5" />}
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.shortcut && (
                            <span className="opacity-40 text-[8px] font-mono tracking-tighter">
                                {item.shortcut}
                            </span>
                        )}
                    </button>
                )
            })}

        </div>
    )
}
