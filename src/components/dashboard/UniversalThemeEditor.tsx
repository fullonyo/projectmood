"use client"

import { updateProfile } from "@/actions/profile"
import { useState, useTransition } from "react"
import { Palette, Type, Layout, Wand2, Scroll, Layers, Feather, MousePointer2, Sparkles, X, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { ColorPaletteExtractor } from "./color-palette-extractor"

interface ThemeEditorProps {
    currentTheme: string
    currentPrimaryColor: string
    currentStaticTexture: string
    onUpdate?: (data: any) => void
}

export function UniversalThemeEditor({ currentTheme, currentPrimaryColor, currentStaticTexture, onUpdate }: ThemeEditorProps) {
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
        { id: 'noise', name: t('editors.theme.textures.noise'), icon: Sparkles },
        { id: 'dots', name: t('editors.theme.textures.dots'), icon: Layout },
        { id: 'lines', name: t('editors.theme.textures.lines'), icon: Scroll },
        { id: 'cross', name: t('editors.theme.textures.cross'), icon: Type },
        { id: 'museum-paper', name: t('editors.theme.textures.museum_paper'), icon: Scroll },
        { id: 'raw-canvas', name: t('editors.theme.textures.raw_canvas'), icon: Layers },
        { id: 'fine-sand', name: t('editors.theme.textures.fine_sand'), icon: Feather },
    ]

    return (
        <div className="space-y-12 pb-20">
            <section className="space-y-4">
                <p className="text-[7px] text-zinc-400 uppercase tracking-[0.3em] font-black opacity-40 mb-4 px-1">
                    {t('editors.theme.title_desc')}
                </p>
                <div className="flex gap-[1px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto pb-0 pt-0 -mx-1 px-0 custom-scrollbar snap-x">
                    {[
                        { id: 'light', label: t('editors.theme.light'), colors: 'bg-white border-zinc-200', data: { theme: 'light', backgroundColor: '#fafafa', primaryColor: '#18181b' } },
                        { id: 'dark', label: t('editors.theme.dark'), colors: 'bg-zinc-900 border-zinc-800', data: { theme: 'dark', backgroundColor: '#050505', primaryColor: '#ffffff' } },
                        { id: 'vintage', label: t('editors.theme.vintage'), colors: 'bg-[#f4ead5] border-[#d3c4a1]', data: { theme: 'vintage', backgroundColor: '#f4ead5', primaryColor: '#5d4037' } },
                        { id: 'notebook', label: t('editors.theme.notebook'), colors: 'bg-[#fafafa] border-blue-100', data: { theme: 'notebook', backgroundColor: '#fafafa', primaryColor: '#1e3a8a' } },
                        { id: 'blueprint', label: t('editors.theme.blueprint'), colors: 'bg-[#1a3a5f] border-[#2d5a8e]', data: { theme: 'blueprint', backgroundColor: '#1a3a5f', primaryColor: '#ffffff' } },
                        { id: 'canvas', label: t('editors.theme.canvas'), colors: 'bg-[#e7e5e4] border-[#d6d3d1]', data: { theme: 'canvas', backgroundColor: '#e7e5e4', primaryColor: '#44403c' } },
                        { id: 'cyberpunk', label: t('editors.theme.cyberpunk'), colors: 'bg-black border-pink-500/30', data: { theme: 'cyberpunk', backgroundColor: '#000000', primaryColor: '#ff00ff' } },
                        { id: 'neobrutalism', label: t('editors.theme.neobrutalism'), colors: 'bg-[#fdf0d5] border-[#111111]', data: { theme: 'neobrutalism', backgroundColor: '#fdf0d5', primaryColor: '#111111' } },
                        { id: 'botanical', label: t('editors.theme.botanical'), colors: 'bg-[#e6e9e1] border-[#334338]', data: { theme: 'botanical', backgroundColor: '#e6e9e1', primaryColor: '#334338' } },
                        { id: 'ethereal', label: t('editors.theme.ethereal'), colors: 'bg-[#f5f5fa] border-[#3b2c63]', data: { theme: 'ethereal', backgroundColor: '#f5f5fa', primaryColor: '#3b2c63' } },
                        { id: 'charcoal', label: t('editors.theme.charcoal'), colors: 'bg-[#1c1c1e] border-[#d1d1d6]', data: { theme: 'charcoal', backgroundColor: '#1c1c1e', primaryColor: '#d1d1d6' } },
                        { id: 'terminal', label: t('editors.theme.terminal'), colors: 'bg-[#020B02] border-[#00ff41]', data: { theme: 'terminal', backgroundColor: '#020B02', primaryColor: '#00ff41' } },
                        { id: 'doodle', label: t('editors.theme.doodle'), colors: 'bg-white border-black', data: { theme: 'doodle', backgroundColor: '#ffffff', primaryColor: '#1a1a1a' } },
                        { id: 'manga', label: t('editors.theme.manga'), colors: 'bg-[#e8e8e8] border-black', data: { theme: 'manga', backgroundColor: '#e8e8e8', primaryColor: '#000000' } },
                        { id: 'y2k', label: t('editors.theme.y2k'), colors: 'bg-[#cceeff] border-[#ff3399]', data: { theme: 'y2k', backgroundColor: '#cceeff', primaryColor: '#ff3399' } },
                        { id: 'tarot', label: t('editors.theme.tarot'), colors: 'bg-[#140c21] border-[#d4af37]', data: { theme: 'tarot', backgroundColor: '#140c21', primaryColor: '#d4af37' } },
                    ].map((vibe) => (
                        <button
                            key={vibe.id}
                            onClick={() => handleUpdate(vibe.data || { theme: vibe.id })}
                            disabled={isPending}
                            className={cn(
                                "flex flex-col items-center justify-center p-5 transition-all min-w-[120px] snap-start shrink-0 group relative",
                                currentTheme === vibe.id
                                    ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                                    : "bg-white dark:bg-zinc-950 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                        >
                            {currentTheme === vibe.id && (
                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white" />
                            )}
                            <div className={cn("w-full h-12 border border-black/5 dark:border-white/5 mb-4 transition-all group-hover:scale-105", vibe.colors)} />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{vibe.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <header className="flex items-center gap-2 opacity-30 px-1 mb-2">
                    <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
                    <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('editors.theme.textures_title')}</h3>
                </header>
                <p className="text-[7px] text-zinc-400 uppercase tracking-[0.3em] font-black opacity-40 mb-4 px-1">
                    {t('editors.theme.textures_desc')}
                </p>
                <div className="grid grid-cols-4 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800">
                    {textures.map((text) => {
                        const isSelected = currentStaticTexture === text.id || (text.id === 'none' && !currentStaticTexture)
                        return (
                            <button
                                key={text.id}
                                onClick={() => handleUpdate({ staticTexture: text.id })}
                                disabled={isPending}
                                className={cn(
                                    "p-4 transition-all flex flex-col items-center gap-3 group relative",
                                    isSelected
                                        ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                                        : "bg-white dark:bg-zinc-950 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black dark:border-white" />
                                )}
                                <text.icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                <span className="text-[7px] font-black uppercase tracking-widest truncate w-full text-center">{text.name}</span>
                            </button>
                        )
                    })}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 opacity-30">
                        <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
                        <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('editors.theme.node_luminance')}</h3>
                    </div>

                    <button
                        onClick={() => setShowExtractor(!showExtractor)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 border transition-all text-[8px] font-black uppercase tracking-widest",
                            showExtractor
                                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg"
                                : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white"
                        )}
                    >
                        {showExtractor ? <X className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        {showExtractor ? 'EXTRACT' : 'SMART'}
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
                    <div className="flex flex-wrap gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500 px-1">
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
            </section>
        </div>
    )
}
