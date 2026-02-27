"use client"

import { useState, useTransition, useEffect } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Type, Play, Quote, Plus, AlignLeft, AlignCenter, AlignRight, User,
    Smile, Meh, Frown, Sparkles, Flame, Coffee, PartyPopper, Moon, Heart, Ghost, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { Textarea } from "@/components/ui/textarea"
import { FrameType, FrameContainer } from "./FrameContainer"
import { SmartText, TextBehavior } from "./SmartText"

const BEHAVIORS: { id: TextBehavior; label: string; icon: any }[] = [
    { id: 'static', label: 'Estático', icon: Type },
    { id: 'ticker', label: 'Letreiro', icon: Play },
    { id: 'typewriter', label: 'Legenda', icon: Quote },
    { id: 'floating', label: 'Flutuante', icon: Plus },
    { id: 'quote', label: 'Citação', icon: Quote },
    { id: 'status', label: 'Status', icon: Smile },
]

const STATUS_ICONS = [
    { id: 'Smile', icon: Smile },
    { id: 'Meh', icon: Meh },
    { id: 'Frown', icon: Frown },
    { id: 'Sparkles', icon: Sparkles },
    { id: 'Flame', icon: Flame },
    { id: 'Coffee', icon: Coffee },
    { id: 'PartyPopper', icon: PartyPopper },
    { id: 'Moon', icon: Moon },
    { id: 'Heart', icon: Heart },
    { id: 'Ghost', icon: Ghost },
]

const FRAMES: { id: FrameType; label: string }[] = [
    { id: 'none', label: 'Nenhum' },
    { id: 'polaroid', label: 'Polaroid' },
    { id: 'polaroid-dark', label: 'Black Polaroid' },
    { id: 'frame', label: 'Moldura' },
    { id: 'minimal', label: 'Minimalist' },
    { id: 'glass', label: 'Glass' },
    { id: 'round', label: 'Círculo' },
]

const COLORS = [
    { name: 'Default', value: '' },
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Post-it', value: '#ffff88' },
    { name: 'Neon Pink', value: '#ff00ff' },
    { name: 'Cyber Blue', value: '#00ffff' },
    { name: 'Red', value: '#ff0000' },
]

import { MoodBlock, TextContent } from "@/types/database"

interface UniversalTextEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (type: string, content: TextContent) => Promise<void>
    onClose?: () => void
    highlight?: boolean
}

