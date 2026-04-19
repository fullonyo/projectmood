"use client"

import { useState, useTransition, useEffect } from "react"
import { motion } from "framer-motion"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MessageSquare, Sparkles, Globe, Layers, Palette, Zap, LayoutGrid, Box, Cloud, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { MoodBlock } from "@/types/database"
import { BLEND_MODES } from "@/lib/editor-constants"
import { EditorHeader, EditorSection, PillSelector, GridSelector, EditorActionButton, EditorSlider, EditorColorPicker } from "./EditorUI"

const GUESTBOOK_THEMES = [
    { id: 'glass', icon: Sparkles },
    { id: 'vhs', icon: Activity },
    { id: 'cyber', icon: Zap },
    { id: 'paper', icon: Activity }
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
    const [title, setTitle] = useState(content.title || t('editors.guestbook.title'))
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
                title={t('editors.guestbook.title')}
                subtitle={t('editors.guestbook.subtitle')}
            />

            <PillSelector
                options={[
                    { id: 'connection', label: "Configuração", icon: Globe },
                    { id: 'esthetics', label: "Aparência", icon: Sparkles },
                ]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as TabType)}
            />

            {activeTab === 'connection' ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Título do Mural">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="relative">
                                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input
                                    placeholder={t('editors.guestbook.placeholder')}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 h-12 text-[11px] font-medium"
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
                        />
                    </EditorSection>

                    <EditorSection title="Cor Principal">
                        <EditorColorPicker value={color} onChange={setColor} />
                    </EditorSection>
                </div>
            ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Tema Visual">
                        <GridSelector
                            options={GUESTBOOK_THEMES.map(tInfo => ({ id: tInfo.id as any, label: t(`editors.guestbook.styles.${tInfo.id}`), icon: tInfo.icon }))}
                            activeId={style}
                            onChange={(id) => setStyle(id as any)}
                            columns={2}
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
                    />

                    <div className="grid grid-cols-2 gap-6">
                        <EditorSlider
                            label="Opacidade"
                            value={Math.round(opacity * 100)}
                            unit="%"
                            min={0}
                            max={100}
                            onChange={(v) => setOpacity(v / 100)}
                        />

                        <EditorSection title="Blend Mode">
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm max-h-40 overflow-y-auto custom-scrollbar">
                                <div className="space-y-1">
                                    {BLEND_MODES.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setBlendMode(m)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                                blendMode === m ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                            )}
                                        >
                                            {m.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </EditorSection>
                    </div>
                </div>
            )}

            <EditorActionButton 
                onClick={handleSave} 
                isLoading={isPending} 
                disabled={!title}
                label={block?.id ? t('editors.guestbook.update') || 'Atualizar Mural' : t('editors.guestbook.deploy')}
            />
        </div>
    )
}
