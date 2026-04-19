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
import { FRAME_OPTIONS } from "@/lib/editor-constants"

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

import { EditorHeader, EditorSection, PillSelector, GridSelector, EditorActionButton, EditorSlider, EditorSwitch } from "./EditorUI"

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
    const [frame, setFrame] = useState<FrameType>(
        content.frame || 
        (content.style === 'simple' ? 'none' : content.style as any) || 
        (['ticker', 'subtitle', 'floating'].includes(block?.type || '') ? 'minimal' : 'none')
    )
    const [textColor, setTextColor] = useState(content.textColor || '')
    const [fontSize, setFontSize] = useState(content.fontSize || 'base')
    const [align, setAlign] = useState(content.align || 'center')
    const [speed, setSpeed] = useState(content.speed || (initialBehavior === 'ticker' ? 20 : 0.05))
    const [direction, setDirection] = useState<'left' | 'right'>(content.direction || 'left')
    const [cursorType, setCursorType] = useState(content.cursorType || 'block')

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
            "space-y-12 pb-20",
            highlight ? "p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800" : ""
        )}>
            <EditorHeader 
                title={block ? t('editors.text.edit_title') : t('editors.text.add_title')}
                subtitle={t('editors.text.subtitle')}
            />

            <EditorSection title="Comportamento">
                <PillSelector
                    options={BEHAVIORS}
                    activeId={behavior}
                    columns={3}
                    onChange={(id) => {
                        setBehavior(id)
                        if (id === 'ticker') {
                            setFontSize('3xl')
                            if (speed < 1) setSpeed(20)
                        }
                        if (id === 'floating') {
                            if (speed < 0.5) setSpeed(4)
                        }
                        if (id === 'typewriter') {
                            if (speed > 1) setSpeed(0.05)
                        }
                        if (id === 'status' && frame === 'none') setFrame('minimal')
                    }}
                />
            </EditorSection>

            <EditorSection title="Conteúdo">
                <div className="relative group">
                    <Textarea
                        placeholder={t('editors.text.placeholder')}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[140px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-base font-medium resize-none p-5 focus-visible:ring-blue-500/20 shadow-sm transition-all"
                    />
                </div>
            </EditorSection>

            <EditorSection title="Estética">
                <div className="space-y-6">
                    <EditorSection title="Moldura">
                        <PillSelector
                            variant="scroll"
                            options={FRAME_OPTIONS.map(f => ({ id: f.id as any, label: f.label }))}
                            activeId={frame as any}
                            onChange={(id) => setFrame(id as any)}
                        />
                    </EditorSection>

                    <div className="grid grid-cols-2 gap-6">
                        {(behavior === 'static' || behavior === 'floating') && (
                            <>
                                <EditorSection title={t('editors.text.font_scale')}>
                                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                                        {['sm', 'base', 'xl', '3xl'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setFontSize(s as any)}
                                                className={cn(
                                                    "flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                                    fontSize === s ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                                )}
                                            >
                                                {s === 'sm' ? 'P' : s === 'base' ? 'M' : s === 'xl' ? 'G' : 'GG'}
                                            </button>
                                        ))}
                                    </div>
                                </EditorSection>
                                <EditorSection title={t('editors.text.alignment')}>
                                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                                        <button onClick={() => setAlign("left")} className={cn("flex-1 h-9 rounded-lg flex items-center justify-center transition-all", align === "left" ? "bg-white dark:bg-zinc-800 text-blue-600" : "text-zinc-400")}><AlignLeft className="w-4 h-4" /></button>
                                        <button onClick={() => setAlign("center")} className={cn("flex-1 h-9 rounded-lg flex items-center justify-center transition-all", align === "center" ? "bg-white dark:bg-zinc-800 text-blue-600" : "text-zinc-400")}><AlignCenter className="w-4 h-4" /></button>
                                        <button onClick={() => setAlign("right")} className={cn("flex-1 h-9 rounded-lg flex items-center justify-center transition-all", align === "right" ? "bg-white dark:bg-zinc-800 text-blue-600" : "text-zinc-400")}><AlignRight className="w-4 h-4" /></button>
                                    </div>
                                </EditorSection>
                            </>
                        )}

                        {behavior === 'ticker' && (
                            <>
                                <EditorSection title="Direção">
                                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                                        <button onClick={() => setDirection('left')} className={cn("flex-1 h-9 rounded-lg text-[9px] font-bold uppercase transition-all", direction === 'left' ? "bg-white dark:bg-zinc-800 text-blue-600" : "text-zinc-400")}>L</button>
                                        <button onClick={() => setDirection('right')} className={cn("flex-1 h-9 rounded-lg text-[9px] font-bold uppercase transition-all", direction === 'right' ? "bg-white dark:bg-zinc-800 text-blue-600" : "text-zinc-400")}>R</button>
                                    </div>
                                </EditorSection>
                                <EditorSlider
                                    label="Velocidade"
                                    value={speed}
                                    min={5}
                                    max={50}
                                    onChange={setSpeed}
                                />
                            </>
                        )}

                        {behavior === 'quote' && (
                            <div className="col-span-2 space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder={t('editors.text.author_placeholder')}
                                        className="w-full h-12 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl pl-12 text-base font-medium focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {behavior === 'status' && (
                            <div className="col-span-2">
                                <GridSelector
                                    options={STATUS_ICONS.map(s => ({ id: s.id as any, icon: s.icon }))}
                                    activeId={statusIcon as any}
                                    onChange={(id) => setStatusIcon(id)}
                                    columns={5}
                                    variant="card"
                                />
                            </div>
                        )}
                    </div>

                    <EditorSection title="Cor do Texto">
                        <GridSelector
                            options={COLORS.map(c => ({ id: c.value as any, color: c.value || '#ccc' }))}
                            activeId={textColor as any}
                            onChange={(id) => setTextColor(id)}
                            columns={7}
                            variant="circle"
                        />
                    </EditorSection>
                </div>
            </EditorSection>

            <EditorActionButton 
                onClick={handleSave} 
                isLoading={isPending} 
                disabled={!text.trim() && !block?.id}
                label={block?.id ? t('common.close') : t('editors.text.deploy')}
            />
        </div>
    )
}
