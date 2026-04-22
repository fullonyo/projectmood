"use client"

import { useState, useEffect } from "react"
import {
    Circle, Square, Triangle, Hexagon, Star, Github,
    Palette, Box, Droplets, Sparkles, Wind, Zap, RefreshCw, Activity,
    Layers, Grid, Flower, Share2, Waves, Minus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { ShapeType } from "./SmartShape"
import { MoodBlock } from "@/types/database"
import { BLEND_MODES } from "@/lib/editor-constants"
import { addMoodBlock } from "@/actions/profile"
import { toast } from "sonner"
import { 
    EditorHeader, 
    EditorSection, 
    PillSelector, 
    GridSelector, 
    EditorActionButton, 
    EditorSlider, 
    EditorColorPicker, 
    EditorSwitch,
    ListSelector
} from "./EditorUI"

interface UniversalShapeEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (type: string, content: any) => Promise<void>
    onClose?: () => void
}

type TabType = 'geometry' | 'style' | 'effects'

const SHAPE_OPTIONS: { id: ShapeType; icon: any; tk: string }[] = [
    { id: 'circle', icon: Circle, tk: 'circle' },
    { id: 'rect', icon: Square, tk: 'rect' },
    { id: 'triangle', icon: Triangle, tk: 'triangle' },
    { id: 'polygon', icon: Hexagon, tk: 'polygon' },
    { id: 'star', icon: Star, tk: 'star' },
    { id: 'blob', icon: Github, tk: 'blob' },
    { id: 'line', icon: Minus, tk: 'line' },
    { id: 'grid', icon: Grid, tk: 'grid' },
    { id: 'flower', icon: Flower, tk: 'flower' },
    { id: 'mesh', icon: Share2, tk: 'mesh' },
    { id: 'wave', icon: Waves, tk: 'wave' },
    { id: 'spiral', icon: RefreshCw, tk: 'spiral' },
]

