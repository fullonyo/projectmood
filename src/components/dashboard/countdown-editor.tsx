"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Gift, Cake, Rocket, Heart, Hourglass, Sparkles, PartyPopper, Check } from "lucide-react"
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

import { addMoodBlock, updateMoodBlockLayout } from "@/actions/profile"

interface CountdownEditorProps {
    block?: any
    onAdd?: (content: any) => Promise<void>
}

export function CountdownEditor({ block, onAdd }: CountdownEditorProps) {
    const { t } = useTranslation()
    const defaultContent = block?.content || {}
    const [title, setTitle] = useState(defaultContent.title || "")
    const [targetDate, setTargetDate] = useState(defaultContent.targetDate || "")
    const [selectedIcon, setSelectedIcon] = useState(defaultContent.emoji || "PartyPopper")
    const [style, setStyle] = useState<'minimal' | 'bold' | 'neon'>(defaultContent.style || 'minimal')
    const [isPending, setIsPending] = useState(false)

    const handleAdd = async () => {
        if (!title.trim() || !targetDate) return

        setIsPending(true)
        const content = {
            title: title.trim(),
            targetDate,
            emoji: selectedIcon, // Mantendo o nome da prop por compatibilidade
            style
        }

        if (block?.id) {
            await updateMoodBlockLayout(block.id, { content })
        } else if (onAdd) {
            await onAdd(content)
            setTitle("")
            setTargetDate("")
            setSelectedIcon("PartyPopper")
            setStyle('minimal')
        }
        setIsPending(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <Calendar className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.countdown.title')}</h3>
            </div>

            <div className="space-y-6 border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950">
                <div className="p-5 space-y-4">
                    <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.countdown.label')}</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('editors.countdown.placeholder')}
                            maxLength={50}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none h-12 text-[10px] uppercase font-mono tracking-tight focus-visible:ring-0"
                        />
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">{title.length} // 50</span>
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

                <div className="p-5 border-y border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 block text-center">{t('editors.countdown.registry')}</Label>
                    <div className="grid grid-cols-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
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

                <div className="p-5 space-y-6">
                    <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 text-center block">{t('editors.countdown.substrate')}</Label>
                        <div className="grid grid-cols-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            {[
                                { id: 'minimal', label: 'Minimal' },
                                { id: 'bold', label: 'Bold' },
                                { id: 'neon', label: 'Neon' },
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStyle(s.id as any)}
                                    className={cn(
                                        "h-12 text-[8px] font-black uppercase tracking-widest border-r last:border-r-0 border-zinc-100 dark:border-zinc-900 transition-all",
                                        style === s.id
                                            ? "bg-black text-white dark:bg-white dark:text-black"
                                            : "text-zinc-400 opacity-60 hover:opacity-100"
                                    )}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleAdd}
                        disabled={isPending || !title.trim() || !targetDate}
                        className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-14 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all border border-black dark:border-white shadow-none"
                    >
                        {t('editors.countdown.deploy')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
