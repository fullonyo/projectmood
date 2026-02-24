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
    Minus, Grid, Flower, Share2, Waves, RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { ShapeType, SmartShape } from "./SmartShape"
import { MoodBlock } from "@/types/database"

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

const BLEND_MODES = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color-dodge', 'color-burn', 'hard-light', 'soft-light',
    'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
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

    // Real-time Update
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
    }, [shapeType, color, opacity, blur, sides, points, blendMode, gradient, seed, glowIntensity, isFloating, floatSpeed, gradientType])

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
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* Header with Navigation */}
            <header className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        <Palette className="w-4 h-4 text-black dark:text-white" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.shape.title')}</h3>
                        <p className="text-[8px] text-zinc-400 uppercase tracking-widest leading-none mt-1">{t('editors.shape.subtitle')}</p>
                    </div>
                </div>

                <nav className="flex gap-1 border-b border-zinc-100 dark:border-zinc-900 pb-px">
                    {(['geometry', 'style', 'effects'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 px-2 py-3 text-[8px] font-black uppercase tracking-widest transition-all relative",
                                activeTab === tab
                                    ? "text-black dark:text-white"
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            )}
                        >
                            {t(`editors.shape.tabs.${tab}`)}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="shape-tab-active"
                                    className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-black dark:bg-white"
                                />
                            )}
                        </button>
                    ))}
                </nav>
            </header>

            {/* Geometry Tab */}
            {activeTab === 'geometry' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-4">
                        <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                            <Box className="w-3 h-3" /> {t('editors.shape.geometry_label')}
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {SHAPE_OPTIONS.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setShapeType(s.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-3 gap-2 border transition-all",
                                        shapeType === s.id
                                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xl scale-[1.02]"
                                            : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-black dark:hover:border-white"
                                    )}
                                >
                                    <s.icon className="w-4 h-4" />
                                    <span className="text-[7px] font-bold uppercase tracking-tighter">{t(`editors.shape.shapes.${s.tk}`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {['polygon', 'star'].includes(shapeType) && (
                        <div className="space-y-4 p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                            <Label className="text-[8px] font-black uppercase tracking-widest opacity-50">
                                {shapeType === 'polygon' ? t('editors.shape.adjust_sides') : t('editors.shape.adjust_points')}: {shapeType === 'polygon' ? sides : points}
                            </Label>
                            <Slider
                                value={[shapeType === 'polygon' ? sides : points]}
                                min={3}
                                max={12}
                                step={1}
                                onValueChange={([v]: number[]) => shapeType === 'polygon' ? setSides(v) : setPoints(v)}
                            />
                        </div>
                    )}

                    {['blob', 'line', 'grid', 'flower', 'mesh', 'wave', 'spiral'].includes(shapeType) && (
                        <div className="space-y-4 p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                            <Label className="text-[8px] font-black uppercase tracking-widest opacity-50 flex justify-between">
                                <span>{t('editors.shape.variation_label')}</span>
                                <span>#{seed + 1}</span>
                            </Label>
                            <Slider
                                value={[seed]}
                                min={0}
                                max={shapeType === 'blob' ? 4 : 99}
                                step={1}
                                onValueChange={([v]: number[]) => setSeed(v)}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Esthetics Tab */}
            {activeTab === 'style' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Droplets className="w-3 h-3" /> {t('editors.shape.color_label')}
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-12 h-10 p-1 bg-transparent border-zinc-200 dark:border-zinc-800 rounded-none cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="flex-1 bg-zinc-50 dark:bg-zinc-900 border-none rounded-none h-10 text-[10px] font-mono uppercase"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> {t('editors.shape.opacity_label')}: {Math.round(opacity * 100)}%
                                </Label>
                                <Slider
                                    value={[opacity * 100]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={([v]: number[]) => setOpacity(v / 100)}
                                    className="mt-4"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <Layers className="w-3 h-3" /> {t('editors.shape.blend_label')}
                            </Label>
                            <select
                                value={blendMode}
                                onChange={(e) => setBlendMode(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none h-10 text-[9px] font-black uppercase tracking-widest px-3 outline-none focus:ring-1 ring-black dark:ring-white"
                            >
                                {BLEND_MODES.map(mode => (
                                    <option key={mode} value={mode}>{mode.replace('-', ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4 p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                            <div className="flex items-center justify-between mb-4">
                                <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> Gradiente Studio
                                </Label>
                                <button
                                    onClick={() => setGradient(!gradient)}
                                    className={cn(
                                        "w-8 h-4 rounded-full transition-all relative",
                                        gradient ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-0.5 w-3 h-3 rounded-full transition-all",
                                        gradient
                                            ? "right-0.5 bg-white dark:bg-black"
                                            : "left-0.5 bg-white dark:bg-zinc-500"
                                    )} />
                                </button>
                            </div>

                            {gradient && (
                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['linear', 'radial'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setGradientType(type)}
                                                className={cn(
                                                    "py-2 text-[8px] font-black uppercase tracking-tighter border",
                                                    gradientType === type
                                                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                                        : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 text-zinc-400"
                                                )}
                                            >
                                                {t(`editors.shape.gradient_${type}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Effects Tab */}
            {activeTab === 'effects' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> {t('editors.shape.glow_label')}: {glowIntensity}%
                            </Label>
                            <Slider
                                value={[glowIntensity]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={([v]: number[]) => setGlowIntensity(v)}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <Droplets className="w-3 h-3" /> {t('editors.shape.blur_label')}: {blur}px
                            </Label>
                            <Slider
                                value={[blur]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={([v]: number[]) => setBlur(v)}
                            />
                        </div>

                        <div className="p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Wind className="w-3 h-3" /> {t('editors.shape.float_label')}
                                </Label>
                                <button
                                    onClick={() => setIsFloating(!isFloating)}
                                    className={cn(
                                        "px-3 py-1 text-[7px] font-black uppercase tracking-widest border transition-all",
                                        isFloating
                                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-transparent"
                                    )}
                                >
                                    {isFloating ? t('editors.shape.float_on') : t('editors.shape.float_off')}
                                </button>
                            </div>

                            {isFloating && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-[8px] font-black uppercase tracking-widest opacity-30">
                                        {t('editors.shape.float_speed_label')}
                                    </Label>
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
                    </div>
                </div>
            )}

            {/* Action */}
            <Button
                onClick={handleSave}
                className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-16 font-black uppercase tracking-[0.5em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl mt-4"
            >
                {block?.id ? t('editors.shape.update_btn') : t('editors.shape.deploy_btn')}
            </Button>
        </div>
    )
}
