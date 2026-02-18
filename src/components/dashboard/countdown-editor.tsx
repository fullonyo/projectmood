"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface CountdownEditorProps {
    onAdd: (content: any) => void
}

export function CountdownEditor({ onAdd }: CountdownEditorProps) {
    const [title, setTitle] = useState("")
    const [targetDate, setTargetDate] = useState("")
    const [emoji, setEmoji] = useState("🎉")
    const [style, setStyle] = useState<'minimal' | 'bold' | 'neon'>('minimal')

    const handleAdd = () => {
        if (!title.trim() || !targetDate) return

        onAdd({
            title: title.trim(),
            targetDate,
            emoji: emoji || undefined,
            style
        })

        // Reset
        setTitle("")
        setTargetDate("")
        setEmoji("🎉")
        setStyle('minimal')
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Countdown</h3>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Título</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Meu aniversário 🎂"
                        maxLength={50}
                    />
                    <span className="text-[10px] text-zinc-400">{title.length}/50</span>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Data e Hora</Label>
                    <Input
                        type="datetime-local"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Emoji (opcional)</Label>
                    <div className="flex flex-wrap gap-2 p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        {['🎉', '🎂', '📅', '🚀', '💖', '⏳', '✨', '🎈'].map(e => (
                            <button
                                key={e}
                                onClick={() => setEmoji(e)}
                                className={cn(
                                    "w-8 h-8 flex items-center justify-center text-lg rounded-lg transition-all hover:scale-125",
                                    emoji === e ? "bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700" : "opacity-60 hover:opacity-100"
                                )}
                            >
                                {e}
                            </button>
                        ))}
                        <input
                            value={emoji}
                            onChange={(e) => setEmoji(e.target.value)}
                            placeholder="Emoji"
                            className="w-10 h-8 bg-transparent border-none text-center focus:ring-0 outline-none p-0"
                            maxLength={2}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Estilo do Contador</Label>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar snap-x">
                        {[
                            { id: 'minimal', label: 'Minimal', preview: 'bg-zinc-100 dark:bg-zinc-800' },
                            { id: 'bold', label: 'Bold', preview: 'bg-black dark:bg-white' },
                            { id: 'neon', label: 'Neon', preview: 'bg-black ring-1 ring-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStyle(s.id as any)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-w-[90px] snap-start shrink-0 border-2",
                                    style === s.id
                                        ? "border-black dark:border-white bg-white dark:bg-zinc-800 shadow-md scale-[1.02]"
                                        : "border-transparent opacity-60 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                )}
                            >
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-[8px] font-black overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-inner", s.preview)}>
                                    <span className={cn(s.id === 'bold' ? 'text-white dark:text-black' : s.id === 'neon' ? 'text-pink-500' : 'text-zinc-500')}>00</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleAdd}
                    disabled={!title.trim() || !targetDate}
                    className="w-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
                >
                    Adicionar Countdown
                </Button>
            </div>
        </div>
    )
}
