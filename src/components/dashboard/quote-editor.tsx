"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Quote as QuoteIcon } from "lucide-react"

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

                <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Estilo</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['minimal', 'bold', 'serif', 'modern'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStyle(s)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${style === s
                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                                    }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Cor do Texto</Label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700"
                            />
                            <Input
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="flex-1 font-mono text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Cor de Fundo</Label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700"
                            />
                            <Input
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="flex-1 font-mono text-xs"
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
