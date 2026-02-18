"use client"

import { useState, useTransition, useEffect } from "react"
import { addMoodBlock, updateMoodBlockLayout } from "@/actions/profile"
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

export function TextEditor({
    block,
    onUpdate,
    highlight
}: {
    block?: any,
    onUpdate?: (id: string, content: any) => void,
    highlight?: boolean
}) {
    const [text, setText] = useState("")
    const [selectedStyle, setSelectedStyle] = useState('simple')
    const [bgColor, setBgColor] = useState('#ffffff')
    const [fontSize, setFontSize] = useState("xl")
    const [align, setAlign] = useState("center")
    const [isPending, startTransition] = useTransition()

    // 1. Sync with selected block
    useEffect(() => {
        if (block && block.type === 'text') {
            const content = block.content as any
            setText(content.text || "")
            setSelectedStyle(content.style || 'simple')
            setBgColor(content.bgColor || "#ffffff")
            setFontSize(content.fontSize || "xl")
            setAlign(content.align || "center")
        }
    }, [block?.id])

    // 2. Real-time Preview
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const content = {
            text,
            style: selectedStyle,
            bgColor: selectedStyle === 'postit' ? '#ffff88' : bgColor,
            fontSize,
            align
        }

        onUpdate(block.id, content)
    }, [text, selectedStyle, bgColor, fontSize, align])

    // 3. Debounced Silent Save
    useEffect(() => {
        if (!block?.id || !text.trim()) return

        const timer = setTimeout(async () => {
            const content = {
                text: text.trim(),
                style: selectedStyle,
                bgColor: selectedStyle === 'postit' ? '#ffff88' : bgColor,
                fontSize,
                align
            }
            await updateMoodBlockLayout(block.id, { content })
        }, 800)

        return () => clearTimeout(timer)
    }, [text, selectedStyle, bgColor, fontSize, align, block?.id])

    const handleAddText = () => {
        if (!text.trim()) return

        startTransition(async () => {
            const content = {
                text: text.trim(),
                style: selectedStyle,
                bgColor: selectedStyle === 'postit' ? '#ffff88' : bgColor,
                fontSize: fontSize,
                align: align
            }

            if (block?.id) {
                await updateMoodBlockLayout(block.id, { content })
            } else {
                await addMoodBlock('text', content, { x: 50, y: 50 })
                setText("")
            }
        })
    }

    return (
        <div className={cn(
            "space-y-6 transition-all duration-500 rounded-3xl",
            highlight ? "ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 p-6 -m-6" : ""
        )}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <Type className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Typography & Notes</h3>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                <Textarea
                    placeholder="Escreva algo inigualável..."
                    value={text}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
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
                    className="w-full bg-black dark:bg-white text-white dark:text-black rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-lg"
                >
                    Postar no Mural
                </Button>
            </div>
        </div>
    )
}
