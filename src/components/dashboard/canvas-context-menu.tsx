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
            className="fixed z-[2000] w-48 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-1 animate-in fade-in zoom-in duration-150 rounded-none overflow-hidden"
            style={{ left: x, top: y }}
        >
            {/* Subtle Scanning Detail */}
            <div className="absolute left-0 right-0 h-[1px] bg-white/5 top-0 animate-[studio-scan_4s_linear_infinite] pointer-events-none" />

            {items.map((item, index) => {
                if (item.type === 'divider') {
                    return <div key={`divider-${index}`} className="my-1 border-t border-white/5 mx-2" />
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
                            "w-full flex items-center gap-3 px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] transition-all font-mono",
                            item.disabled
                                ? "opacity-20 cursor-not-allowed text-white"
                                : item.variant === 'danger'
                                    ? "text-red-400 hover:bg-red-500/10 hover:text-red-500"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        {Icon && (
                            <Icon className={cn(
                                "w-3 h-3 transition-transform duration-300 group-hover:scale-110",
                                item.variant === 'danger' ? "text-red-400/60" : "text-white/40"
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
    )
}
