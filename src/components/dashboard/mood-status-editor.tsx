"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Smile, Meh, Frown, Sparkles, Flame, Coffee, PartyPopper, Moon, Heart, Ghost, Check } from "lucide-react"
import { useTranslation } from "@/i18n/context"

const ICONS = [
    { name: 'Smile', icon: Smile },
    { name: 'Meh', icon: Meh },
    { name: 'Frown', icon: Frown },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'Flame', icon: Flame },
    { name: 'Coffee', icon: Coffee },
    { name: 'PartyPopper', icon: PartyPopper },
    { name: 'Moon', icon: Moon },
    { name: 'Heart', icon: Heart },
    { name: 'Ghost', icon: Ghost },
]

import { addMoodBlock } from "@/actions/profile"

interface MoodStatusEditorProps {
    block?: any
    onUpdate?: (id: string, content: any) => void
    onAdd?: (content: any) => Promise<void>
    onClose?: () => void
}

export function MoodStatusEditor({ block, onUpdate, onAdd, onClose }: MoodStatusEditorProps) {
    const { t } = useTranslation()
    const defaultContent = block?.content || {}
    const [selectedIcon, setSelectedIcon] = useState(defaultContent.emoji || "Smile")
    const [text, setText] = useState(defaultContent.text || "")
    const [isPending, setIsPending] = useState(false)

    // 2. Real-time Preview
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const content = {
            emoji: selectedIcon,
            text: text.trim(),
            timestamp: block.content?.timestamp || new Date().toISOString()
        }

        onUpdate(block.id, { content })
    }, [selectedIcon, text, block?.id])

    const handleAdd = async () => {
        if (!text.trim() && !block?.id) return

        setIsPending(true)
        const content = {
            emoji: selectedIcon, // Mantendo o nome da prop como 'emoji' para compatibilidade, mas enviando o nome do ícone
            text: text.trim(),
            timestamp: new Date().toISOString()
        }

        if (block?.id) {
            if (onClose) onClose()
        } else if (onAdd) {
            await onAdd(content)
            setText("")
            setSelectedIcon("Smile")
        }
        setIsPending(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <Smile className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.mood_status.title')}</h3>
            </div>

            <div className="space-y-6 border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950">
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 block text-center">{t('editors.mood_status.registry')}</Label>
                    <div className="grid grid-cols-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        {ICONS.map(({ name, icon: Icon }) => (
                            <button
                                key={name}
                                onClick={() => setSelectedIcon(name)}
                                className={cn(
                                    "aspect-square flex items-center justify-center border-r border-b last:border-r-0 border-zinc-100 dark:border-zinc-900 transition-all",
                                    selectedIcon === name
                                        ? "bg-black text-white dark:bg-white dark:text-black"
                                        : "opacity-40 hover:opacity-100"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">
                            {t('editors.mood_status.status_buffer')}
                        </Label>
                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t('editors.mood_status.placeholder')}
                            maxLength={50}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none h-12 text-[10px] uppercase font-mono tracking-tight focus-visible:ring-0"
                        />
                        <div className="flex justify-between items-center px-1">
                            <div className="flex gap-1 items-center opacity-20">
                                <div className="w-1 h-3 bg-zinc-400" />
                                <div className="w-1 h-3 bg-zinc-400" />
                            </div>
                            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">{text.length} // 50</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleAdd}
                        disabled={isPending || (!text.trim() && !block?.id)}
                        className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-14 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all border border-black dark:border-white shadow-none"
                    >
                        {isPending ? t('common.loading') : (block?.id ? t('common.close') : t('editors.mood_status.deploy'))}
                    </Button>
                </div>
            </div>
        </div>
    )
}
