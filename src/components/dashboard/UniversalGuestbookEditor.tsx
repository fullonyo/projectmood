"use client"

import { useState, useTransition, useEffect } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Sparkles, Globe, Palette, Zap, Box, Cloud, LayoutList, LayoutGrid, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { MoodBlock } from "@/types/database"
import { BLEND_MODES } from "@/lib/editor-constants"
import { 
    EditorHeader, 
    EditorSection, 
    PillSelector, 
    GridSelector, 
    EditorActionButton, 
    EditorSlider, 
    EditorColorPicker,
    EditorListSelector 
} from "./EditorUI"

const GUESTBOOK_THEMES = [
    { id: 'glass', label: 'Studio Glass (Premium)', icon: Sparkles },
    { id: 'vhs', label: 'VHS / Retro (Analógico)', icon: Activity },
    { id: 'cyber', label: 'Cyber / Minimal (Cleaner)', icon: Zap },
    { id: 'paper', label: 'Paper / Post-it (Físico)', icon: Activity }
]

const LAYOUT_MODES = [
    { id: 'classic', icon: Box },
    { id: 'scattered', icon: LayoutGrid },
    { id: 'cloud', icon: Cloud }
]

type TabType = 'connection' | 'esthetics'

interface GuestbookEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onClose?: () => void
}

export function UniversalGuestbookEditor({ block, onUpdate, onClose }: GuestbookEditorProps) {
    const { t } = useTranslation()
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState<TabType>('connection')

    const content = (block?.content as any) || {}
    const [title, setTitle] = useState(content.title || "")
    const [color, setColor] = useState(content.color || "#000000")
    const [style, setStyle] = useState(content.style || 'glass')
    const [layoutMode, setLayoutMode] = useState(content.layoutMode || 'classic')
    const [density, setDensity] = useState(content.density ?? 1)
    const [opacity, setOpacity] = useState(content.opacity ?? 1)
    const [blendMode, setBlendMode] = useState(content.blendMode || 'normal')

    useEffect(() => {
        if (!block?.id || !onUpdate) return
        onUpdate(block.id, {
            content: { title, color, style, layoutMode, density, opacity, blendMode }
        })
    }, [title, color, style, layoutMode, density, opacity, blendMode, block?.id, onUpdate])

    const handleSave = () => {
        const finalContent = { title, color, style, layoutMode, density, opacity, blendMode }
        startTransition(async () => {
            if (block?.id) {
                if (onClose) onClose()
            } else {
                await addMoodBlock('guestbook', finalContent, {
                    width: layoutMode === 'scattered' ? 450 : 350,
                    height: layoutMode === 'scattered' ? 500 : 450
                })
                if (onClose) onClose()
            }
        })
    }

    return (
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={block ? t('editors.guestbook.edit_title') || "Editar Mural" : t('editors.guestbook.add_title')}
                subtitle={t('editors.guestbook.subtitle')}
                onClose={onClose}
            />

            <PillSelector
                options={[
                    { id: 'connection', label: "Configuração", icon: Globe },
                    { id: 'esthetics', label: "Aparência", icon: Sparkles },
                ]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as TabType)}
                variant="ghost"
            />

            {activeTab === 'connection' ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Pergunta ou Título">
                        <div className="space-y-2 px-1">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center transition-all group-focus-within:scale-110 group-focus-within:text-blue-500">
                                    <MessageSquare className="w-4 h-4 text-zinc-400 group-focus-within:text-blue-500" />
                                </div>
                                <Input
                                    placeholder={t('editors.guestbook.placeholder')}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none rounded-2xl pl-16 h-14 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-blue-500/20"
                                />
                            </div>
                        </div>
                    </EditorSection>

                    <EditorSection title="Modo de Exibição">
                        <GridSelector
                            options={LAYOUT_MODES.map(l => ({ id: l.id as any, label: t(`editors.guestbook.layouts.${l.id}`), icon: l.icon }))}
                            activeId={layoutMode}
                            onChange={(id) => setLayoutMode(id as any)}
                            columns={3}
                            variant="ghost"
                            id="guestbook-layouts"
                        />
                    </EditorSection>

                    <EditorSection title="Cor Principal">
                        <EditorColorPicker value={color} onChange={setColor} variant="ghost" />
                    </EditorSection>
                </div>
            ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Tema Visual">
                        <EditorListSelector
                            options={GUESTBOOK_THEMES.map(th => ({ 
                                id: th.id, 
                                label: t(`editors.guestbook.styles.${th.id}`) || th.label,
                                icon: th.icon 
                            }))}
                            activeId={style}
                            onChange={setStyle}
                            maxHeight="max-h-56"
                        />
                    </EditorSection>

                    <EditorSlider
                        label="Densidade & Escala"
                        value={Math.round(density * 100)}
                        unit="%"
                        min={50}
                        max={150}
                        onChange={(v) => setDensity(v / 100)}
                        icon={Zap}
                        variant="ghost"
                    />

                    <div className="grid grid-cols-2 gap-6">
                        <EditorSlider
                            label="Opacidade"
                            value={Math.round(opacity * 100)}
                            unit="%"
                            min={0}
                            max={100}
                            onChange={(v) => setOpacity(v / 100)}
                            variant="ghost"
                        />

                        <EditorSection title="Blend Mode">
                            <EditorListSelector
                                options={BLEND_MODES.map(m => ({ id: m, label: m.replace('-', ' ') }))}
                                activeId={blendMode}
                                onChange={setBlendMode}
                                maxHeight="max-h-40"
                            />
                        </EditorSection>
                    </div>
                </div>
            )}

            <EditorActionButton 
                onClick={handleSave} 
                isLoading={isPending} 
                disabled={!title}
                label={block?.id ? t('common.close') : t('editors.guestbook.deploy')}
            />
        </div>
    )
}
