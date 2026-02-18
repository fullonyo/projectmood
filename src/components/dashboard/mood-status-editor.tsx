"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Smile, Meh, Frown, Sparkles, Flame, Coffee, PartyPopper, Moon, Heart, Ghost, Check } from "lucide-react"

const ICONS = [
    { name: 'Smile', icon: Smile },
    { name: 'Meh', icon: Meh },
    { name: 'Frown', icon: Frown },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'Flame', icon: Flame },
    { name: 'Coffee', icon: Coffee },
    { name: 'PartyPopper', icon: PartyPopper },
    { name: 'Moon', icon: Moon },
    { name: 'Heart', icon: Heart },
    { name: 'Ghost', icon: Ghost },
]

interface MoodStatusEditorProps {
    onAdd: (content: any) => void
}

export function MoodStatusEditor({ onAdd }: MoodStatusEditorProps) {
    const [selectedIcon, setSelectedIcon] = useState("Smile")
    const [text, setText] = useState("")

    const handleAdd = () => {
        if (!text.trim()) return

        onAdd({
            emoji: selectedIcon, // Mantendo o nome da prop como 'emoji' para compatibilidade, mas enviando o nome do ícone
            text: text.trim(),
            timestamp: new Date().toISOString()
        })

        // Reset form
        setText("")
        setSelectedIcon("Smile")
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <Smile className="w-4 h-4 text-zinc-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Mood Status</h3>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Escolha o Ícone</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        {ICONS.map(({ name, icon: Icon }) => (
                            <button
                                key={name}
                                onClick={() => setSelectedIcon(name)}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-110 relative",
                                    selectedIcon === name ? "bg-white dark:bg-zinc-800 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-700" : "opacity-40 hover:opacity-100 bg-white/50 dark:bg-black/20"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", selectedIcon === name ? "text-zinc-900 dark:text-white" : "text-zinc-500")} />
                                {selectedIcon === name && (
                                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 shadow-sm">
                                        <Check className="w-2 h-2 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Seu mood agora
                    </Label>
                    <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ex: Inspirado e criativo!"
                        maxLength={50}
                        className="bg-white dark:bg-zinc-950 border-none rounded-xl h-11 shadow-inner text-xs"
                    />
                    <div className="flex justify-end">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">{text.length}/50</span>
                    </div>
                </div>

                <Button
                    onClick={handleAdd}
                    disabled={!text.trim()}
                    className="w-full bg-black dark:bg-white text-white dark:text-black rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-lg"
                >
                    Adicionar Status
                </Button>
            </div>
        </div>
    )
}
