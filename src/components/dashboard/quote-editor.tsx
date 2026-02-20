"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Quote as QuoteIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

import { addMoodBlock } from "@/actions/profile"

interface QuoteEditorProps {
    block?: any
    onUpdate?: (id: string, content: any) => void
    onAdd?: (content: any) => Promise<void>
    onClose?: () => void
}

export function QuoteEditor({ block, onUpdate, onAdd, onClose }: QuoteEditorProps) {
    const { t } = useTranslation()
    const defaultContent = block?.content || {}
    const [text, setText] = useState(defaultContent.text || "")
    const [author, setAuthor] = useState(defaultContent.author || "")
    const [style, setStyle] = useState<'minimal' | 'bold' | 'serif' | 'modern'>(defaultContent.style || 'minimal')
    const [color, setColor] = useState(defaultContent.color || "#000000")
    const [bgColor, setBgColor] = useState(defaultContent.bgColor || "#ffffff")
    const [showQuotes, setShowQuotes] = useState(defaultContent.showQuotes !== undefined ? defaultContent.showQuotes : true)
    const [isPending, setIsPending] = useState(false)

    // 2. Real-time Preview
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const content = {
            text: text.trim(),
            author: author.trim() || undefined,
            style,
            color,
            bgColor,
            showQuotes
        }

        onUpdate(block.id, { content })
    }, [text, author, style, color, bgColor, showQuotes, block?.id])

    const handleAdd = async () => {
        if (!text.trim() && !block?.id) return

        setIsPending(true)
        const content = {
            text: text.trim(),
            author: author.trim() || undefined,
            style,
            color,
            bgColor,
            showQuotes
        }

        if (block?.id) {
            if (onClose) onClose()
        } else if (onAdd) {
            await onAdd(content)
            setText("")
            setAuthor("")
            setStyle('minimal')
            setColor("#000000")
            setBgColor("#ffffff")
            setShowQuotes(true)
        }
        setIsPending(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <QuoteIcon className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.quote.title')}</h3>
            </div>

            <div className="space-y-6 border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950">
                <div className="p-5 space-y-4">
                    <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.quote.label_text')}</Label>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t('editors.quote.placeholder')}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none min-h-[120px] text-[10px] uppercase font-mono tracking-tight focus-visible:ring-0 resize-none p-4"
                            maxLength={500}
                        />
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">{text.length} // 500</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.quote.label_author')}</Label>
                        <Input
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder={t('editors.quote.author')}
                            maxLength={100}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none h-11 text-[10px] font-mono tracking-tight focus-visible:ring-0 uppercase"
                        />
                    </div>
                </div>

                <div className="p-5 border-y border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 block text-center">{t('editors.quote.style_title')}</Label>
                    <div className="grid grid-cols-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        {[
                            { id: 'minimal', label: 'Neutral' },
                            { id: 'bold', label: 'Impact' },
                            { id: 'serif', label: 'Legacy' },
                            { id: 'modern', label: 'Mono' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStyle(s.id as any)}
                                className={cn(
                                    "h-12 flex flex-col items-center justify-center border-r last:border-r-0 border-zinc-100 dark:border-zinc-900 transition-all",
                                    style === s.id
                                        ? "bg-black text-white dark:bg-white dark:text-black"
                                        : "opacity-40 hover:opacity-100"
                                )}
                            >
                                <span className="text-[7px] font-black uppercase tracking-widest">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.quote.color_text')}</Label>
                            <div className="flex gap-2 p-1 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-8 h-8 rounded-none cursor-pointer border-none bg-transparent"
                                />
                                <input
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="flex-1 bg-transparent border-none text-[9px] font-mono outline-none uppercase w-full bg-zinc-100/50 dark:bg-zinc-800/50 px-2"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.quote.color_bg')}</Label>
                            <div className="flex gap-2 p-1 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-8 h-8 rounded-none cursor-pointer border-none bg-transparent"
                                />
                                <input
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="flex-1 bg-transparent border-none text-[9px] font-mono outline-none uppercase w-full bg-zinc-100/50 dark:bg-zinc-800/50 px-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-2 border-t border-zinc-100 dark:border-zinc-900">
                        <input
                            type="checkbox"
                            id="showQuotes"
                            checked={showQuotes}
                            onChange={(e) => setShowQuotes(e.target.checked)}
                            className="w-3.5 h-3.5 border border-zinc-300 rounded-none accent-black dark:accent-white"
                        />
                        <Label htmlFor="showQuotes" className="text-[8px] font-black uppercase tracking-[0.2em] cursor-pointer text-zinc-500">
                            {t('editors.quote.show_quotes')}
                        </Label>
                    </div>

                    <Button
                        onClick={handleAdd}
                        disabled={isPending || (!text.trim() && !block?.id)}
                        className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-14 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-none mt-6"
                    >
                        {isPending ? t('common.loading') : (block?.id ? t('common.close') : t('editors.quote.deploy'))}
                    </Button>
                </div>
            </div>
        </div>
    )
}