export function UniversalShapeEditor({
    block,
    onUpdate,
    onAdd,
    onClose
}: UniversalShapeEditorProps) {
    const { t } = useTranslation()
    const [isPending, setIsPending] = useState(false)

    const content = block?.content || {}
    const [shapeType, setShapeType] = useState<ShapeType>(content.shapeType || 'circle')
    const [color, setColor] = useState(content.color || '#3b82f6')
    const [opacity, setOpacity] = useState(content.opacity ?? 1)
    const [blur, setBlur] = useState(content.blur ?? 0)
    const [sides, setSides] = useState(content.sides ?? 5)
    const [points, setPoints] = useState(content.points ?? 5)
    const [blendMode, setBlendMode] = useState(content.blendMode || 'normal')
    const [gradient, setGradient] = useState(content.gradient || false)
    const [seed, setSeed] = useState(content.seed ?? 0)
    const [glowIntensity, setGlowIntensity] = useState(content.glowIntensity ?? 0)
    const [isFloating, setIsFloating] = useState(content.isFloating ?? false)
    const [floatSpeed, setFloatSpeed] = useState(content.floatSpeed ?? 5)
    const [gradientType, setGradientType] = useState<'linear' | 'radial'>(content.gradientType || 'linear')
    const [activeTab, setActiveTab] = useState<TabType>('geometry')

    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const updates = {
            shapeType, color, opacity, blur, sides,
            points, blendMode, gradient, seed,
            glowIntensity, isFloating, floatSpeed, gradientType
        }

        // Deep check to prevent infinite loops: only update if something actually changed
        const currentContent = block.content || {}
        const hasChanged = Object.entries(updates).some(([key, value]) => {
            return currentContent[key] !== value
        })

        if (hasChanged) {
            onUpdate(block.id, { content: updates })
        }
    }, [shapeType, color, opacity, blur, sides, points, blendMode, gradient, seed, glowIntensity, isFloating, floatSpeed, gradientType, block?.id, onUpdate, block?.content])

    const handleSave = async () => {
        const finalContent = {
            shapeType, color, opacity, blur, sides,
            points, blendMode, gradient, seed,
            glowIntensity, isFloating, floatSpeed, gradientType
        }

        setIsPending(true)
        try {
            if (block?.id) {
                if (onClose) onClose()
            } else if (onAdd) {
                await onAdd('shape', finalContent)
                if (onClose) onClose()
            } else {
                const res = await addMoodBlock('shape', finalContent, {
                    x: 50, y: 50,
                    width: 200,
                    height: 200
                })
                if (res.error) toast.error(res.error)
                else if (onClose) onClose()
            }
        } catch (error) {
            toast.error("Erro ao salvar forma")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={block ? t('editors.shape.edit_title') : t('editors.shape.add_title')}
                subtitle={t('editors.shape.subtitle')}
                onClose={onClose}
            />

            <PillSelector
                options={[
                    { id: 'geometry', label: "Geometria", icon: Box },
                    { id: 'style', label: "Cor & Blend", icon: Palette },
                    { id: 'effects', label: "Efeitos", icon: Sparkles },
                ]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as TabType)}
                variant="ghost"
            />

            {activeTab === 'geometry' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Tipo de Forma">
                        <GridSelector
                            options={SHAPE_OPTIONS.map(s => ({ id: s.id as any, label: t(`editors.shape.shapes.${s.tk}`), icon: s.icon }))}
                            activeId={shapeType as any}
                            onChange={(id) => setShapeType(id as ShapeType)}
                            columns={4}
                            variant="ghost"
                            id="shape-geometry"
                        />
                    </EditorSection>

                    {['polygon', 'star'].includes(shapeType) && (
                        <EditorSlider
                            label={shapeType === 'polygon' ? "Lados" : "Pontas"}
                            value={shapeType === 'polygon' ? sides : points}
                            min={3}
                            max={12}
                            onChange={(v) => shapeType === 'polygon' ? setSides(v) : setPoints(v)}
                            variant="ghost"
                        />
                    )}

                    {['blob', 'line', 'grid', 'flower', 'mesh', 'wave', 'spiral'].includes(shapeType) && (
                        <EditorSlider
                            label="Variação (Seed)"
                            value={seed}
                            min={0}
                            max={shapeType === 'blob' ? 4 : 99}
                            onChange={setSeed}
                            icon={RefreshCw}
                            variant="ghost"
                        />
                    )}
                </div>
            )}

            {activeTab === 'style' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Cor Principal">
                        <EditorColorPicker value={color} onChange={setColor} variant="ghost" />
                    </EditorSection>

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
                        <ListSelector
                            options={BLEND_MODES.map(m => ({ id: m, label: m.replace('-', ' ') }))}
                            activeId={blendMode}
                            onChange={(id) => setBlendMode(id as any)}
                        />
                    </EditorSection>

                    <EditorSection title="Gradiente Studio">
                        <div className="space-y-4">
                            <EditorSwitch
                                label="Ativar Gradiente"
                                value={gradient}
                                onChange={setGradient}
                                icon={Zap}
                            />

                            {gradient && (
                                <PillSelector
                                    options={[
                                        { id: 'linear', label: 'Linear', icon: Activity },
                                        { id: 'radial', label: 'Radial', icon: Activity },
                                    ]}
                                    activeId={gradientType}
                                    onChange={(id) => setGradientType(id as any)}
                                />
                            )}
                        </div>
                    </EditorSection>
                </div>
            )}

            {activeTab === 'effects' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSlider
                        label="Brilho (Glow)"
                        value={glowIntensity}
                        unit="%"
                        min={0}
                        max={100}
                        onChange={setGlowIntensity}
                        icon={Sparkles}
                        variant="ghost"
                    />

                    <EditorSlider
                        label="Desfoque (Blur)"
                        value={blur}
                        unit="px"
                        min={0}
                        max={100}
                        onChange={setBlur}
                        icon={Droplets}
                        variant="ghost"
                    />

                    <EditorSection title="Animação Dinâmica">
                        <div className="space-y-6">
                            <EditorSwitch
                                label="Efeito Flutuar"
                                value={isFloating}
                                onChange={setIsFloating}
                                icon={Wind}
                            />

                            {isFloating && (
                                <EditorSlider
                                    label="Velocidade"
                                    value={floatSpeed}
                                    min={1}
                                    max={10}
                                    onChange={setFloatSpeed}
                                    icon={Activity}
                                    variant="ghost"
                                />
                            )}
                        </div>
                    </EditorSection>
                </div>
            )}

            <EditorActionButton 
                onClick={handleSave} 
                isLoading={isPending} 
                label={block?.id ? t('common.save') : t('editors.shape.deploy_btn')}
            />
        </div>
    )
}