export function UniversalTextEditor({
    block,
    onUpdate,
    onAdd,
    onClose,
    highlight
}: UniversalTextEditorProps) {
    const { t } = useTranslation()
    const content = block?.content || {}

    // Determine initial behavior based on legacy block type or stored behavior
    const initialBehavior: TextBehavior = content.behavior ||
        (block?.type === 'ticker' ? 'ticker' :
            block?.type === 'subtitle' ? 'typewriter' :
                block?.type === 'floating' ? 'floating' : 'static')

    const [text, setText] = useState(content.text || "")
    const [behavior, setBehavior] = useState<TextBehavior>(initialBehavior)
    const [frame, setFrame] = useState<FrameType>(content.frame || (content.style === 'simple' ? 'none' : content.style as any) || 'none')
    const [textColor, setTextColor] = useState(content.textColor || '')
    const [fontSize, setFontSize] = useState(content.fontSize || 'xl')
    const [align, setAlign] = useState(content.align || 'center')
    const [speed, setSpeed] = useState(content.speed || (initialBehavior === 'ticker' ? 20 : 0.05))
    const [direction, setDirection] = useState<'left' | 'right'>(content.direction || 'left')
    const [cursorType, setCursorType] = useState(content.cursorType || 'block')

    // New Universal Fields
    const [author, setAuthor] = useState(content.author || "")
    const [showQuotes, setShowQuotes] = useState(content.showQuotes !== false)
    const [statusIcon, setStatusIcon] = useState(content.icon || "Smile")

    const [isPending, startTransition] = useTransition()

    // Real-time Preview
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const updates = {
            text,
            behavior,
            frame,
            textColor,
            fontSize,
            align,
            speed,
            direction,
            cursorType,
            author,
            showQuotes,
            icon: statusIcon
        }

        // Ghost Migration: If editing a legacy block type, migrate it to 'text' type silently
        const typeToSave = ['ticker', 'subtitle', 'floating', 'quote', 'mood-status', 'moodStatus'].includes(block.type)
            ? 'text'
            : block.type

        onUpdate(block.id, {
            type: typeToSave,
            content: updates
        })
    }, [text, behavior, frame, textColor, fontSize, align, speed, direction, cursorType, author, showQuotes, statusIcon])

    const handleSave = () => {
        if (!text.trim() && !block?.id) return

        startTransition(async () => {
            const finalContent = {
                text: text.trim(),
                behavior,
                frame,
                textColor,
                fontSize,
                align,
                speed,
                direction,
                cursorType,
                author,
                showQuotes,
                icon: statusIcon
            }

            if (block?.id) {
                if (onClose) onClose()
            } else if (onAdd) {
                await onAdd('text', finalContent)
                setText("")
            } else {
                await addMoodBlock('text', finalContent, { x: 40, y: 40 })
                setText("")
            }
        })
    }

    return (
        <div className={cn(
            "space-y-6 transition-all duration-500",
            highlight ? "border-2 border-black dark:border-white p-6 -m-6 bg-zinc-50 dark:bg-zinc-900/50" : ""
        )}>
            <header className="flex items-center gap-2 opacity-30 px-1 mb-2">
                <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
                <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('editors.text.universal_title') || 'Universal Text Editor'}</h3>
            </header>

            <div className="border border-zinc-200 dark:border-zinc-800 space-y-0 bg-white dark:bg-zinc-950">
                {/* Behavior Selector */}
                <div className="grid grid-cols-6 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border-b border-zinc-200 dark:border-zinc-800">
                    {BEHAVIORS.map((b) => (
                        <button
                            key={b.id}
                            onClick={() => {
                                setBehavior(b.id)
                                if (b.id === 'ticker') setFontSize('3xl')
                                if (b.id === 'status' && frame === 'none') setFrame('minimal')
                            }}
                            className={cn(
                                "flex flex-col items-center justify-center py-4 gap-2 transition-all relative group",
                                behavior === b.id
                                    ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                        >
                            {behavior === b.id && (
                                <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                            )}
                            <b.icon className={cn("w-3.5 h-3.5 transition-transform", behavior === b.id && "scale-110")} />
                            <span className="text-[5.5px] font-black uppercase tracking-tighter">{b.label}</span>
                        </button>
                    ))}
                </div>

                <Textarea
                    placeholder={t('editors.text.placeholder')}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[120px] bg-transparent border-none rounded-none text-base font-mono resize-none p-5 focus-visible:ring-0"
                />

                <div className="p-5 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-6">
                    {/* Frame Selector */}
                    <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Moldura / Estilo</Label>
                        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar snap-x px-1">
                            {FRAMES.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFrame(f.id)}
                                    className={cn(
                                        "px-4 py-2 border text-[8px] font-black uppercase tracking-widest snap-start shrink-0 transition-all relative",
                                        frame === f.id
                                            ? "border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white"
                                            : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-400 opacity-60 hover:opacity-100"
                                    )}
                                >
                                    {frame === f.id && (
                                        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                                    )}
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Font Size & Align for Static/Floating */}
                        {(behavior === 'static' || behavior === 'floating') && (
                            <>
                                <div className="space-y-3">
                                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.text.font_scale')}</Label>
                                    <div className="flex border border-zinc-200 dark:border-zinc-800">
                                        {['sm', 'xl', '3xl'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setFontSize(s as any)}
                                                className={cn(
                                                    "flex-1 h-10 text-[8px] font-black uppercase tracking-widest transition-all border-r last:border-r-0 border-zinc-100 dark:border-zinc-900",
                                                    fontSize === s ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400"
                                                )}
                                            >
                                                {s === 'sm' ? 'S' : s === 'xl' ? 'M' : 'L'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.text.alignment')}</Label>
                                    <div className="flex border border-zinc-200 dark:border-zinc-800">
                                        <button onClick={() => setAlign("left")} className={cn("flex-1 h-10 flex items-center justify-center border-r border-zinc-100 dark:border-zinc-900", align === "left" ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400")}><AlignLeft className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => setAlign("center")} className={cn("flex-1 h-10 flex items-center justify-center border-r border-zinc-100 dark:border-zinc-900", align === "center" ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400")}><AlignCenter className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => setAlign("right")} className={cn("flex-1 h-10 flex items-center justify-center", align === "right" ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400")}><AlignRight className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Ticker Specifics */}
                        {behavior === 'ticker' && (
                            <>
                                <div className="space-y-3">
                                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Direção</Label>
                                    <div className="flex border border-zinc-200 dark:border-zinc-800">
                                        <button onClick={() => setDirection('left')} className={cn("flex-1 h-10 text-[8px] font-black uppercase transition-all border-r border-zinc-100 dark:border-zinc-900", direction === 'left' ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400")}>Esquerda</button>
                                        <button onClick={() => setDirection('right')} className={cn("flex-1 h-10 text-[8px] font-black uppercase transition-all", direction === 'right' ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400")}>Direita</button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Velocidade ({speed}s)</Label>
                                    <input type="range" min="5" max="50" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 accent-black dark:accent-white appearance-none cursor-pointer" />
                                </div>
                            </>
                        )}

                        {/* Typewriter Specifics */}
                        {behavior === 'typewriter' && (
                            <>
                                <div className="space-y-3">
                                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Cursor</Label>
                                    <div className="flex border border-zinc-200 dark:border-zinc-800">
                                        {['block', 'bar', 'underline'].map(c => (
                                            <button key={c} onClick={() => setCursorType(c as any)} className={cn("flex-1 h-10 text-[7px] font-black uppercase transition-all border-r last:border-r-0 border-zinc-100 dark:border-zinc-900", cursorType === c ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400")}>{c}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Velocidade</Label>
                                    <input type="range" min="0.01" max="0.2" step="0.01" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 accent-black dark:accent-white appearance-none cursor-pointer" />
                                </div>
                            </>
                        )}

                        {/* Quote Specifics */}
                        {behavior === 'quote' && (
                            <>
                                <div className="space-y-3">
                                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Autor</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                        <input
                                            value={author}
                                            onChange={(e) => setAuthor(e.target.value)}
                                            placeholder="Desconhecido"
                                            className="w-full h-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 pl-10 text-[10px] font-black uppercase tracking-widest focus:ring-0 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Aspas</Label>
                                    <button
                                        onClick={() => setShowQuotes(!showQuotes)}
                                        className={cn(
                                            "w-full h-10 text-[8px] font-black uppercase transition-all border",
                                            showQuotes ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "text-zinc-400 border-zinc-200 dark:border-zinc-800"
                                        )}
                                    >
                                        {showQuotes ? 'Exibir Aspas' : 'Ocultar Aspas'}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Status Specifics */}
                        {behavior === 'status' && (
                            <div className="col-span-2 space-y-3">
                                <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Vibe / Ícone</Label>
                                <div className="grid grid-cols-5 border border-zinc-200 dark:border-zinc-800">
                                    {STATUS_ICONS.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setStatusIcon(s.id)}
                                            className={cn(
                                                "aspect-square flex items-center justify-center border-r last:border-r-0 border-zinc-100 dark:border-zinc-900 transition-all",
                                                statusIcon === s.id
                                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                                    : "bg-white dark:bg-zinc-950 text-zinc-400 hover:text-black dark:hover:text-white"
                                            )}
                                        >
                                            <s.icon className="w-4 h-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Color Selector */}
                    <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Cor do Texto</Label>
                        <div className="grid grid-cols-7 gap-px bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900">
                            {COLORS.map(c => (
                                <button
                                    key={c.value}
                                    onClick={() => setTextColor(c.value)}
                                    className={cn(
                                        "aspect-square flex items-center justify-center transition-all relative overflow-hidden bg-white dark:bg-zinc-950",
                                        textColor === c.value ? "ring-inset ring-1 ring-black dark:ring-white z-10" : "opacity-80 hover:opacity-100"
                                    )}
                                >
                                    <div
                                        className="w-4 h-4 shadow-sm border border-black/5"
                                        style={{ backgroundColor: c.value || 'transparent' }}
                                    >
                                        {!c.value && <div className="absolute inset-0 bg-transparent border-t border-red-500/50 rotate-45 transform origin-center scale-150" />}
                                    </div>
                                    {textColor === c.value && (
                                        <div className="absolute bottom-0 right-0 w-1 h-1 bg-black dark:bg-white" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isPending || (!text.trim() && !block?.id)}
                        className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-none font-black uppercase tracking-[0.4em] text-[10px] transition-all border border-black dark:border-white relative group"
                    >
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-30 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-30 group-hover:opacity-100 transition-opacity" />
                        {isPending ? t('common.loading') : (block?.id ? t('common.close') : t('editors.text.deploy'))}
                    </Button>
                </div>
            </div>
        </div>
    )
}
