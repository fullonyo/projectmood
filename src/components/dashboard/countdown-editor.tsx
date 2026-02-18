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

                <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Estilo</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['minimal', 'bold', 'neon'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStyle(s)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${style === s
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                                    }`}
                            >
                                {s}
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
