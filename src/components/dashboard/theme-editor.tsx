"use client"

import { updateProfile } from "@/actions/profile"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

interface ThemeEditorProps {
    currentTheme: string
    currentPrimaryColor: string
    currentFontStyle: string
    onUpdate?: (data: any) => void
}

export function ThemeEditor({ currentTheme, currentPrimaryColor, currentFontStyle, onUpdate }: ThemeEditorProps) {
    const [isPending, startTransition] = useTransition()

    const handleUpdate = (data: any) => {
        if (onUpdate) onUpdate(data) // Instant Preview

        startTransition(async () => {
            await updateProfile(data) // Server Sync
        })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Vibes do Mural</h2>
                <div className="grid grid-cols-2 gap-2">
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
                                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all group",
                                currentTheme === vibe.id ? "border-black dark:border-white scale-[1.02]" : "border-transparent opacity-70 hover:opacity-100 shadow-sm"
                            )}
                        >
                            <div className={cn("w-full h-8 rounded-md mb-2 border", vibe.colors)} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{vibe.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <header>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Cor dos Elementos</h2>
                    <p className="text-[10px] text-zinc-500 italic leading-tight mt-1">Define a cor dos textos, ícones e detalhes do fundo.</p>
                </header>
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
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Tipografia</h2>
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
