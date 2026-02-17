"use client"

import { useState, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Type, Palette, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { cn } from "@/lib/utils"

const TEXT_STYLES = [
    { id: 'simple', label: 'Simples', bg: 'bg-white dark:bg-zinc-900', border: 'border-zinc-100 dark:border-zinc-800' },
    { id: 'postit', label: 'Post-it', bg: 'bg-[#ffff88]', border: 'border-yellow-200 shadow-yellow-200/50 text-zinc-900' },
    { id: 'ripped', label: 'Rasgado', bg: 'bg-zinc-50 dark:bg-zinc-100 text-zinc-900', border: 'border-none' },
    { id: 'typewriter', label: 'Máquina', bg: 'bg-transparent', border: 'border-zinc-200 dark:border-zinc-700 font-mono underline' },
]

const COLORS = [
    '#ffffff', '#ffff88', '#ffb3ba', '#bae1ff', '#baffc9', '#e0b0ff'
]

export function TextEditor() {
    const [text, setText] = useState("")
    const [selectedStyle, setSelectedStyle] = useState('simple')
    const [bgColor, setBgColor] = useState('#ffffff')
    const [fontSize, setFontSize] = useState("xl")
    const [align, setAlign] = useState("center")
    const [isPending, startTransition] = useTransition()

    const handleAddText = () => {
        if (!text.trim()) return

        startTransition(async () => {
            await addMoodBlock('text', {
                text: text.trim(),
                style: selectedStyle,
                bgColor: selectedStyle === 'postit' ? '#ffff88' : bgColor,
                fontSize: fontSize,
                align: align
            }, { x: 50, y: 50 })
            setText("")
        })
    }

    return (
        <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Typography & Notes</h2>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                <Textarea
                    placeholder="Escreva algo inigualável..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[120px] bg-white dark:bg-zinc-900 border-none rounded-xl text-lg resize-none placeholder:opacity-30 focus-visible:ring-1 ring-zinc-300"
                />

                <div className="flex flex-wrap gap-2">
                    {TEXT_STYLES.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setSelectedStyle(s.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border",
                                selectedStyle === s.id
                                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                                    : "bg-white dark:bg-zinc-700 text-zinc-400 border-zinc-100 dark:border-zinc-800"
                            )}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 pt-2">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase opacity-40">Cor de Fundo</span>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setBgColor(c)}
                                    className={cn(
                                        "w-6 h-6 rounded-full border border-black/5 transition-transform hover:scale-110",
                                        bgColor === c ? "ring-2 ring-zinc-400" : ""
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase opacity-40">Tamanho da Fonte</span>
                        <div className="flex gap-2">
                            {['sm', 'xl', '3xl'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFontSize(s)}
                                    className={cn(
                                        "flex-1 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                                        fontSize === s ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-zinc-700 text-zinc-400"
                                    )}
                                >
                                    {s === 'sm' ? 'Pequeno' : s === 'xl' ? 'Médio' : 'Grande'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button onClick={() => setAlign("left")} variant={align === "left" ? "primary" : "ghost"} size="sm" className="flex-1"><AlignLeft className="w-4 h-4" /></Button>
                    <Button onClick={() => setAlign("center")} variant={align === "center" ? "primary" : "ghost"} size="sm" className="flex-1"><AlignCenter className="w-4 h-4" /></Button>
                    <Button onClick={() => setAlign("right")} variant={align === "right" ? "primary" : "ghost"} size="sm" className="flex-1"><AlignRight className="w-4 h-4" /></Button>
                </div>

                <Button
                    onClick={handleAddText}
                    disabled={isPending || !text.trim()}
                    className="w-full bg-zinc-900 dark:bg-zinc-100 rounded-xl h-12 font-black tracking-tighter hover:scale-[1.02] transition-all"
                >
                    POSTAR NO MURAL
                </Button>
            </div>
        </div>
    )
}
