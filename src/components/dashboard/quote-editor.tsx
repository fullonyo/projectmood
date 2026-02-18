"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Quote as QuoteIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuoteEditorProps {
    onAdd: (content: any) => void
}

export function QuoteEditor({ onAdd }: QuoteEditorProps) {
    const [text, setText] = useState("")
    const [author, setAuthor] = useState("")
    const [style, setStyle] = useState<'minimal' | 'bold' | 'serif' | 'modern'>('minimal')
    const [color, setColor] = useState("#000000")
    const [bgColor, setBgColor] = useState("#ffffff")
    const [showQuotes, setShowQuotes] = useState(true)

    const handleAdd = () => {
        if (!text.trim()) return

        onAdd({
            text: text.trim(),
            author: author.trim() || undefined,
            style,
            color,
            bgColor,
            showQuotes
        })

        // Reset form
        setText("")
        setAuthor("")
        setStyle('minimal')
        setColor("#000000")
        setBgColor("#ffffff")
        setShowQuotes(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <QuoteIcon className="w-4 h-4 text-zinc-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Quote</h3>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Citação</Label>
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Escreva uma citação inspiradora..."
                        className="min-h-[100px] resize-none"
                        maxLength={500}
                    />
                    <span className="text-[10px] text-zinc-400">{text.length}/500</span>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Autor (opcional)</Label>
                    <Input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Nome do autor"
                        maxLength={100}
                    />
                </div>

                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Estilo da Citação</Label>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar snap-x">
                        {[
                            { id: 'minimal', label: 'Minimal', preview: 'font-sans italic' },
                            { id: 'bold', label: 'Impacto', preview: 'font-black uppercase tracking-tighter' },
                            { id: 'serif', label: 'Clássico', preview: 'font-serif italic' },
                            { id: 'modern', label: 'Modern', preview: 'font-mono' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStyle(s.id as any)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-w-[90px] snap-start shrink-0 border-2",
                                    style === s.id
                                        ? "border-black dark:border-white bg-white dark:bg-zinc-800 shadow-md outline-none scale-[1.02]"
                                        : "border-transparent opacity-60 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                )}
                            >
                                <div className={cn("w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-xs overflow-hidden border border-zinc-200 dark:border-zinc-600 shadow-inner", s.preview)}>
                                    Aa
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Texto</Label>
                        <div className="flex gap-2 group p-1 bg-white dark:bg-zinc-900 rounded-2xl shadow-inner border border-zinc-100 dark:border-zinc-800">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-8 h-8 rounded-xl cursor-pointer border-none bg-transparent"
                            />
                            <input
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="flex-1 bg-transparent border-none text-[10px] font-mono outline-none uppercase w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Fundo</Label>
                        <div className="flex gap-2 group p-1 bg-white dark:bg-zinc-900 rounded-2xl shadow-inner border border-zinc-100 dark:border-zinc-800">
                            <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-8 h-8 rounded-xl cursor-pointer border-none bg-transparent"
                            />
                            <input
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="flex-1 bg-transparent border-none text-[10px] font-mono outline-none uppercase w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="showQuotes"
                        checked={showQuotes}
                        onChange={(e) => setShowQuotes(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300"
                    />
                    <Label htmlFor="showQuotes" className="text-xs cursor-pointer">
                        Mostrar aspas decorativas
                    </Label>
                </div>

                <Button
                    onClick={handleAdd}
                    disabled={!text.trim()}
                    className="w-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
                >
                    Adicionar Citação
                </Button>
            </div>
        </div>
    )
}
