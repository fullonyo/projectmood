"use client"

import { updateProfile } from "@/actions/profile"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

interface ThemeEditorProps {
    currentTheme: string
    currentPrimaryColor: string
    currentFontStyle: string
}

export function ThemeEditor({ currentTheme, currentPrimaryColor, currentFontStyle }: ThemeEditorProps) {
    const [isPending, startTransition] = useTransition()

    const handleUpdate = (data: any) => {
        startTransition(async () => {
            await updateProfile(data)
        })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Tema</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleUpdate({ theme: 'light' })}
                        disabled={isPending}
                        className={cn(
                            "h-12 rounded-xl border-2 transition-all",
                            currentTheme === 'light' ? "bg-white border-black" : "bg-white border-transparent shadow-sm"
                        )}
                    >
                        <span className="text-xs font-bold text-black">Claro</span>
                    </button>
                    <button
                        onClick={() => handleUpdate({ theme: 'dark' })}
                        disabled={isPending}
                        className={cn(
                            "h-12 rounded-xl border-2 transition-all",
                            currentTheme === 'dark' ? "bg-zinc-800 border-white" : "bg-zinc-800 border-transparent shadow-sm"
                        )}
                    >
                        <span className="text-xs font-bold text-white">Escuro</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Cor Principal</h2>
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
