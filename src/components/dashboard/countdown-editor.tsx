"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"

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
                    <Input
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        placeholder="🎉"
                        maxLength={2}
                    />
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
