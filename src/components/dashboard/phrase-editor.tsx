"use client"

import { useState, useTransition, useEffect } from "react"
import { addMoodBlock, updateMoodBlockLayout } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Type, Play, Quote, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

const PHRASE_STYLES = [
    {
        id: 'ticker',
        label: 'Letreiro',
        icon: Play,
        description: 'Loop infinito horizontal',
        example: 'Novidades chegando por aqui...',
        styles: ['classic', 'neon', 'glass']
    },
    {
        id: 'subtitle',
        label: 'Legenda Cine',
        icon: Quote,
        description: 'Efeito Typewriter suave',
        example: 'O mundo gira em volta de quem sonha.',
        styles: ['vhs', 'minimal', 'modern']
    },
    {
        id: 'floating',
        label: 'Texto Livre',
        icon: Plus,
        description: 'Alguma ideia solta no mural...',
        example: 'Alguma ideia solta no mural...',
        styles: ['clean', 'focus', 'ghost']
    }
]

const COLORS = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Neon Pink', value: '#ff00ff' },
    { name: 'Cyber Blue', value: '#00ffff' },
    { name: 'Vintage Gold', value: '#d4af37' },
    { name: 'Red', value: '#ff0000' },
]

export function PhraseEditor({
    block,
    onUpdate,
    onAdd,
    highlight
}: {
    block?: any,
    onUpdate?: (id: string, content: any) => void,
    onAdd?: (type: string, content: any) => Promise<void>,
    highlight?: boolean
}) {
    const { t } = useTranslation()
    const defaultContent = block?.content || {}
    const defaultType = block && ['ticker', 'subtitle', 'floating'].includes(block.type) ? block.type : 'ticker'
    const [selectedType, setSelectedType] = useState(defaultType)
    const [text, setText] = useState(defaultContent.text || "")
    const [textColor, setTextColor] = useState(defaultContent.textColor || '#ffffff')
    const [bgColor, setBgColor] = useState(defaultContent.bgColor || '#000000')

    let defaultSpeed = 20
    if (defaultType === 'subtitle') defaultSpeed = 10
    if (defaultType === 'floating') defaultSpeed = 3
    const [speed, setSpeed] = useState(defaultContent.speed || defaultSpeed)

    const [direction, setDirection] = useState<'left' | 'right'>(defaultContent.direction || 'left')
    const [cursorType, setCursorType] = useState(defaultContent.cursorType || 'block')
    const [activeStyle, setActiveStyle] = useState(defaultContent.style || 'classic')
    const [isPending, startTransition] = useTransition()

    // 2. Real-time Preview logic
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const content = {
            text: text,
            textColor,
            bgColor,
            speed: selectedType === 'ticker' ? speed : (selectedType === 'floating' ? speed : (speed / 5)),
            style: activeStyle,
            direction: selectedType === 'ticker' ? direction : undefined,
            cursorType: selectedType === 'subtitle' ? cursorType : undefined
        }

        onUpdate(block.id, { content })
    }, [text, textColor, bgColor, speed, direction, cursorType, activeStyle])

    // 3. Debounced Silent Save
    useEffect(() => {
        if (!block?.id || !text) return

        const timer = setTimeout(async () => {
            const content = {
                text: text,
                textColor,
                bgColor,
                speed: selectedType === 'ticker' ? speed : (selectedType === 'floating' ? speed : (speed / 5)),
                style: activeStyle,
                direction: selectedType === 'ticker' ? direction : undefined,
                cursorType: selectedType === 'subtitle' ? cursorType : undefined
            }
            await updateMoodBlockLayout(block.id, { content })
        }, 800) // 800ms debounce

        return () => clearTimeout(timer)
    }, [text, textColor, bgColor, speed, direction, cursorType, activeStyle, block?.id])

    const handleAction = () => {
        if (!text) return

        startTransition(async () => {
            const content = {
                text: text,
                textColor,
                bgColor,
                speed: selectedType === 'ticker' ? speed : (selectedType === 'floating' ? speed : (speed / 5)),
                style: activeStyle,
                direction: selectedType === 'ticker' ? direction : undefined,
                cursorType: selectedType === 'subtitle' ? cursorType : undefined
            }

            if (block?.id) {
                await updateMoodBlockLayout(block.id, { content })
            } else if (onAdd) {
                await onAdd(selectedType, content)
                setText("")
            } else {
                await addMoodBlock(selectedType, content, { x: 30, y: 70 })
                setText("")
            }
        })
    }

    const currentConfig = PHRASE_STYLES.find(t => t.id === selectedType)

    return (
        <div className={cn(
            "space-y-6 transition-all duration-500",
            highlight ? "border-2 border-black dark:border-white p-6 -m-6 bg-zinc-50 dark:bg-zinc-900/50" : ""
        )}>
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <Type className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.phrase.title')}</h3>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 space-y-6 p-0 bg-white dark:bg-zinc-950">
                {/* Type Selection */}
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 text-center">{t('editors.phrase.protocol_type')}</p>
                    <div className="grid grid-cols-3 border border-zinc-200 dark:border-zinc-800">
                        {PHRASE_STYLES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setSelectedType(t.id)
                                    setActiveStyle(t.styles[0])
                                    setSpeed(t.id === 'ticker' ? 20 : (t.id === 'floating' ? 3 : 10))
                                }}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-4 border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 transition-all",
                                    selectedType === t.id
                                        ? "bg-black text-white dark:bg-white dark:text-black"
                                        : "bg-white dark:bg-zinc-950 opacity-60 hover:opacity-100"
                                )}
                            >
                                <t.icon className="w-4 h-4" />
                                <span className="text-[7px] font-black uppercase tracking-[0.2em]">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-0">
                    <textarea
                        placeholder={t('editors.phrase.placeholder')}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full min-h-[90px] p-5 text-sm font-mono bg-transparent border-none focus:ring-0 outline-none resize-none placeholder:opacity-30"
                    />
                </div>

                <div className="space-y-6 p-5 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="space-y-3">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em]">{t('editors.phrase.aura_style')}</p>
                        <div className="grid grid-cols-3 border border-zinc-200 dark:border-zinc-800">
                            {currentConfig?.styles.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setActiveStyle(s)}
                                    className={cn(
                                        "h-10 text-[8px] font-black uppercase tracking-widest transition-all border-r last:border-r-0 border-zinc-100 dark:border-zinc-900",
                                        activeStyle === s
                                            ? "bg-black text-white dark:bg-white dark:text-black"
                                            : "bg-white dark:bg-zinc-950 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid grid-cols-1 gap-5">
                            {selectedType === 'ticker' && (
                                <div className="space-y-3">
                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em]">{t('editors.phrase.flow')}</p>
                                    <div className="flex border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                        <button
                                            onClick={() => setDirection('left')}
                                            className={cn("flex-1 h-10 text-[8px] font-black uppercase tracking-widest transition-all border-r border-zinc-100 dark:border-zinc-900", direction === 'left' ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400")}
                                        >{t('editors.phrase.left')}</button>
                                        <button
                                            onClick={() => setDirection('right')}
                                            className={cn("flex-1 h-10 text-[8px] font-black uppercase tracking-widest transition-all", direction === 'right' ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400")}
                                        >{t('editors.phrase.right')}</button>
                                    </div>
                                </div>
                            )}
                            {selectedType === 'subtitle' && (
                                <div className="space-y-3">
                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em]">{t('editors.phrase.cursor')}</p>
                                    <div className="flex border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                        {['block', 'bar', 'underline'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setCursorType(c)}
                                                className={cn("flex-1 h-10 text-[8px] font-black uppercase tracking-widest transition-all border-r last:border-r-0 border-zinc-100 dark:border-zinc-900", cursorType === c ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400")}
                                            >{c}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em]">{t('editors.phrase.text_color')}</p>
                            <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900">
                                {COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        onClick={() => setTextColor(c.value)}
                                        className={cn(
                                            "w-6 h-6 border border-zinc-200 dark:border-zinc-800 transition-all",
                                            textColor === c.value ? "ring-1 ring-black dark:ring-white scale-110" : "opacity-80"
                                        )}
                                        style={{ backgroundColor: c.value }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em]">{t('editors.phrase.bg_color')}</p>
                            <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900">
                                {COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        onClick={() => setBgColor(c.value)}
                                        className={cn(
                                            "w-6 h-6 border border-zinc-200 dark:border-zinc-800 transition-all",
                                            bgColor === c.value ? "ring-1 ring-black dark:ring-white scale-110" : "opacity-80"
                                        )}
                                        style={{ backgroundColor: c.value }}
                                    />
                                ))}
                                <button
                                    onClick={() => setBgColor('transparent')}
                                    className={cn(
                                        "w-6 h-6 border border-zinc-200 dark:border-zinc-700 transition-all relative overflow-hidden",
                                        bgColor === 'transparent' ? "ring-1 ring-black dark:ring-white scale-110" : "opacity-80"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-white dark:bg-zinc-900" />
                                    <div className="absolute inset-0 border-t border-red-500 rotate-45 transform origin-center scale-150" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between px-1">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em]">{t('editors.phrase.speed')}</p>
                            <span className="text-[8px] font-mono text-zinc-500">{speed}s</span>
                        </div>
                        <input
                            type="range"
                            min={selectedType === 'ticker' ? "5" : "1"}
                            max={selectedType === 'ticker' ? "50" : "20"}
                            step="1"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-none appearance-none cursor-pointer accent-black dark:accent-white"
                        />
                    </div>

                    <Button
                        onClick={handleAction}
                        disabled={isPending || !text}
                        className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-14 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all border border-black dark:border-white"
                    >
                        {t('editors.phrase.deploy')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
