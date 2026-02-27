"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Gift, Cake, Rocket, Heart, Hourglass, Sparkles, PartyPopper, Check, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

const ICONS = [
    { name: 'Gift', icon: Gift },
    { name: 'Cake', icon: Cake },
    { name: 'Calendar', icon: Calendar },
    { name: 'Rocket', icon: Rocket },
    { name: 'Heart', icon: Heart },
    { name: 'Hourglass', icon: Hourglass },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'PartyPopper', icon: PartyPopper },
]

import { addMoodBlock } from "@/actions/profile"

import { MoodBlock, CountdownContent } from "@/types/database"

interface CountdownEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (content: CountdownContent) => Promise<void>
    onClose?: () => void
}

export function CountdownEditor({ block, onUpdate, onAdd, onClose }: CountdownEditorProps) {
    const { t } = useTranslation()
    const defaultContent = block?.content || {}
    const [label, setLabel] = useState(defaultContent.label || "")
    const [targetDate, setTargetDate] = useState(defaultContent.targetDate || "")
    const [selectedIcon, setSelectedIcon] = useState(defaultContent.icon || "PartyPopper")
    const [style, setStyle] = useState<'minimal' | 'bold' | 'neon'>(defaultContent.style || 'minimal')
    const [isPending, setIsPending] = useState(false)

    // 2. Real-time Preview
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const content: CountdownContent = {
            label: label.trim(),
            targetDate,
            icon: selectedIcon,
            style
        }

        onUpdate(block.id, { content })
    }, [label, targetDate, selectedIcon, style, block?.id])

    const handleAdd = async () => {
        if ((!label.trim() || !targetDate) && !block?.id) return

        setIsPending(true)
        const content: CountdownContent = {
            label: label.trim(),
            targetDate,
            icon: selectedIcon,
            style
        }

        if (block?.id) {
            if (onClose) onClose()
        } else if (onAdd) {
            await onAdd(content)
            setLabel("")
            setTargetDate("")
            setSelectedIcon("PartyPopper")
            setStyle('minimal')
        }
        setIsPending(false)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* Header */}
            <header className="flex items-center gap-2 opacity-30 px-1">
                <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
                <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('editors.countdown.title')}</h3>
            </header>

            <div className="space-y-6 border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950">
                <div className="p-5 space-y-4">
                    <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.countdown.label')}</Label>
                        <Input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder={t('editors.countdown.placeholder')}
                            maxLength={50}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none h-12 text-[10px] uppercase font-mono tracking-tight focus-visible:ring-0"
                        />
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">{label.length} // 50</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.countdown.target')}</Label>
                        <Input
                            type="datetime-local"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none h-12 text-[10px] font-mono tracking-tight focus-visible:ring-0 uppercase"
                        />
                    </div>
                </div>

                <div className="p-5 border-y border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 mb-4 block text-center italic">{t('editors.countdown.registry')}</Label>
                    <div className="grid grid-cols-4 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800">
                        {ICONS.map(({ name, icon: Icon }) => (
                            <button
                                key={name}
                                onClick={() => setSelectedIcon(name)}
                                className={cn(
                                    "aspect-square flex items-center justify-center transition-all relative group",
                                    selectedIcon === name
                                        ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                )}
                            >
                                {selectedIcon === name && (
                                    <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                                )}
                                <Icon className={cn("w-4 h-4 transition-transform", selectedIcon === name && "scale-110")} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5 space-y-6">
                    <div className="space-y-4">
                        <Label className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 text-center block italic">{t('editors.countdown.substrate')}</Label>
                        <div className="grid grid-cols-3 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800">
                            {[
                                { id: 'minimal', label: 'Minimal' },
                                { id: 'bold', label: 'Bold' },
                                { id: 'neon', label: 'Neon' },
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStyle(s.id as any)}
                                    className={cn(
                                        "h-12 text-[8px] font-black uppercase tracking-widest transition-all relative group",
                                        style === s.id
                                            ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    )}
                                >
                                    {style === s.id && (
                                        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                                    )}
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleAdd}
                        disabled={isPending || ((!label.trim() || !targetDate) && !block?.id)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white rounded-none h-14 font-black uppercase tracking-[0.4em] text-[7.5px] border border-zinc-100 dark:border-zinc-800 transition-all relative group overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        {isPending ? t('common.loading') : (block?.id ? t('common.close') : t('editors.countdown.deploy'))}
                    </Button>
                </div>
            </div>
        </div>
    )
}
