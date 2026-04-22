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

import { EditorHeader, EditorSection, PillSelector, GridSelector, EditorActionButton, EditorSlider, EditorSwitch, ListSelector } from "./EditorUI"

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
    const triggerUpdate = (updates: any) => {
        if (!block?.id || !onUpdate) return

        const currentContent = {
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
            icon: statusIcon,
            ...updates
        }

        const typeToSave = ['ticker', 'subtitle', 'floating', 'quote', 'mood-status', 'moodStatus'].includes(block.type)
            ? 'text'
            : block.type

        onUpdate(block.id, {
            type: typeToSave,
            content: currentContent
        })
    }

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
                <GridSelector
                    id="text-behavior"
                    options={BEHAVIORS}
                    activeId={behavior}
                    columns={6}
                    variant="ghost"
                    onChange={(id) => {
                        const newBehavior = id as TextBehavior
                        setBehavior(newBehavior)
                        
                        let extraUpdates: any = { behavior: newBehavior }
                        
                        if (newBehavior === 'ticker') {
                            setFontSize('3xl')
                            extraUpdates.fontSize = '3xl'
                            if (speed < 1) {
                                setSpeed(20)
                                extraUpdates.speed = 20
                            }
                        } else if (newBehavior === 'floating') {
                            if (speed < 0.5) {
                                setSpeed(4)
                                extraUpdates.speed = 4
                            }
                        } else if (newBehavior === 'typewriter') {
                            if (speed > 1) {
                                setSpeed(0.05)
                                extraUpdates.speed = 0.05
                            }
                        }
                        
                        if (newBehavior === 'status' && frame === 'none') {
                            setFrame('minimal')
                            extraUpdates.frame = 'minimal'
                        }
                        
                        triggerUpdate(extraUpdates)
                    }}
                />
            </EditorSection>

            <EditorSection title="Conteúdo">
                <div className="relative group">
                    <Textarea
                        placeholder={t('editors.text.placeholder')}
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value)
                            triggerUpdate({ text: e.target.value })
                        }}
                        className="min-h-[140px] bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-3xl text-[14px] font-medium resize-none p-6 focus-visible:ring-blue-500/10 shadow-inner transition-all placeholder:text-zinc-400"
                    />
                </div>
            </EditorSection>

            <EditorSection title="Estética">
                <div className="space-y-6">
                    <EditorSection title="Moldura">
                        <ListSelector
                            id="text-frame"
                            options={FRAME_OPTIONS.map(f => ({ id: f.id as string, label: f.label }))}
                            activeId={frame as string}
                            onChange={(id) => {
                                setFrame(id as any)
                                triggerUpdate({ frame: id as any })
                            }}
                        />
                    </EditorSection>

                    <div className="grid grid-cols-2 gap-6">
                        {(behavior === 'static' || behavior === 'floating') && (
                            <>
                                <EditorSection title={t('editors.text.font_scale')}>
                                    <PillSelector
                                        variant="ghost"
                                        options={[
                                            { id: 'sm', label: 'P' },
                                            { id: 'base', label: 'M' },
                                            { id: 'xl', label: 'G' },
                                            { id: '3xl', label: 'GG' },
                                        ]}
                                        activeId={fontSize as string}
                                        onChange={(id) => {
                                            setFontSize(id as any)
                                            triggerUpdate({ fontSize: id as any })
                                        }}
                                    />
                                </EditorSection>
                                <EditorSection title={t('editors.text.alignment')}>
                                    <GridSelector
                                        id="text-align"
                                        options={[
                                            { id: 'left', label: 'Esquerda', icon: AlignLeft },
                                            { id: 'center', label: 'Centro', icon: AlignCenter },
                                            { id: 'right', label: 'Direita', icon: AlignRight },
                                        ]}
                                        activeId={align as string}
                                        variant="ghost"
                                        columns={3}
                                        onChange={(id) => {
                                            setAlign(id as any)
                                            triggerUpdate({ align: id as any })
                                        }}
                                    />
                                </EditorSection>
                            </>
                        )}

                        {behavior === 'ticker' && (
                            <>
                                <EditorSection title="Direção">
                                    <PillSelector
                                        options={[
                                            { id: 'left', label: 'Esquerda' },
                                            { id: 'right', label: 'Direita' },
                                        ]}
                                        activeId={direction as string}
                                        onChange={(id) => {
                                            setDirection(id as any)
                                            triggerUpdate({ direction: id as any })
                                        }}
                                    />
                                </EditorSection>
                                <EditorSlider
                                    label="Velocidade"
                                    value={speed}
                                    min={5}
                                    max={50}
                                    onChange={(v) => {
                                        setSpeed(v)
                                        triggerUpdate({ speed: v })
                                    }}
                                />
                            </>
                        )}

                        {behavior === 'quote' && (
                            <div className="col-span-2 space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        value={author}
                                        onChange={(e) => {
                                            setAuthor(e.target.value)
                                            triggerUpdate({ author: e.target.value })
                                        }}
                                        placeholder={t('editors.text.author_placeholder')}
                                        className="w-full h-14 bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl pl-12 text-[12px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm placeholder:text-zinc-400"
                                    />
                                </div>
                            </div>
                        )}

                        {behavior === 'status' && (
                            <div className="col-span-2">
                                <GridSelector
                                    options={STATUS_ICONS.map(s => ({ id: s.id as any, label: '', icon: s.icon }))}
                                    activeId={statusIcon as any}
                                    onChange={(id) => {
                                        setStatusIcon(id)
                                        triggerUpdate({ icon: id })
                                    }}
                                    columns={5}
                                    variant="card"
                                />
                            </div>
                        )}
                    </div>

                    <EditorSection title="Cor do Texto">
                        <GridSelector
                            options={COLORS.map(c => ({ id: c.value as any, label: '', icon: undefined, color: c.value || '#ccc' }))}
                            activeId={textColor as any}
                            onChange={(id) => {
                                setTextColor(id)
                                triggerUpdate({ textColor: id })
                            }}
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
