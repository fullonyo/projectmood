"use client"

import { useState, useEffect } from "react"
import {
    Palette, Shapes, RefreshCw,
    Droplets, Maximize2, Split, Activity
} from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { MoodBlock } from "@/types/database"
import { addMoodBlock } from "@/actions/profile"
import { toast } from "sonner"
import { 
    EditorHeader, 
    EditorSection, 
    PillSelector, 
    GridSelector, 
    EditorActionButton, 
    EditorSlider, 
    EditorColorPicker 
} from "./EditorUI"

interface UniversalRorschachEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (type: string, content: any) => Promise<void>
    onClose?: () => void
}

type TabType = 'geometry' | 'style'

export function UniversalRorschachEditor({
    block,
    onUpdate,
    onAdd,
    onClose
}: UniversalRorschachEditorProps) {
    const { t } = useTranslation()
    const [isPending, setIsPending] = useState(false)

    const content = block?.content || {}
    const [seed, setSeed] = useState(content.seed ?? Math.floor(Math.random() * 10000))
    const [color, setColor] = useState(content.color || '#000000')
    const [opacity, setOpacity] = useState(content.opacity ?? 1)
    const [blur, setBlur] = useState(content.blur ?? 0)
    const [symmetry, setSymmetry] = useState<'vertical' | 'horizontal' | 'quad'>(content.symmetry || 'vertical')
    const [complexity, setComplexity] = useState(content.complexity ?? 5)
    const [activeTab, setActiveTab] = useState<TabType>('geometry')

    const triggerUpdate = (updates: any) => {
        if (!block?.id || !onUpdate) return
        onUpdate(block.id, {
            content: {
                seed, color, opacity, blur, symmetry, complexity,
                ...updates
            }
        })
    }

    const handleSave = async () => {
        const finalContent = {
            seed, color, opacity, blur, symmetry, complexity
        }

        setIsPending(true)
        try {
            if (block?.id) {
                if (onClose) onClose()
            } else if (onAdd) {
                await onAdd('rorschach', finalContent)
                if (onClose) onClose()
            } else {
                const res = await addMoodBlock('rorschach', finalContent, {
                    x: 50, y: 50,
                    width: 250,
                    height: 250
                })
                if (res.error) toast.error(res.error)
                else if (onClose) onClose()
            }
        } catch (error) {
            toast.error("Erro ao salvar Rorschach")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={block ? t('editors.rorschach.edit_title') || "Editar Rorschach" : t('editors.rorschach.title')}
                subtitle={t('editors.rorschach.subtitle')}
                onClose={onClose}
            />

            <PillSelector
                options={[
                    { id: 'geometry', label: "Geometria", icon: Shapes },
                    { id: 'style', label: "Aparência", icon: Palette },
                ]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as TabType)}
                variant="ghost"
            />

            {activeTab === 'geometry' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Simetria">
                        <GridSelector
                            options={[
                                { id: 'vertical', label: 'Vertical', icon: Split },
                                { id: 'horizontal', label: 'Horizontal', icon: Split },
                                { id: 'quad', label: 'Quadrática', icon: Maximize2 },
                            ]}
                            activeId={symmetry}
                            onChange={(id) => {
                                setSymmetry(id as any)
                                triggerUpdate({ symmetry: id as any })
                            }}
                            columns={3}
                            variant="ghost"
                            id="rorschach-symmetry"
                        />
                    </EditorSection>

                    <EditorSlider
                        label="Semente Aleatória"
                        value={seed}
                        min={0}
                        max={10000}
                        onChange={(v) => {
                            setSeed(v)
                            triggerUpdate({ seed: v })
                        }}
                        icon={RefreshCw}
                        variant="ghost"
                    />

                    <EditorSlider
                        label="Complexidade"
                        value={complexity}
                        min={1}
                        max={20}
                        onChange={(v) => {
                            setComplexity(v)
                            triggerUpdate({ complexity: v })
                        }}
                        icon={Maximize2}
                        variant="ghost"
                    />
                </div>
            )}

            {activeTab === 'style' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Cor Principal">
                        <EditorColorPicker 
                            value={color} 
                            onChange={(v) => {
                                setColor(v)
                                triggerUpdate({ color: v })
                            }} 
                            variant="ghost" 
                        />
                    </EditorSection>

                    <div className="grid grid-cols-2 gap-6">
                        <EditorSlider
                            label="Opacidade"
                            value={Math.round(opacity * 100)}
                            unit="%"
                            min={0}
                            max={100}
                            onChange={(v) => {
                                setOpacity(v / 100)
                                triggerUpdate({ opacity: v / 100 })
                            }}
                            variant="ghost"
                        />
                        <EditorSlider
                            label="Desfoque"
                            value={blur}
                            unit="px"
                            min={0}
                            max={20}
                            onChange={(v) => {
                                setBlur(v)
                                triggerUpdate({ blur: v })
                            }}
                            icon={Droplets}
                            variant="ghost"
                        />
                    </div>
                </div>
            )}

            <EditorActionButton 
                onClick={handleSave} 
                isLoading={isPending} 
                label={block?.id ? t('common.save') : t('common.deploy')}
            />
        </div>
    )
}
