"use client"

import { useState, useTransition, useEffect } from "react"
import { addMoodBlock, updateMoodBlockLayout } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Type, Play, Quote, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

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
    highlight
}: {
    block?: any,
    onUpdate?: (id: string, content: any) => void,
    highlight?: boolean
}) {
    const [selectedType, setSelectedType] = useState(PHRASE_STYLES[0].id)
    const [text, setText] = useState("")
    const [textColor, setTextColor] = useState('#ffffff')
    const [bgColor, setBgColor] = useState('#000000')
    const [speed, setSpeed] = useState(20)
    const [direction, setDirection] = useState<'left' | 'right'>('left')
    const [cursorType, setCursorType] = useState('block')
    const [activeStyle, setActiveStyle] = useState('classic')
    const [isPending, startTransition] = useTransition()

    // 1. Load data if block is selected
    useEffect(() => {
        if (block && (block.type === 'ticker' || block.type === 'subtitle' || block.type === 'floating')) {
            setSelectedType(block.type)
            const content = block.content as any
            setText(content.text || "")
            setTextColor(content.textColor || "#ffffff")
            setBgColor(content.bgColor || "#000000")

            let defaultSpeed = 20
            if (block.type === 'subtitle') defaultSpeed = 10
            if (block.type === 'floating') defaultSpeed = 3

            setSpeed(content.speed || defaultSpeed)
            setActiveStyle(content.style || 'classic')
            setDirection(content.direction || 'left')
            setCursorType(content.cursorType || 'block')
        }
    }, [block?.id]) // Only reload if ID changes to prevent loops

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

        onUpdate(block.id, content)
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
            } else {
                await addMoodBlock(selectedType, content, { x: 30, y: 70 })
                setText("")
            }
        })
    }

    const currentConfig = PHRASE_STYLES.find(t => t.id === selectedType)

    return (
        <div className={cn(
            "space-y-6 transition-all duration-500 rounded-2xl",
            highlight ? "ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 p-4 -m-4" : ""
        )}>
            <header className="flex items-center gap-2">
                <Type className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Diário Vivo</h2>
            </header>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-6">
                {/* Type Selection */}
                <div className="grid grid-cols-3 gap-1">
                    {PHRASE_STYLES.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setSelectedType(t.id)
                                setActiveStyle(t.styles[0])
                                setSpeed(t.id === 'ticker' ? 20 : (t.id === 'floating' ? 3 : 10))
                            }}
                            className={cn(
                                "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all",
                                selectedType === t.id
                                    ? "bg-white dark:bg-zinc-800 border-black dark:border-white shadow-sm"
                                    : "bg-transparent border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <t.icon className="w-4 h-4" />
                            <p className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">{t.label}</p>
                        </button>
                    ))}
                </div>

                {/* Text Input */}
                <div className="space-y-2">
                    <textarea
                        placeholder={currentConfig?.example}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full min-h-[60px] p-3 text-xs bg-white dark:bg-zinc-900 border-none rounded-xl focus:ring-1 focus:ring-zinc-200 outline-none resize-none"
                    />
                </div>

                {/* Advanced Controls */}
                <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-700">
                    <div className="grid grid-cols-2 gap-2">
                        {selectedType === 'ticker' && (
                            <div className="col-span-2 space-y-2">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">Direção</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setDirection('left')}
                                        className={cn("flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg border", direction === 'left' ? "bg-black text-white" : "text-zinc-500")}
                                    >Esquerda</button>
                                    <button
                                        onClick={() => setDirection('right')}
                                        className={cn("flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg border", direction === 'right' ? "bg-black text-white" : "text-zinc-500")}
                                    >Direita</button>
                                </div>
                            </div>
                        )}
                        {selectedType === 'subtitle' && (
                            <div className="col-span-2 space-y-2">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">Cursor</p>
                                <div className="flex gap-2">
                                    {['block', 'bar', 'underline'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCursorType(c)}
                                            className={cn("flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg border", cursorType === c ? "bg-black text-white" : "text-zinc-500")}
                                        >{c}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">Vibe Visual</p>
                        <div className="flex flex-wrap gap-2">
                            {currentConfig?.styles.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setActiveStyle(s)}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all",
                                        activeStyle === s ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">Texto</p>
                            <div className="flex flex-wrap gap-1">
                                {COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        onClick={() => setTextColor(c.value)}
                                        className={cn(
                                            "w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-700 transition-transform",
                                            textColor === c.value && "scale-125 ring-1 ring-black dark:ring-white"
                                        )}
                                        style={{ backgroundColor: c.value }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">Fundo</p>
                            <div className="flex flex-wrap gap-1">
                                {COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        onClick={() => setBgColor(c.value)}
                                        className={cn(
                                            "w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-700 transition-transform",
                                            bgColor === c.value && "scale-125 ring-1 ring-black dark:ring-white"
                                        )}
                                        style={{ backgroundColor: c.value }}
                                    />
                                ))}
                                <button
                                    onClick={() => setBgColor('transparent')}
                                    className={cn(
                                        "w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-700 transition-transform relative overflow-hidden",
                                        bgColor === 'transparent' && "scale-125 ring-1 ring-black dark:ring-white"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-white dark:bg-zinc-900" />
                                    <div className="absolute inset-0 border-t border-red-500 rotate-45 translate-y-2" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between px-1">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Velocidade</p>
                            <span className="text-[9px] font-mono text-zinc-500">{speed}s</span>
                        </div>
                        <input
                            type="range"
                            min={selectedType === 'ticker' ? "5" : "1"}
                            max={selectedType === 'ticker' ? "50" : "20"}
                            step="1"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleAction}
                    disabled={isPending || !text}
                    className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:scale-[1.02] transition-transform h-10 border-none outline-none"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {block?.id ? 'Atualizar Frase' : 'Adicionar Frase'}
                </Button>
            </div>
        </div>
    )
}
