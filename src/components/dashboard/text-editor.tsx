"use client"

import { useState, useTransition, useEffect } from "react"
import { addMoodBlock, updateMoodBlockLayout } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Type, Palette, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

const TEXT_STYLES = [
    { id: 'simple', bg: 'bg-white dark:bg-zinc-900', border: 'border-zinc-100 dark:border-zinc-800' },
    { id: 'postit', bg: 'bg-[#ffff88]', border: 'border-yellow-200 shadow-yellow-200/50 text-zinc-900' },
    { id: 'ripped', bg: 'bg-zinc-50 dark:bg-zinc-100 text-zinc-900', border: 'border-none' },
    { id: 'typewriter', bg: 'bg-transparent', border: 'border-zinc-200 dark:border-zinc-700 font-mono underline' },
]

const COLORS = [
    '#ffffff', '#ffff88', '#ffb3ba', '#bae1ff', '#baffc9', '#e0b0ff'
]

export function TextEditor({
    block,
    onUpdate,
    onAdd,
    highlight
}: {
    block?: any,
    onUpdate?: (id: string, content: any) => void,
    onAdd?: (content: any) => Promise<void>,
    highlight?: boolean
}) {
    const { t } = useTranslation()
    const defaultContent = block?.content || {}
    const [text, setText] = useState(defaultContent.text || "")
    const [selectedStyle, setSelectedStyle] = useState(defaultContent.style || 'simple')
    const [bgColor, setBgColor] = useState(defaultContent.bgColor || '#ffffff')
    const [fontSize, setFontSize] = useState(defaultContent.fontSize || "xl")
    const [align, setAlign] = useState(defaultContent.align || "center")
    const [isPending, startTransition] = useTransition()

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

        onUpdate(block.id, { content })
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
            } else if (onAdd) {
                await onAdd(content)
                setText("")
            } else {
                await addMoodBlock('text', content, { x: 50, y: 50 })
                setText("")
            }
        })
    }

    return (
        <div className={cn(
            "space-y-6 transition-all duration-500",
            highlight ? "border-2 border-black dark:border-white p-6 -m-6 bg-zinc-50 dark:bg-zinc-900/50" : ""
        )}>
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <Type className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.text.title')}</h3>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 space-y-4 p-0 bg-white dark:bg-zinc-950">
                <Textarea
                    placeholder={t('editors.text.placeholder')}
                    value={text}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                    className="min-h-[140px] bg-transparent border-none rounded-none text-base font-mono resize-none placeholder:opacity-30 p-5 focus-visible:ring-0"
                />

                <div className="space-y-6 p-5 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.text.substrate')}</Label>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                            {TEXT_STYLES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedStyle(s.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-4 border transition-all min-w-[100px] snap-start shrink-0 group relative",
                                        selectedStyle === s.id
                                            ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <div className={cn("w-full h-8 flex items-center justify-center border border-current opacity-20", s.bg)}>
                                        <div className={cn("w-full h-full flex flex-col p-1 gap-1", s.id === 'ripped' ? "bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]" : "")}>
                                            <div className="h-0.5 w-2/3 bg-current opacity-20" />
                                            <div className="h-0.5 w-full bg-current opacity-20" />
                                        </div>
                                    </div>
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em]">
                                        {/* @ts-ignore */}
                                        {t(`editors.text.styles.${s.id}`)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.text.node_color')}</Label>
                            <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900">
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setBgColor(c)}
                                        className={cn(
                                            "w-8 h-8 border border-zinc-200 dark:border-zinc-800 transition-all",
                                            bgColor === c ? "ring-1 ring-black dark:ring-white ring-offset-2 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-3">
                                <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.text.font_scale')}</Label>
                                <div className="flex border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                    {['sm', 'xl', '3xl'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setFontSize(s)}
                                            className={cn(
                                                "flex-1 h-10 text-[8px] font-black uppercase tracking-widest transition-all border-r last:border-r-0 border-zinc-100 dark:border-zinc-900",
                                                fontSize === s ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                            )}
                                        >
                                            {s === 'sm' ? 'S' : s === 'xl' ? 'M' : 'L'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.text.alignment')}</Label>
                                <div className="flex border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                    <button onClick={() => setAlign("left")} className={cn("flex-1 h-10 flex items-center justify-center transition-all border-r border-zinc-100 dark:border-zinc-900", align === "left" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900")}><AlignLeft className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setAlign("center")} className={cn("flex-1 h-10 flex items-center justify-center transition-all border-r border-zinc-100 dark:border-zinc-900", align === "center" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900")}><AlignCenter className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setAlign("right")} className={cn("flex-1 h-10 flex items-center justify-center transition-all", align === "right" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900")}><AlignRight className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleAddText}
                        disabled={isPending || !text.trim()}
                        className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-14 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all border border-black dark:border-white"
                    >
                        {t('editors.text.deploy')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
