"use client"

import { updateProfile } from "@/actions/profile"
import { useTransition } from "react"
import { Palette, Type, Layout, Wand2, Scroll, Layers, Feather, MousePointer2 } from "lucide-react"

const textures = [
    { id: 'none', name: 'Plano', icon: Palette },
    { id: 'museum-paper', name: 'Papel Museu', icon: Scroll },
    { id: 'raw-canvas', name: 'Canvas Cru', icon: Layers },
    { id: 'fine-sand', name: 'Areia Fina', icon: Feather },
]
import { cn } from "@/lib/utils"

interface ThemeEditorProps {
    currentTheme: string
    currentPrimaryColor: string
    currentFontStyle: string
    currentCustomFont?: string
    onUpdate?: (data: any) => void
}

const GOOGLE_FONTS = [
    { name: 'Inter', family: 'Inter' },
    { name: 'Outfit', family: 'Outfit' },
    { name: 'Playfair', family: 'Playfair Display' },
    { name: 'Mono', family: 'JetBrains Mono' },
    { name: 'Bangers', family: 'Bangers' },
    { name: 'Unbounded', family: 'Unbounded' },
    { name: 'Vibur', family: 'Vibur' },
    { name: 'Space', family: 'Space Grotesk' },
]

export function ThemeEditor({ currentTheme, currentPrimaryColor, currentFontStyle, currentCustomFont, onUpdate }: ThemeEditorProps) {
    const [isPending, startTransition] = useTransition()

    const handleUpdate = (data: any) => {
        if (onUpdate) onUpdate(data) // Instant Preview

        startTransition(async () => {
            await updateProfile(data) // Server Sync
        })
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                        <Palette className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Vibes do Mural</h3>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 pt-2 -mx-1 px-1 custom-scrollbar snap-x">
                    {[
                        { id: 'light', label: 'Classic', colors: 'bg-white border-zinc-200' },
                        { id: 'dark', label: 'Midnight', colors: 'bg-zinc-900 border-zinc-800' },
                        { id: 'vintage', label: 'Vintage', colors: 'bg-[#f4ead5] border-[#d3c4a1]', data: { theme: 'vintage', backgroundColor: '#f4ead5', primaryColor: '#5d4037' } },
                        { id: 'notebook', label: 'Notebook', colors: 'bg-[#fafafa] border-blue-100', data: { theme: 'notebook', backgroundColor: '#fafafa', primaryColor: '#1e3a8a' } },
                        { id: 'blueprint', label: 'Blueprint', colors: 'bg-[#1a3a5f] border-[#2d5a8e]', data: { theme: 'blueprint', backgroundColor: '#1a3a5f', primaryColor: '#ffffff' } },
                        { id: 'canvas', label: 'Canvas', colors: 'bg-[#e7e5e4] border-[#d6d3d1]', data: { theme: 'canvas', backgroundColor: '#e7e5e4', primaryColor: '#44403c' } },
                        { id: 'cyberpunk', label: 'Cyberpunk', colors: 'bg-black border-pink-500/30', data: { theme: 'cyberpunk', backgroundColor: '#000000', primaryColor: '#ff00ff' } },
                    ].map((vibe) => (
                        <button
                            key={vibe.id}
                            onClick={() => handleUpdate(vibe.data || { theme: vibe.id })}
                            disabled={isPending}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all min-w-[100px] snap-start shrink-0 group",
                                currentTheme === vibe.id
                                    ? "border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 scale-[1.05] shadow-md"
                                    : "border-transparent opacity-60 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm"
                            )}
                        >
                            <div className={cn("w-full h-12 rounded-xl mb-3 border shadow-inner transition-transform group-hover:scale-95", vibe.colors)} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{vibe.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                        <MousePointer2 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Cor dos Elementos</h3>
                </div>
                <p className="text-[10px] text-zinc-500 italic leading-tight px-1">Define a cor dos textos, ícones e detalhes do fundo.</p>
                <div className="flex flex-wrap gap-2">
                    {['#000000', '#FF0000', '#22C55E', '#3B82F6', '#A855F7', '#EC4899'].map(color => (
                        <button
                            key={color}
                            onClick={() => handleUpdate({ primaryColor: color })}
                            disabled={isPending}
                            className={cn(
                                "w-10 h-10 rounded-full border-2 transition-all",
                                currentPrimaryColor === color ? "border-zinc-400 scale-110" : "border-transparent"
                            )}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                        <Type className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Google Fonts</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {GOOGLE_FONTS.map(font => (
                        <button
                            key={font.family}
                            onClick={() => handleUpdate({ customFont: font.family })}
                            disabled={isPending}
                            className={cn(
                                "h-11 px-3 rounded-xl border-2 transition-all flex items-center justify-between group",
                                currentCustomFont === font.family ? "bg-zinc-100 dark:bg-zinc-800 border-black dark:border-white shadow-sm" : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 opacity-70 hover:opacity-100"
                            )}
                        >
                            <span className="text-[10px] font-bold truncate pr-2 uppercase tracking-tighter" style={{ fontFamily: font.family }}>{font.name}</span>
                            <div className={cn("w-1.5 h-1.5 rounded-full", currentCustomFont === font.family ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-700")} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                        <Type className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Base System</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'sans', label: 'Sans', font: 'font-sans' },
                        { id: 'serif', label: 'Serif', font: 'font-serif' },
                        { id: 'mono', label: 'Mono', font: 'font-mono' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => handleUpdate({ fontStyle: f.id })}
                            disabled={isPending}
                            className={cn(
                                "h-10 rounded-xl border-2 transition-all flex items-center justify-center",
                                currentFontStyle === f.id ? "bg-zinc-100 dark:bg-zinc-800 border-black dark:border-white" : "bg-transparent border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <span className={cn("text-xs font-medium", f.font)}>{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
