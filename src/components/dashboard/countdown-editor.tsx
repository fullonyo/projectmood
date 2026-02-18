"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Gift, Cake, Rocket, Heart, Hourglass, Sparkles, PartyPopper, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const ICONS = [
    { name: 'Gift', icon: Gift },
    { name: 'Cake', icon: Cake },
    { name: 'Calendar', icon: Calendar },
    { name: 'Rocket', icon: Rocket },
    { name: 'Heart', icon: Heart },
    { name: 'Hourglass', icon: Hourglass },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'PartyPopper', icon: PartyPopper },
]

interface CountdownEditorProps {
    onAdd: (content: any) => void
}

export function CountdownEditor({ onAdd }: CountdownEditorProps) {
    const [title, setTitle] = useState("")
    const [targetDate, setTargetDate] = useState("")
    const [selectedIcon, setSelectedIcon] = useState("PartyPopper")
    const [style, setStyle] = useState<'minimal' | 'bold' | 'neon'>('minimal')

    const handleAdd = () => {
        if (!title.trim() || !targetDate) return

        onAdd({
            title: title.trim(),
            targetDate,
            emoji: selectedIcon, // Mantendo o nome da prop por compatibilidade
            style
        })

        // Reset
        setTitle("")
        setTargetDate("")
        setSelectedIcon("PartyPopper")
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Título</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Meu evento especial"
                        maxLength={50}
                        className="bg-white dark:bg-zinc-950 border-none rounded-xl h-11 shadow-inner text-xs"
                    />
                    <div className="flex justify-end">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">{title.length}/50</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Data e Hora</Label>
                    <Input
                        type="datetime-local"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border-none rounded-xl h-11 shadow-inner text-xs"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ícone do Momento</Label>
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
                                        ? "border-black dark:border-white bg-white dark:bg-zinc-800 shadow-md scale-[1.05]"
                                        : "border-transparent opacity-60 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                )}
                            >
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-[8px] font-black overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-inner", s.preview)}>
                                    <span className={cn(s.id === 'bold' ? 'text-white dark:text-black' : s.id === 'neon' ? 'text-pink-500' : 'text-zinc-500')}>00</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleAdd}
                    disabled={!title.trim() || !targetDate}
                    className="w-full bg-black dark:bg-white text-white dark:text-black rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-lg"
                >
                    Adicionar Countdown
                </Button>
            </div>
        </div>
    )
}
