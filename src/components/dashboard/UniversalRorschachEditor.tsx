"use client"

import { useState, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
    Palette, Layers, Sparkles, RefreshCw,
    Droplets, Maximize2, Split, Shapes, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { MoodBlock } from "@/types/database"
import { EditorHeader, EditorSection, PillSelector, GridSelector, EditorActionButton, EditorSlider, EditorColorPicker } from "./EditorUI"

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
    const [isPending, startTransition] = useTransition()

    const content = block?.content || {}
    const [seed, setSeed] = useState(content.seed ?? Math.floor(Math.random() * 10000))
    const [color, setColor] = useState(content.color || '#000000')
    const [opacity, setOpacity] = useState(content.opacity ?? 1)
    const [blur, setBlur] = useState(content.blur ?? 0)
    const [symmetry, setSymmetry] = useState<'vertical' | 'horizontal' | 'quad'>(content.symmetry || 'vertical')
    const [complexity, setComplexity] = useState(content.complexity ?? 5)
    const [activeTab, setActiveTab] = useState<TabType>('geometry')

    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const updates = {
            seed,
            color,
            opacity,
            blur,
            symmetry,
            complexity
        }

        onUpdate(block.id, { content: updates })
    }, [seed, color, opacity, blur, symmetry, complexity, block?.id, onUpdate])

    const handleSave = () => {
        const finalContent = {
            seed, color, opacity, blur, symmetry, complexity
        }

        startTransition(async () => {
            if (block?.id) {
                if (onClose) onClose()
            } else if (onAdd) {
                await onAdd('rorschach', finalContent)
                if (onClose) onClose()
            }
        })
    }

    const regenerate = () => {
        setSeed(Math.floor(Math.random() * 10000))
    }

    return (
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={t('editors.rorschach.title')}
                subtitle={t('editors.rorschach.subtitle')}
            />

            <PillSelector
                options={[
                    { id: 'geometry', label: "Geometria", icon: Shapes },
                    { id: 'style', label: "Aparência", icon: Palette },
                ]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as TabType)}
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
                            onChange={(id) => setSymmetry(id as any)}
                            columns={3}
                        />
                    </EditorSection>

                    <EditorSlider
                        label="Semente Aleatória"
                        value={seed}
                        min={0}
                        max={10000}
                        onChange={setSeed}
                        icon={RefreshCw}
                    />

                    <EditorSlider
                        label="Complexidade"
                        value={complexity}
                        min={1}
                        max={20}
                        onChange={setComplexity}
                        icon={Maximize2}
                    />
                </div>
            )}

            {activeTab === 'style' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Cor Principal">
                        <EditorColorPicker value={color} onChange={setColor} />
                    </EditorSection>

                    <div className="grid grid-cols-2 gap-6">
                        <EditorSlider
                            label="Opacidade"
                            value={Math.round(opacity * 100)}
                            unit="%"
                            min={0}
                            max={100}
                            onChange={(v) => setOpacity(v / 100)}
                        />
                        <EditorSlider
                            label="Desfoque"
                            value={blur}
                            unit="px"
                            min={0}
                            max={20}
                            onChange={setBlur}
                            icon={Droplets}
                        />
                    </div>
                </div>
            )}

            <EditorActionButton 
                onClick={handleSave} 
                isLoading={isPending} 
                label={block?.id ? t('common.update') : t('common.deploy')}
            />
        </div>
    )
}
