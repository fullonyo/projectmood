"use client"
import { useState } from "react"
import { Calendar, Gift, Cake, Rocket, Heart, Hourglass, Sparkles, PartyPopper, Box, CircleDashed, Timer } from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { MoodBlock, CountdownContent } from "@/types/database"
import { EditorHeader, EditorSection, GridSelector, EditorActionButton } from "./EditorUI"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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
    onUpdate?: (updates: Partial<MoodBlock>) => void
    onAdd?: (content: CountdownContent) => Promise<void>
    onClose?: () => void
}

export function UniversalCountdownEditor({ block, onUpdate, onAdd, onClose }: CountdownEditorProps) {
    const { t } = useTranslation()
    const defaultContent = (block?.content as CountdownContent) || {}
    
    const [title, setTitle] = useState(defaultContent.title || "")
    const [targetDate, setTargetDate] = useState(defaultContent.targetDate || "")
    const [emoji, setEmoji] = useState(defaultContent.emoji || "PartyPopper")
    const [style, setStyle] = useState<'minimal' | 'bold' | 'neon'>(() => (defaultContent.style as any) || 'minimal')
    const [isPending, setIsPending] = useState(false)

    // Manual update to avoid useEffect loops
    const triggerUpdate = (updates: Partial<CountdownContent>) => {
        if (!onUpdate) return
        onUpdate({
            content: {
                title,
                targetDate,
                emoji,
                style,
                ...updates
            }
        })
    }

    const handleAction = async () => {
        if ((!title.trim() || !targetDate) && !block?.id) return

        setIsPending(true)
        const content: CountdownContent = {
            title: title.trim(),
            targetDate,
            emoji,
            style
        }

        if (block?.id) {
            if (onClose) onClose()
        } else if (onAdd) {
            await onAdd(content)
            setTitle("")
            setTargetDate("")
            setEmoji("PartyPopper")
            setStyle('minimal')
        }
        setIsPending(false)
    }

    return (
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={t('editors.countdown.title')}
                subtitle={t('editors.countdown.subtitle')}
                onClose={onClose}
            />

            <EditorSection title="Configuração">
                <div className="space-y-6 px-1">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 px-1">
                            {t('editors.countdown.label') || "O que estamos esperando?"}
                        </Label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center transition-all group-focus-within:scale-110 group-focus-within:text-blue-500">
                                <Timer className="w-4 h-4" />
                            </div>
                            <Input
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value)
                                    triggerUpdate({ title: e.target.value })
                                }}
                                placeholder={t('editors.countdown.placeholder')}
                                maxLength={50}
                                className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none rounded-2xl pl-16 h-14 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-blue-500/20"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 px-1">
                            {t('editors.countdown.target') || "Data e Hora Alvo"}
                        </Label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center transition-all group-focus-within:scale-110 group-focus-within:text-blue-500">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <Input
                                type="datetime-local"
                                value={targetDate}
                                onChange={(e) => {
                                    setTargetDate(e.target.value)
                                    triggerUpdate({ targetDate: e.target.value })
                                }}
                                className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none rounded-2xl pl-16 h-14 text-[13px] font-medium uppercase focus-visible:ring-1 focus-visible:ring-blue-500/20"
                            />
                        </div>
                    </div>
                </div>
            </EditorSection>

            <EditorSection title="Ícone">
                <GridSelector
                    options={ICONS.map(i => ({ id: i.name as any, label: i.name, icon: i.icon }))}
                    activeId={emoji as any}
                    onChange={(id) => {
                        setEmoji(id as string)
                        triggerUpdate({ emoji: id as string })
                    }}
                    columns={4}
                    variant="ghost"
                    id="countdown-icons"
                />
            </EditorSection>

            <EditorSection title="Estilo Visual">
                <GridSelector
                    options={[
                        { id: 'minimal', label: 'Minimal', icon: CircleDashed },
                        { id: 'bold', label: 'Bold', icon: Box },
                        { id: 'neon', label: 'Neon', icon: Sparkles },
                    ]}
                    activeId={style as any}
                    onChange={(id) => {
                        setStyle(id as any)
                        triggerUpdate({ style: id as any })
                    }}
                    columns={4}
                    variant="ghost"
                    id="countdown-styles"
                />
            </EditorSection>

            <EditorActionButton 
                onClick={handleAction} 
                isLoading={isPending} 
                disabled={(!title.trim() || !targetDate) && !block?.id}
                label={block?.id ? t('common.close') : t('editors.countdown.deploy')}
            />
        </div>
    )
}
