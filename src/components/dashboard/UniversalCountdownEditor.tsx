"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Gift, Cake, Rocket, Heart, Hourglass, Sparkles, PartyPopper, Check, Activity, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { MoodBlock, CountdownContent } from "@/types/database"
import { EditorHeader, EditorSection, PillSelector, GridSelector, EditorActionButton, EditorSlider, EditorSwitch } from "./EditorUI"

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

interface CountdownEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (content: CountdownContent) => Promise<void>
    onClose?: () => void
}

export function UniversalCountdownEditor({ block, onUpdate, onAdd, onClose }: CountdownEditorProps) {
    const { t } = useTranslation()
    const defaultContent = block?.content || {}
    const [label, setLabel] = useState(defaultContent.label || "")
    const [targetDate, setTargetDate] = useState(defaultContent.targetDate || "")
    const [selectedIcon, setSelectedIcon] = useState(defaultContent.icon || "PartyPopper")
    const [style, setStyle] = useState<'minimal' | 'bold' | 'neon'>(defaultContent.style || 'minimal')
    const [isPending, setIsPending] = useState(false)

    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const content: CountdownContent = {
            label: label.trim(),
            targetDate,
            icon: selectedIcon,
            style
        }

        onUpdate(block.id, { content })
    }, [label, targetDate, selectedIcon, style, block?.id, onUpdate])

    const handleAction = async () => {
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
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={t('editors.countdown.title')}
                subtitle={t('editors.countdown.subtitle')}
            />

            <EditorSection title="Configuração">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">O que estamos esperando?</Label>
                        <div className="relative">
                            <Timer className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder={t('editors.countdown.placeholder')}
                                maxLength={50}
                                className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 h-12 text-[11px] font-medium"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Data e Hora Alvo</Label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                type="datetime-local"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 h-12 text-[11px] font-medium uppercase"
                            />
                        </div>
                    </div>
                </div>
            </EditorSection>

            <EditorSection title="Ícone">
                <GridSelector
                    options={ICONS.map(i => ({ id: i.name as any, label: i.name, icon: i.icon }))}
                    activeId={selectedIcon as any}
                    onChange={(id) => setSelectedIcon(id as string)}
                    columns={4}
                />
            </EditorSection>

            <EditorSection title="Estilo Visual">
                <GridSelector
                    options={[
                        { id: 'minimal', label: 'Minimal', icon: Activity },
                        { id: 'bold', label: 'Bold', icon: Activity },
                        { id: 'neon', label: 'Neon', icon: Activity },
                    ]}
                    activeId={style as any}
                    onChange={(id) => setStyle(id as any)}
                    columns={3}
                />
            </EditorSection>

            <EditorActionButton 
                onClick={handleAction} 
                isLoading={isPending} 
                disabled={(!label.trim() || !targetDate) && !block?.id}
                label={block?.id ? t('common.close') : t('editors.countdown.deploy')}
            />
        </div>
    )
}
