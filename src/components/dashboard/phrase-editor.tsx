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
            "space-y-6 transition-all duration-500 rounded-3xl",
            highlight ? "ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 p-6 -m-6" : ""
        )}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <Type className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Diário Vivo</h3>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-6">
                {/* Type Selection */}
                <div className="flex gap-2 overflow-x-auto pb-4 pt-1 -mx-1 px-1 custom-scrollbar snap-x">
                    {PHRASE_STYLES.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setSelectedType(t.id)
                                setActiveStyle(t.styles[0])
                                setSpeed(t.id === 'ticker' ? 20 : (t.id === 'floating' ? 3 : 10))
                            }}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all min-w-[90px] snap-start shrink-0",
                                selectedType === t.id
                                    ? "bg-white dark:bg-zinc-800 border-black dark:border-white shadow-md scale-[1.05]"
                                    : "bg-transparent border-transparent opacity-50 hover:opacity-100"
                            )}
                        >
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                <t.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">{t.label}</span>
                        </button>
                    ))}
                </div>

                {/* Text Input */}
                <div className="space-y-2">
                    <textarea
                        placeholder={currentConfig?.example}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full min-h-[80px] p-4 text-xs bg-white dark:bg-zinc-900 border-none rounded-2xl focus:ring-1 focus:ring-zinc-200 outline-none resize-none shadow-inner"
                    />
                </div>

                {/* Advanced Controls */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Vibe Visual</p>
                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar snap-x">
                            {currentConfig?.styles.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setActiveStyle(s)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all snap-start shrink-0 border-2",
                                        activeStyle === s
                                            ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md"
                                            : "bg-white dark:bg-zinc-800 text-zinc-400 border-transparent hover:border-zinc-200"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {selectedType === 'ticker' && (
                            <div className="col-span-2 space-y-2">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Direção</p>
                                <div className="flex gap-2 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    <button
                                        onClick={() => setDirection('left')}
                                        className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all", direction === 'left' ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-sm" : "text-zinc-400")}
                                    >Esquerda</button>
                                    <button
                                        onClick={() => setDirection('right')}
                                        className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all", direction === 'right' ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-sm" : "text-zinc-400")}
                                    >Direita</button>
                                </div>
                            </div>
                        )}
                        {selectedType === 'subtitle' && (
                            <div className="col-span-2 space-y-2">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Estilo do Cursor</p>
                                <div className="flex gap-2 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    {['block', 'bar', 'underline'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCursorType(c)}
                                            className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all", cursorType === c ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-sm" : "text-zinc-400")}
                                        >{c}</button>
                                    ))}
                                </div>
                            </div>
                        )}
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
                    className="w-full bg-black dark:bg-white text-white dark:text-black rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {block?.id ? 'Atualizar Frase' : 'Adicionar ao Mural'}
                </Button>
            </div>
        </div>
    )
}
