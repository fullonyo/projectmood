"use client"

import { updateProfile } from "@/actions/profile"
import { useState, useTransition } from "react"
import { Palette, Type, Layout, Wand2, Scroll, Layers, Feather, MousePointer2, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { ColorPaletteExtractor } from "./color-palette-extractor"

interface ThemeEditorProps {
    currentTheme: string
    currentPrimaryColor: string
    currentStaticTexture: string
    onUpdate?: (data: any) => void
}

export function ThemeEditor({ currentTheme, currentPrimaryColor, currentStaticTexture, onUpdate }: ThemeEditorProps) {
    const { t } = useTranslation()
    const [isPending, startTransition] = useTransition()
    const [showExtractor, setShowExtractor] = useState(false)

    const handleUpdate = (data: any) => {
        if (onUpdate) onUpdate(data) // Instant Preview

        startTransition(async () => {
            await updateProfile(data) // Server Sync
        })
    }

    const textures = [
        { id: 'none', name: t('editors.theme.textures.none'), icon: Palette },
        { id: 'museum-paper', name: t('editors.theme.textures.museum_paper'), icon: Scroll },
        { id: 'raw-canvas', name: t('editors.theme.textures.raw_canvas'), icon: Layers },
        { id: 'fine-sand', name: t('editors.theme.textures.fine_sand'), icon: Feather },
    ]

    return (
        <div className="space-y-12">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                        <Palette className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                </div>
                <p className="text-[8px] text-zinc-400 uppercase tracking-widest pl-11 -mt-2 mb-4">
                    {t('editors.theme.title_desc')}
                </p>
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-1 px-1 custom-scrollbar snap-x no-scrollbar">
                    {[
                        { id: 'light', label: t('editors.theme.light'), colors: 'bg-white border-zinc-200' },
                        { id: 'dark', label: t('editors.theme.dark'), colors: 'bg-zinc-900 border-zinc-800' },
                        { id: 'vintage', label: t('editors.theme.vintage'), colors: 'bg-[#f4ead5] border-[#d3c4a1]', data: { theme: 'vintage', backgroundColor: '#f4ead5', primaryColor: '#5d4037' } },
                        { id: 'notebook', label: t('editors.theme.notebook'), colors: 'bg-[#fafafa] border-blue-100', data: { theme: 'notebook', backgroundColor: '#fafafa', primaryColor: '#1e3a8a' } },
                        { id: 'blueprint', label: t('editors.theme.blueprint'), colors: 'bg-[#1a3a5f] border-[#2d5a8e]', data: { theme: 'blueprint', backgroundColor: '#1a3a5f', primaryColor: '#ffffff' } },
                        { id: 'canvas', label: t('editors.theme.canvas'), colors: 'bg-[#e7e5e4] border-[#d6d3d1]', data: { theme: 'canvas', backgroundColor: '#e7e5e4', primaryColor: '#44403c' } },
                        { id: 'cyberpunk', label: t('editors.theme.cyberpunk'), colors: 'bg-black border-pink-500/30', data: { theme: 'cyberpunk', backgroundColor: '#000000', primaryColor: '#ff00ff' } },
                    ].map((vibe) => (
                        <button
                            key={vibe.id}
                            onClick={() => handleUpdate(vibe.data || { theme: vibe.id })}
                            disabled={isPending}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 border transition-all min-w-[110px] snap-start shrink-0 group relative",
                                currentTheme === vibe.id
                                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white scale-105 shadow-xl shadow-black/10 dark:shadow-white/5"
                                    : "bg-white dark:bg-black/20 border-zinc-100 dark:border-zinc-800 opacity-60 hover:opacity-100"
                            )}
                        >
                            <div className={cn("w-full h-10 border border-black/5 dark:border-white/5 mb-3 grayscale transition-all group-hover:grayscale-0", vibe.colors)} />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{vibe.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                        <Layers className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.theme.textures_title')}</h3>
                </div>
                <p className="text-[8px] text-zinc-400 uppercase tracking-widest pl-11 -mt-2 mb-4">
                    {t('editors.theme.textures_desc')}
                </p>
                <div className="grid grid-cols-4 gap-2">
                    {textures.map((text) => {
                        const isSelected = currentStaticTexture === text.id || (text.id === 'none' && !currentStaticTexture)
                        return (
                            <button
                                key={text.id}
                                onClick={() => handleUpdate({ staticTexture: text.id })}
                                disabled={isPending}
                                className={cn(
                                    "p-3 border transition-all flex flex-col items-center gap-2 group",
                                    isSelected
                                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                                        : "bg-white dark:bg-black/20 border-zinc-100 dark:border-zinc-800 opacity-60 hover:opacity-100"
                                )}
                            >
                                <text.icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                <span className="text-[7px] font-black uppercase tracking-tighter truncate w-full text-center">{text.name}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                            <Palette className="w-3.5 h-3.5 text-black dark:text-white" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.theme.node_luminance')}</h3>
                    </div>

                    <button
                        onClick={() => setShowExtractor(!showExtractor)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 border transition-all text-[8px] font-black uppercase tracking-widest",
                            showExtractor
                                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                                : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white"
                        )}
                    >
                        {showExtractor ? <X className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        {showExtractor ? 'COLORES' : 'SMART'}
                    </button>
                </div>

                {showExtractor ? (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-500 py-2">
                        <ColorPaletteExtractor onApplyPalette={(colors) => {
                            if (colors[0]) {
                                handleUpdate({ primaryColor: colors[0] })
                                setShowExtractor(false)
                            }
                        }} />
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {['#000000', '#FFFFFF', '#A3A3A3', '#F87171', '#34D399', '#60A5FA', '#E879F9', '#FBBF24', '#8B5CF6'].map(color => (
                            <button
                                key={color}
                                onClick={() => handleUpdate({ primaryColor: color })}
                                disabled={isPending}
                                className={cn(
                                    "w-9 h-9 border transition-all relative group",
                                    currentPrimaryColor === color
                                        ? "border-black dark:border-white scale-110 ring-2 ring-black/5 dark:ring-white/5 ring-offset-2"
                                        : "border-black/5 dark:border-white/5 hover:scale-105"
                                )}
                                style={{ backgroundColor: color }}
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
