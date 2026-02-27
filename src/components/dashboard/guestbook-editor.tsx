"use client"

import { useState, useTransition, useEffect } from "react"
import { motion } from "framer-motion"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MessageSquare, Sparkles, Globe, Layers, Palette, Terminal, Zap, StickyNote, LayoutGrid, Box, Cloud, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { MoodBlock } from "@/types/database"

const BLEND_MODES = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color-dodge', 'color-burn', 'hard-light', 'soft-light',
    'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
]

const GUESTBOOK_THEMES = [
    { id: 'glass', icon: Sparkles },
    { id: 'vhs', icon: Terminal },
    { id: 'cyber', icon: Zap },
    { id: 'paper', icon: StickyNote }
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

export function GuestbookEditor({ block, onUpdate, onClose }: GuestbookEditorProps) {
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

    // Live update for existing block
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
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* Header */}
            <header className="flex items-center gap-2 opacity-30 px-1">
                <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
                <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('editors.guestbook.title')}</h3>
            </header>

            <nav className="grid grid-cols-2 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                {[
                    { id: 'connection', label: t('editors.guestbook.tabs.connection') || 'Conexão', icon: Globe },
                    { id: 'esthetics', label: t('editors.guestbook.tabs.esthetics') || 'Estética', icon: Sparkles }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={cn(
                            "flex flex-col items-center justify-center py-4 gap-1.5 transition-all relative group",
                            activeTab === tab.id
                                ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        {activeTab === tab.id && (
                            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                        )}
                        <div className={cn("text-[6px] font-black uppercase tracking-[0.2em] transition-opacity", activeTab === tab.id ? "opacity-100" : "opacity-40")}>
                            {tab.label}
                        </div>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="guestbook-tab-active"
                                className="absolute bottom-0 left-2 right-2 h-0.5 bg-black dark:bg-white"
                            />
                        )}
                    </button>
                ))}
            </nav>

            {/* Connection Tab */}
            {
                activeTab === 'connection' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4">
                            <Label className="text-[7.5px] font-black uppercase tracking-[0.4em] opacity-50">{t('editors.guestbook.label')}</Label>
                            <Input
                                placeholder={t('editors.guestbook.placeholder')}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-900 border-none rounded-none h-12 text-[10px] font-mono uppercase focus-visible:ring-1 ring-black dark:ring-white"
                            />
                        </div>

                        {/* Layout Mode Selector - Studio 3.0 ✨ */}
                        <div className="space-y-4">
                            <Label className="text-[7.5px] font-black uppercase tracking-[0.4em] opacity-50 flex items-center gap-2">
                                <LayoutGrid className="w-3 h-3" /> {t('editors.guestbook.layout_label') || 'Modo de Exibição'}
                            </Label>
                            <div className="grid grid-cols-3 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800">
                                {LAYOUT_MODES.map((l) => (
                                    <button
                                        key={l.id}
                                        onClick={() => setLayoutMode(l.id as any)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 py-4 transition-all relative group",
                                            layoutMode === l.id
                                                ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                        )}
                                    >
                                        {layoutMode === l.id && (
                                            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                                        )}
                                        <l.icon className="w-3.5 h-3.5" />
                                        <span className="text-[6px] font-black uppercase tracking-widest">
                                            {t(`editors.guestbook.layouts.${l.id}`)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[7.5px] font-black uppercase tracking-[0.4em] opacity-50">{t('editors.guestbook.color_label')}</Label>
                            <div className="flex gap-2 p-1 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                                <div className="flex-1 relative">
                                    <Input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="bg-transparent border-none pl-10 h-10 rounded-none text-[10px] font-mono uppercase focus-visible:ring-0"
                                    />
                                    <div
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border border-black/10 dark:border-white/10"
                                        style={{ backgroundColor: color }}
                                    />
                                </div>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-10 h-10 cursor-pointer bg-transparent border-none p-0"
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Esthetics Tab */}
            {
                activeTab === 'esthetics' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Theme Selector */}
                        <div className="space-y-4">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <Palette className="w-3 h-3" /> {t('editors.guestbook.style_label') || 'Tema Visual'}
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {GUESTBOOK_THEMES.map((tInfo) => (
                                    <button
                                        key={tInfo.id}
                                        onClick={() => setStyle(tInfo.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-4 border transition-all duration-300",
                                            style === tInfo.id
                                                ? "border-black dark:border-white bg-black/5 dark:bg-white/5"
                                                : "border-zinc-100 dark:border-zinc-900 bg-transparent opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        <tInfo.icon className="w-4 h-4" />
                                        <span className="text-[7px] font-black uppercase tracking-tighter">
                                            {t(`editors.guestbook.styles.${tInfo.id}`)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Micro-Aesthetics Density Slider */}
                        <div className="space-y-4 pt-2">
                            <Label className="text-[7.5px] font-black uppercase tracking-[0.4em] opacity-50 flex items-center gap-2">
                                <LayoutGrid className="w-3 h-3" /> Micro-Aesthetics Scale: {Math.round(density * 100)}%
                            </Label>
                            <Slider
                                value={[density * 100]}
                                min={50}
                                max={150}
                                step={5}
                                onValueChange={([v]: number[]) => setDensity(v / 100)}
                                className="mt-4"
                            />
                            <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-widest italic opacity-50">
                                Ajuste para uma sensação mais minimalista ou massiva.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[7.5px] font-black uppercase tracking-[0.4em] opacity-50 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> {t('editors.shape.opacity_label') || 'Opacidade'}: {Math.round(opacity * 100)}%
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

                            <div className="space-y-3">
                                <Label className="text-[7.5px] font-black uppercase tracking-[0.4em] opacity-50 flex items-center gap-2">
                                    <Layers className="w-3 h-3" /> {t('editors.shape.blend_label') || 'Blend Mode'}
                                </Label>
                                <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800 max-h-32 overflow-y-auto custom-scrollbar">
                                    {BLEND_MODES.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setBlendMode(m)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 text-[8px] font-black uppercase tracking-widest transition-all relative group",
                                                blendMode === m
                                                    ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                            )}
                                        >
                                            {blendMode === m && (
                                                <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                                            )}
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                blendMode === m ? "bg-black dark:bg-white" : "bg-transparent border border-zinc-300 dark:border-zinc-700"
                                            )} />
                                            {m.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <Button
                onClick={handleSave}
                disabled={isPending || !title}
                className="w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white rounded-none h-14 font-black uppercase tracking-[0.4em] text-[7.5px] border border-zinc-100 dark:border-zinc-800 transition-all relative group mt-4 overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                {block?.id ? t('editors.guestbook.update') || 'Atualizar Mural' : t('editors.guestbook.deploy')}
            </Button>

            <p className="text-[7px] text-zinc-400 font-black uppercase tracking-widest text-center opacity-30 mt-4">
                {t('editors.guestbook.visit_active')}
            </p>
        </div >
    )
}
