"use client"

import { useState, useTransition, useEffect } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Type, Play, Terminal, Plus, AlignLeft, AlignCenter, AlignRight, User,
    Smile, Meh, Frown, Sparkles, Flame, Coffee, PartyPopper, Moon, Heart, Ghost, Activity,
    Quote as QuoteIcon, MessageCircle, ArrowLeftRight, Bold, Italic, EyeOff, BookOpen, Clapperboard, Layers,
    Trash2, PlusCircle
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
    { id: 'typewriter', label: 'Legenda', icon: Terminal },
    { id: 'floating', label: 'Flutuante', icon: Plus },
    { id: 'quote', label: 'Citação', icon: QuoteIcon },
    { id: 'dialogue', label: 'Diálogo', icon: MessageCircle },
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
import { EditorHeader, EditorSection, PillSelector, GridSelector, EditorActionButton, EditorSlider, EditorSwitch, ListSelector } from "./EditorUI"

interface UniversalTextEditorProps {
    block?: MoodBlock | null
    onUpdate?: (updates: Partial<MoodBlock>) => void
    onAdd?: (content: TextContent) => Promise<void>
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

    // Determine initial behavior
    const initialBehavior: TextBehavior = content.behavior || 'static'

    const [text, setText] = useState(content.text || "")
    const [behavior, setBehavior] = useState<TextBehavior>(initialBehavior)
    const [frame, setFrame] = useState<FrameType>(content.frame || 'none')
    const [textColor, setTextColor] = useState(content.textColor || '')
    const [fontSize, setFontSize] = useState(content.fontSize || 'base')
    const [align, setAlign] = useState(content.align || 'center')
    const [speed, setSpeed] = useState(content.speed || (initialBehavior === 'ticker' ? 20 : 0.05))
    const [direction, setDirection] = useState<'left' | 'right'>(content.direction || 'left')
    const [cursorType, setCursorType] = useState(content.cursorType || 'block')

    const [author, setAuthor] = useState(content.author || "")
    const [showQuotes, setShowQuotes] = useState(content.showQuotes !== false)
    const [statusIcon, setStatusIcon] = useState(content.icon || "Smile")

