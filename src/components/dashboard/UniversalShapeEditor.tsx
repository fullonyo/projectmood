"use client"

import { useState, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
    Circle, Square, Triangle, Hexagon, Star, Github,
    Palette, Layers, Sparkles, Box, Droplets,
    ChevronLeft, ChevronRight, Wind, Zap, MousePointer2,
    Minus, Grid, Flower, Share2, Waves, RefreshCw, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { ShapeType, SmartShape } from "./SmartShape"
import { MoodBlock } from "@/types/database"
import { BLEND_MODES } from "@/lib/editor-constants"
import { EditorHeader, EditorSection, PillSelector, GridSelector, EditorActionButton, EditorSlider, EditorColorPicker, EditorSwitch } from "./EditorUI"

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
    const [isPending, startTransition] = useTransition()

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
            shapeType,
            color,
            opacity,
            blur,
            sides,
            points,
            blendMode,
            gradient,
            seed,
            glowIntensity,
            isFloating,
            floatSpeed,
            gradientType
        }

        onUpdate(block.id, { content: updates })
    }, [shapeType, color, opacity, blur, sides, points, blendMode, gradient, seed, glowIntensity, isFloating, floatSpeed, gradientType, block?.id, onUpdate])

    const handleSave = () => {
        const finalContent = {
            shapeType, color, opacity, blur, sides,
            points, blendMode, gradient, seed,
            glowIntensity, isFloating, floatSpeed, gradientType
        }

        startTransition(async () => {
            if (block?.id) {
                if (onClose) onClose()
            } else if (onAdd) {
                await onAdd('shape', finalContent)
                if (onClose) onClose()
            }
        })
    }

    return (
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={block ? t('editors.shape.edit_title') : t('editors.shape.add_title')}
                subtitle={t('editors.shape.subtitle')}
            />

            <PillSelector
                options={[
                    { id: 'geometry', label: "Geometria", icon: Box },
                    { id: 'style', label: "Cor & Blend", icon: Palette },
                    { id: 'effects', label: "Efeitos", icon: Sparkles },
                ]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as TabType)}
            />

            {activeTab === 'geometry' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Tipo de Forma">
                        <GridSelector
                            options={SHAPE_OPTIONS.map(s => ({ id: s.id as any, label: t(`editors.shape.shapes.${s.tk}`), icon: s.icon }))}
                            activeId={shapeType as any}
                            onChange={(id) => setShapeType(id as ShapeType)}
                            columns={4}
                        />
                    </EditorSection>

                    {['polygon', 'star'].includes(shapeType) && (
                        <EditorSlider
                            label={shapeType === 'polygon' ? "Lados" : "Pontas"}
                            value={shapeType === 'polygon' ? sides : points}
                            min={3}
                            max={12}
                            onChange={(v) => shapeType === 'polygon' ? setSides(v) : setPoints(v)}
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
                        />
                    )}
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
                    />

                    <EditorSlider
                        label="Desfoque (Blur)"
                        value={blur}
                        unit="px"
                        min={0}
                        max={100}
                        onChange={setBlur}
                        icon={Droplets}
                    />

                    <EditorSection title="Animação de Flutuar">
                        <div className="space-y-4">
                            <EditorSwitch
                                label="Efeito Flutuar"
                                value={isFloating}
                                onChange={setIsFloating}
                                icon={Wind}
                            />

                            {isFloating && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-[10px] font-bold uppercase text-zinc-400">Velocidade</Label>
                                    <Slider
                                        value={[floatSpeed]}
                                        min={1}
                                        max={10}
                                        step={1}
                                        onValueChange={([v]: number[]) => setFloatSpeed(v)}
                                    />
                                </div>
                            )}
                        </div>
                    </EditorSection>
                </div>
            )}

            <EditorActionButton 
                onClick={handleSave} 
                isLoading={isPending} 
                label={block?.id ? t('editors.shape.update_btn') : t('editors.shape.deploy_btn')}
            />
        </div>
    )
}
