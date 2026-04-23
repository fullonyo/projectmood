"use client"

import { useState } from "react"
import { 
    Palette, 
    Sparkles, 
    Layout, 
    Scroll, 
    Type, 
    Layers, 
    Feather, 
    X,
    Square,
    CloudFog,
    Grid3x3,
    Rows,
    Hash,
    FileText,
    CircleDashed
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { ColorPaletteExtractor } from "./color-palette-extractor"
import { EditorSection, GridSelector } from "./EditorUI"

interface ThemeEditorProps {
    currentTheme: string
    currentPrimaryColor: string
    currentStaticTexture: string
    onUpdate?: (data: any) => void
}

export function UniversalThemeEditor({ currentTheme, currentPrimaryColor, currentStaticTexture, onUpdate }: ThemeEditorProps) {
    const { t } = useTranslation()
    const [showExtractor, setShowExtractor] = useState(false)

    const handleUpdate = (data: any) => {
        if (onUpdate) onUpdate(data)
    }

    const textures = [
        { id: 'none', name: t('editors.theme.textures.none'), icon: Square },
        { id: 'noise', name: t('editors.theme.textures.noise'), icon: CloudFog },
        { id: 'dots', name: t('editors.theme.textures.dots'), icon: Grid3x3 },
        { id: 'lines', name: t('editors.theme.textures.lines'), icon: Rows },
        { id: 'cross', name: t('editors.theme.textures.cross'), icon: Hash },
        { id: 'museum-paper', name: t('editors.theme.textures.museum_paper'), icon: FileText },
        { id: 'raw-canvas', name: t('editors.theme.textures.raw_canvas'), icon: Layers },
        { id: 'fine-sand', name: t('editors.theme.textures.fine_sand'), icon: CircleDashed },
    ]

    return (
        <div className="space-y-10 pb-20">
            <EditorSection title={t('editors.theme.title_desc')}>
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 -mx-1 px-1 custom-scrollbar snap-x">
                    {[
                        { id: 'light', label: t('editors.theme.light'), colors: 'bg-white border-zinc-200', data: { theme: 'light', backgroundColor: '#fafafa', primaryColor: '#18181b' } },
                        { id: 'dark', label: t('editors.theme.dark'), colors: 'bg-zinc-900 border-zinc-800', data: { theme: 'dark', backgroundColor: '#050505', primaryColor: '#ffffff' } },
                        { id: 'vintage', label: t('editors.theme.vintage'), colors: 'bg-[#f4ead5] border-[#d3c4a1]', data: { theme: 'vintage', backgroundColor: '#f4ead5', primaryColor: '#5d4037' } },
                        { id: 'notebook', label: t('editors.theme.notebook'), colors: 'bg-[#fafafa] border-blue-100', data: { theme: 'notebook', backgroundColor: '#fafafa', primaryColor: '#1e3a8a' } },
                        { id: 'blueprint', label: t('editors.theme.blueprint'), colors: 'bg-[#1a3a5f] border-[#2d5a8e]', data: { theme: 'blueprint', backgroundColor: '#1a3a5f', primaryColor: '#ffffff' } },
                        { id: 'canvas', label: t('editors.theme.canvas'), colors: 'bg-[#e7e5e4] border-[#d6d3d1]', data: { theme: 'canvas', backgroundColor: '#e7e5e4', primaryColor: '#44403c' } },
                        { id: 'cyberpunk', label: t('editors.theme.cyberpunk'), colors: 'bg-black border-pink-500/30', data: { theme: 'cyberpunk', backgroundColor: '#000000', primaryColor: '#ff00ff' } },
                        { id: 'neobrutalism', label: t('editors.theme.neobrutalism'), colors: 'bg-[#fdf0d5] border-[#111111]', data: { theme: 'neobrutalism', backgroundColor: '#fdf0d5', primaryColor: '#111111' } },
                    ].map((vibe) => (
                        <button
                            key={vibe.id}
                            onClick={() => handleUpdate(vibe.data || { theme: vibe.id })}
                            className={cn(
                                "flex flex-col p-3 transition-all min-w-[140px] snap-start shrink-0 group relative rounded-2xl border",
                                currentTheme === vibe.id
                                    ? "bg-white dark:bg-zinc-800 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20"
                                    : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
                            )}
                        >
                            <div className={cn("w-full h-16 rounded-xl border border-black/5 dark:border-white/5 mb-3 transition-all group-hover:scale-[1.02]", vibe.colors)} />
                            <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide text-center w-full">{vibe.label}</span>
                        </button>
                    ))}
                </div>
            </EditorSection>

            <EditorSection title={t('editors.theme.textures_title')}>
                <GridSelector
                    id="theme-textures"
                    options={textures.map(tInfo => ({ id: tInfo.id as any, label: tInfo.name, icon: tInfo.icon }))}
                    activeId={currentStaticTexture || 'none'}
                    onChange={(id) => handleUpdate({ staticTexture: id })}
                    columns={4}
                    variant="ghost"
                />
            </EditorSection>

            <EditorSection title={t('editors.theme.node_luminance')}>
                <div className="flex flex-col gap-10">
                    <GridSelector
                        id="primary-color"
                        options={['#000000', '#FFFFFF', '#A3A3A3', '#F87171', '#34D399', '#60A5FA', '#E879F9', '#FBBF24', '#8B5CF6'].map(color => ({
                            id: color,
                            label: color === '#000000' ? 'Black' : color === '#FFFFFF' ? 'White' : 'Mood Color',
                            icon: undefined,
                            color: color
                        }))}
                        activeId={currentPrimaryColor}
                        onChange={(id) => handleUpdate({ primaryColor: id })}
                        columns={7}
                        variant="circle"
                    />

                    <button
                        onClick={() => setShowExtractor(!showExtractor)}
                        className={cn(
                            "flex items-center justify-center gap-3 w-full h-14 rounded-3xl transition-all text-[10px] font-black uppercase tracking-[0.3em] border",
                            showExtractor
                                ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20"
                                : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        )}
                    >
                        {showExtractor ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {showExtractor ? 'Fechar Smart Color' : 'Smart Color Extractor'}
                    </button>

                    {showExtractor && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <ColorPaletteExtractor onApplyPalette={(colors) => {
                                if (colors[0]) {
                                    handleUpdate({ primaryColor: colors[0] })
                                    setShowExtractor(false)
                                }
                            }} />
                        </div>
                    )}
                </div>
            </EditorSection>
        </div>
    )
}
