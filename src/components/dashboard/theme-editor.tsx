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
                    <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        <Palette className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Vibe Protocols</h3>
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
                                "flex flex-col items-center justify-center p-4 border border-zinc-200 dark:border-zinc-800 transition-all min-w-[100px] snap-start shrink-0 group relative",
                                currentTheme === vibe.id
                                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white scale-105"
                                    : "bg-white dark:bg-zinc-950 opacity-60 hover:opacity-100"
                            )}
                        >
                            <div className={cn("w-full h-10 border border-zinc-100 dark:border-zinc-800 mb-3 grayscale", vibe.colors)} />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{vibe.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        <MousePointer2 className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Node_Luminance</h3>
                </div>
                <p className="text-[8px] text-zinc-400 uppercase tracking-widest leading-tight">Define visual intensity for core nodes.</p>
                <div className="flex flex-wrap gap-2">
                    {['#000000', '#FFFFFF', '#666666', '#FF0000', '#22C55E', '#3B82F6'].map(color => (
                        <button
                            key={color}
                            onClick={() => handleUpdate({ primaryColor: color })}
                            disabled={isPending}
                            className={cn(
                                "w-10 h-10 border border-zinc-200 dark:border-zinc-800 transition-all relative overflow-hidden",
                                currentPrimaryColor === color && "ring-1 ring-black dark:ring-white ring-offset-2 scale-110"
                            )}
                            style={{ backgroundColor: color }}
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        <Type className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Atomic_Typography</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {GOOGLE_FONTS.map(font => (
                        <button
                            key={font.family}
                            onClick={() => handleUpdate({ customFont: font.family })}
                            disabled={isPending}
                            className={cn(
                                "h-11 px-4 border border-zinc-200 dark:border-zinc-800 transition-all flex items-center justify-between group",
                                currentCustomFont === font.family ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-zinc-950 opacity-70 hover:opacity-100"
                            )}
                        >
                            <span className="text-[9px] font-black truncate pr-2 uppercase tracking-tighter" style={{ fontFamily: font.family }}>{font.name}</span>
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
                <div className="grid grid-cols-3 border border-zinc-200 dark:border-zinc-800">
                    {[
                        { id: 'sans', label: 'SANS', font: 'font-sans' },
                        { id: 'serif', label: 'SERIF', font: 'font-serif' },
                        { id: 'mono', label: 'MONO', font: 'font-mono' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => handleUpdate({ fontStyle: f.id })}
                            disabled={isPending}
                            className={cn(
                                "h-12 transition-all flex items-center justify-center border-r last:border-r-0 border-zinc-200 dark:border-zinc-800",
                                currentFontStyle === f.id ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <span className={cn("text-[8px] font-black uppercase tracking-widest", f.font)}>{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
