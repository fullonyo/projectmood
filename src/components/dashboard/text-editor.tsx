"use client"

import { useState, useTransition, useEffect } from "react"
import { addMoodBlock, updateMoodBlockLayout } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Estilo do Papel</Label>
                    <div className="flex gap-3 overflow-x-auto pb-4 pt-1 -mx-1 px-1 custom-scrollbar snap-x">
                        {TEXT_STYLES.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedStyle(s.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all min-w-[100px] snap-start shrink-0 group",
                                    selectedStyle === s.id
                                        ? "border-black dark:border-white bg-white dark:bg-zinc-800 shadow-md scale-[1.05]"
                                        : "border-transparent opacity-50 hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                )}
                            >
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-[10px] font-black shadow-inner border border-black/5 overflow-hidden", s.bg)}>
                                    <div className={cn("w-full h-full flex flex-col p-1 gap-1", s.id === 'ripped' ? "bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]" : "")}>
                                        <div className="h-1 w-2/3 bg-black/10 rounded-full" />
                                        <div className="h-1 w-full bg-black/10 rounded-full" />
                                    </div>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="flex flex-col gap-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cor de Fundo</Label>
                        <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-inner border border-zinc-100 dark:border-zinc-800">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setBgColor(c)}
                                    className={cn(
                                        "w-7 h-7 rounded-full border border-black/5 transition-all hover:scale-125",
                                        bgColor === c ? "ring-2 ring-zinc-400 scale-125 z-10 mx-1" : ""
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tamanho</Label>
                            <div className="flex gap-1 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                {['sm', 'xl', '3xl'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setFontSize(s)}
                                        className={cn(
                                            "flex-1 h-8 rounded-lg flex items-center justify-center text-[9px] font-black uppercase transition-all",
                                            fontSize === s ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-sm" : "text-zinc-400"
                                        )}
                                    >
                                        {s === 'sm' ? 'P' : s === 'xl' ? 'M' : 'G'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Alinhamento</Label>
                            <div className="flex gap-1 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <button onClick={() => setAlign("left")} className={cn("flex-1 h-8 rounded-lg flex items-center justify-center transition-all", align === "left" ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-sm" : "text-zinc-400")}><AlignLeft className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setAlign("center")} className={cn("flex-1 h-8 rounded-lg flex items-center justify-center transition-all", align === "center" ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-sm" : "text-zinc-400")}><AlignCenter className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setAlign("right")} className={cn("flex-1 h-8 rounded-lg flex items-center justify-center transition-all", align === "right" ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-sm" : "text-zinc-400")}><AlignRight className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                    </div>
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