    // Dialogue Specific States
    const [dialogueStyle, setDialogueStyle] = useState(content.dialogueStyle || 'novel')
    const [dialogueFormat, setDialogueFormat] = useState(content.dialogueFormat || 'alternating')
    const [nameStyle, setNameStyle] = useState(content.nameStyle || 'bold')
    const [dialogueLines, setDialogueLines] = useState<{name: string, text: string}[]>(
        content.dialogueLines || [{ name: '', text: '' }]
    )

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
            dialogueStyle,
            dialogueFormat,
            nameStyle,
            dialogueLines,
            ...updates
        }

        onUpdate({
            type: 'text',
            content: currentContent
        })
    }

    const addDialogueLine = () => {
        const newLines = [...dialogueLines, { name: '', text: '' }]
        setDialogueLines(newLines)
        triggerUpdate({ dialogueLines: newLines })
    }

    const updateDialogueLine = (index: number, field: 'name' | 'text', value: string) => {
        const newLines = [...dialogueLines]
        newLines[index][field] = value
        setDialogueLines(newLines)
        triggerUpdate({ dialogueLines: newLines })
    }

    const removeDialogueLine = (index: number) => {
        if (dialogueLines.length <= 1) return
        const newLines = dialogueLines.filter((_, i) => i !== index)
        setDialogueLines(newLines)
        triggerUpdate({ dialogueLines: newLines })
    }

    const handleSave = () => {
        startTransition(async () => {
            const finalContent = {
                text: behavior === 'dialogue' ? '' : text.trim(),
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
                dialogueStyle,
                dialogueFormat,
                nameStyle,
                dialogueLines
            }

            if (block?.id) {
                if (onClose) onClose()
            } else if (onAdd) {
                await onAdd(finalContent)
            } else {
                await addMoodBlock('text', finalContent, { x: 40, y: 40 })
            }
        })
    }

    return (
        <div className={cn("space-y-12 pb-24", highlight && "p-6 rounded-3xl bg-blue-50/10 border border-blue-500/10")}>
            <EditorHeader 
                title={block ? "Editar Elemento" : "Novo Elemento"}
                subtitle="Personalize a tipografia e o comportamento visual."
            />

            <EditorSection title="Comportamento">
                <GridSelector
                    id="text-behavior"
                    options={BEHAVIORS}
                    activeId={behavior}
                    columns={7}
                    variant="ghost"
                    onChange={(id) => {
                        const newBehavior = id as TextBehavior
                        setBehavior(newBehavior)
                        
                        let extraUpdates: any = { behavior: newBehavior }
                        
                        if (newBehavior === 'ticker') {
                            setFontSize('3xl')
                            extraUpdates.fontSize = '3xl'
                            setSpeed(20)
                            extraUpdates.speed = 20
                        } else if (newBehavior === 'status') {
                            setFrame('minimal')
                            extraUpdates.frame = 'minimal'
                        } else if (newBehavior === 'typewriter') {
                            if (speed > 1) {
                                setSpeed(0.05)
                                extraUpdates.speed = 0.05
                            }
                        }
                        
                        triggerUpdate(extraUpdates)
                    }}
                />
            </EditorSection>

            {behavior === 'dialogue' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <EditorSection title="Estética da Obra">
                        <PillSelector
                            options={[
                                { id: 'novel', label: 'Romance', icon: BookOpen },
                                { id: 'script', label: 'Roteiro', icon: Clapperboard },
                                { id: 'minimal', label: 'Minimal', icon: Layers },
                            ]}
                            activeId={dialogueStyle}
                            onChange={(id) => {
                                setDialogueStyle(id)
                                triggerUpdate({ dialogueStyle: id })
                            }}
                        />
                    </EditorSection>

                    <div className="grid grid-cols-2 gap-4">
                        <EditorSection title="Fluxo">
                            <GridSelector
                                options={[
                                    { id: 'alternating', label: 'Alternado', icon: ArrowLeftRight },
                                    { id: 'classic', label: 'Livro', icon: AlignLeft },
                                ]}
                                activeId={dialogueFormat}
                                columns={2}
                                variant="ghost"
                                onChange={(id) => {
                                    setDialogueFormat(id)
                                    triggerUpdate({ dialogueFormat: id })
                                }}
                            />
                        </EditorSection>
                        <EditorSection title="Nome">
                            <GridSelector
                                options={[
                                    { id: 'bold', label: 'Forte', icon: Bold },
                                    { id: 'italic', label: 'Leve', icon: Italic },
                                    { id: 'none', label: 'Oculto', icon: EyeOff },
                                ]}
                                activeId={nameStyle}
                                columns={3}
                                variant="ghost"
                                onChange={(id) => {
                                    setNameStyle(id)
                                    triggerUpdate({ nameStyle: id })
                                }}
                            />
                        </EditorSection>
                    </div>
                </div>
            )}

            {behavior === 'typewriter' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
                    <EditorSection title="Estilo do Cursor">
                        <GridSelector
                            options={[
                                { id: 'block', label: 'Bloco', icon: Type },
                                { id: 'bar', label: 'Barra', icon: Terminal },
                                { id: 'underline', label: 'Sublinhado', icon: Activity },
                                { id: 'none', label: 'Invisível', icon: EyeOff },
                            ]}
                            activeId={cursorType}
                            columns={4}
                            variant="ghost"
                            onChange={(id) => {
                                setCursorType(id as any)
                                triggerUpdate({ cursorType: id })
                            }}
                        />
                    </EditorSection>

                    <EditorSection title="Ritmo da Escrita">
                        <PillSelector
                            variant="ghost"
                            options={[
                                { id: 'steady', label: 'Mecânico' },
                                { id: 'organic', label: 'Humano' },
                            ]}
                            activeId={content.typingRhythm || 'steady'}
                            onChange={(id) => {
                                triggerUpdate({ typingRhythm: id })
                            }}
                        />
                    </EditorSection>

                    <EditorSection title="Intensidade da Digitação">
                        <div className="relative pt-2">
                            <EditorSlider
                                variant="ghost"
                                value={Math.round((1 - speed / 0.2) * 100)}
                                min={1}
                                max={100}
                                onChange={(v) => {
                                    const newSpeed = 0.2 - (v / 100) * 0.19
                                    setSpeed(newSpeed)
                                    triggerUpdate({ speed: newSpeed })
                                }}
                            />
                            <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1 pointer-events-none">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">Lento</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">Rápido</span>
                            </div>
                        </div>
                    </EditorSection>
                </div>
            )}

            <EditorSection title="Conteúdo">
                {behavior === 'dialogue' ? (
                    <div className="space-y-6">
                        {dialogueLines.map((line, idx) => (
                            <div key={idx} className="group relative bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-transparent hover:border-blue-500/20 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <input 
                                        placeholder="Personagem..."
                                        value={line.name}
                                        onChange={(e) => updateDialogueLine(idx, 'name', e.target.value)}
                                        className="bg-transparent text-[10px] uppercase font-black tracking-widest outline-none w-full placeholder:text-zinc-400"
                                    />
                                    <button 
                                        onClick={() => removeDialogueLine(idx)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:scale-110"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <Textarea 
                                    placeholder="Digite a fala aqui..."
                                    value={line.text}
                                    onChange={(e) => updateDialogueLine(idx, 'text', e.target.value)}
                                    className="min-h-[60px] bg-white dark:bg-zinc-950 border-none rounded-xl text-[13px] font-medium resize-none focus-visible:ring-blue-500/10 shadow-sm"
                                />
                            </div>
                        ))}
                        <Button 
                            variant="ghost" 
                            className="w-full h-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-blue-500 hover:border-blue-500/20 transition-all"
                            onClick={addDialogueLine}
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Nova Fala
                        </Button>
                    </div>
                ) : (
                    <Textarea
                        placeholder="Digite sua mensagem aqui..."
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value)
                            triggerUpdate({ text: e.target.value })
                        }}
                        className="min-h-[140px] bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-3xl text-[14px] font-medium resize-none p-6 focus-visible:ring-blue-500/10 shadow-inner"
                    />
                )}
            </EditorSection>

            <EditorSection title="Estética">
                <div className="space-y-8">
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
                        {(behavior === 'static' || behavior === 'floating' || behavior === 'dialogue' || behavior === 'typewriter') && (
                            <>
                                <EditorSection title="Escala">
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
                                <EditorSection title="Alinhamento">
                                    <GridSelector
                                        id="text-align"
                                        options={[
                                            { id: 'left', label: 'Esq', icon: AlignLeft },
                                            { id: 'center', label: 'Cen', icon: AlignCenter },
                                            { id: 'right', label: 'Dir', icon: AlignRight },
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
                                <div className="col-span-2">
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
                                </div>
                            </>
                        )}

                        {behavior === 'quote' && (
                            <div className="col-span-2 space-y-4">
                                <Label className="text-[10px] uppercase font-black tracking-widest opacity-40">Autor da Citação</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        value={author}
                                        onChange={(e) => {
                                            setAuthor(e.target.value)
                                            triggerUpdate({ author: e.target.value })
                                        }}
                                        placeholder="Nome do autor..."
                                        className="w-full h-14 bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl pl-12 text-[12px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {behavior === 'status' && (
                            <div className="col-span-2 space-y-4">
                                <Label className="text-[10px] uppercase font-black tracking-widest opacity-40">Selecione seu Ícone</Label>
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
                label={block?.id ? "Fechar Editor" : "Publicar no Mural"}
            />
        </div>
    )
}
