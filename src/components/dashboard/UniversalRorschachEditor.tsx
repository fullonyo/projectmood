"use client"

import { useState, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
    Palette, Layers, Sparkles, RefreshCw,
    Droplets, Maximize2, Split, Shapes
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { MoodBlock } from "@/types/database"

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

    // Real-time Update
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
    }, [seed, color, opacity, blur, symmetry, complexity])

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
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* Header */}
            <header className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        <Shapes className="w-4 h-4 text-black dark:text-white" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.rorschach.title')}</h3>
                        <p className="text-[8px] text-zinc-400 uppercase tracking-widest leading-none mt-1">{t('editors.rorschach.subtitle')}</p>
                    </div>
                </div>

                <nav className="flex gap-1 border-b border-zinc-100 dark:border-zinc-900 pb-px">
                    {(['geometry', 'style'] as TabType[]).map((tab) => (
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
                            {t(`editors.rorschach.tabs.${tab}`)}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="rorschach-tab-active"
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
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <RefreshCw className="w-3 h-3" /> {t('editors.rorschach.seed')}
                            </Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={regenerate}
                                className="h-7 text-[8px] font-black uppercase tracking-widest gap-2 rounded-none"
                            >
                                <RefreshCw className="w-3 h-3" /> {t('common.regenerate')}
                            </Button>
                        </div>
                        <Input
                            type="number"
                            value={seed}
                            onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                            className="bg-zinc-50 dark:bg-zinc-900 border-none rounded-none h-10 text-[10px] font-mono"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                            <Split className="w-3 h-3" /> {t('editors.rorschach.symmetry')}
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['vertical', 'horizontal', 'quad'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSymmetry(s)}
                                    className={cn(
                                        "py-3 text-[8px] font-black uppercase tracking-widest border transition-all",
                                        symmetry === s
                                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xl"
                                            : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-black dark:hover:border-white"
                                    )}
                                >
                                    {t(`editors.rorschach.symmetries.${s}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                            <Maximize2 className="w-3 h-3" /> {t('editors.rorschach.complexity')}: {complexity}
                        </Label>
                        <Slider
                            value={[complexity]}
                            min={1}
                            max={20}
                            step={1}
                            onValueChange={([v]: number[]) => setComplexity(v)}
                        />
                    </div>
                </div>
            )}

            {/* Style Tab */}
            {activeTab === 'style' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <Palette className="w-3 h-3" /> {t('editors.rorschach.color')}
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
                                <Sparkles className="w-3 h-3" /> {t('common.opacity')}: {Math.round(opacity * 100)}%
                            </Label>
                            <Slider
                                value={[opacity * 100]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={([v]: number[]) => setOpacity(v / 100)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <Droplets className="w-3 h-3" /> {t('common.blur')}: {blur}px
                            </Label>
                            <Slider
                                value={[blur]}
                                min={0}
                                max={20}
                                step={1}
                                onValueChange={([v]: number[]) => setBlur(v)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <Button
                onClick={handleSave}
                className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-16 font-black uppercase tracking-[0.5em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl mt-4"
                disabled={isPending}
            >
                {block?.id ? t('common.update') : t('common.deploy')}
            </Button>
        </div>
    )
}
