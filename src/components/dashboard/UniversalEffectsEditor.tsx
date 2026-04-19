"use client"

import { useTransition, useState } from 'react'
import { updateProfile } from "@/actions/profile"
import { cn } from "@/lib/utils"
import {
    MousePointer2,
    Sparkles,
    Check,
    Activity,
    Loader2,
    ArrowUpRight,
    Heart,
    LayoutGrid,
    Ghost,
    Ban,
    Grid2X2,
    Palette,
    Tv,
    Waves,
    Grid3X3,
    Droplets,
    Wand2,
    Zap,
    CloudRain,
    Music,
    History,
    Telescope
} from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { EditorSection, GridSelector } from "./EditorUI"

interface EffectsEditorProps {
    profile: any
}

export function UniversalEffectsEditor({ profile }: EffectsEditorProps) {
    const { t } = useTranslation()
    const [isPending, startTransition] = useTransition()
    const [showSuccess, setShowSuccess] = useState(false)

    const handleUpdate = (field: string, value: string) => {
        startTransition(async () => {
            try {
                await updateProfile({ [field]: value })
                setShowSuccess(true)
                setTimeout(() => setShowSuccess(false), 2000)
            } catch (error) {
                console.error("Erro ao atualizar", error)
            }
        })
    }

    const cursors = [
        { id: 'auto', name: t('editors.effects.cursors.auto'), icon: MousePointer2 },
        { id: 'retro', name: t('editors.effects.cursors.retro'), icon: ArrowUpRight },
        { id: 'heart', name: t('editors.effects.cursors.heart'), icon: Heart },
        { id: 'pixel', name: t('editors.effects.cursors.pixel'), icon: LayoutGrid },
        { id: 'ghost', name: t('editors.effects.cursors.ghost'), icon: Ghost },
    ]

    const trails = [
        { id: 'none', name: t('editors.effects.trails.none'), icon: Ban },
        { id: 'sparkles', name: t('editors.effects.trails.sparkles'), icon: Sparkles },
        { id: 'ghost', name: t('editors.effects.trails.ghost'), icon: Ghost },
        { id: 'pixel-dust', name: t('editors.effects.trails.pixel-dust'), icon: Grid2X2 },
    ]

    const backgrounds = [
        { id: 'none', name: t('editors.effects.backgrounds.none'), icon: Palette },
        { id: 'noise', name: t('editors.effects.backgrounds.noise'), icon: Tv },
        { id: 'aurora', name: t('editors.effects.backgrounds.aurora'), icon: Waves },
        { id: 'liquid', name: t('editors.effects.backgrounds.liquid'), icon: Droplets },
        { id: 'mesh-gradient', name: t('editors.effects.backgrounds.mesh-gradient'), icon: Wand2 },
        { id: 'metaballs', name: t('editors.effects.backgrounds.metaballs'), icon: MousePointer2 },
        { id: 'hyperspeed', name: t('editors.effects.backgrounds.hyperspeed'), icon: Zap },
        { id: 'rain', name: t('editors.effects.backgrounds.rain'), icon: CloudRain },
        { id: 'rhythm', name: t('editors.effects.backgrounds.rhythm'), icon: Music },
        { id: 'vintage', name: t('editors.effects.backgrounds.vintage'), icon: History },
        { id: 'universe', name: t('editors.effects.backgrounds.universe'), icon: Telescope },
        { id: 'grid-move', name: t('editors.effects.backgrounds.grid-move'), icon: Grid3X3 },
        { id: 'stars', name: t('editors.effects.backgrounds.stars'), icon: Sparkles },
    ]

    return (
        <div className="space-y-12 pb-20">
            <EditorSection title={t('editors.effects.cursor_title')}>
                <GridSelector
                    options={cursors.map(c => ({ id: c.id as any, label: c.name, icon: c.icon }))}
                    activeId={profile.customCursor || 'auto'}
                    onChange={(id) => handleUpdate('customCursor', id as string)}
                    columns={3}
                />
            </EditorSection>

            <EditorSection title={t('editors.effects.trails_title')}>
                <GridSelector
                    options={trails.map(tInfo => ({ id: tInfo.id as any, label: tInfo.name, icon: tInfo.icon }))}
                    activeId={profile.mouseTrails || 'none'}
                    onChange={(id) => handleUpdate('mouseTrails', id as string)}
                    columns={2}
                />
            </EditorSection>

            <EditorSection title={t('editors.effects.atmosphere_title')}>
                <div className="space-y-3">
                    {backgrounds.map((b) => {
                        const isSelected = profile.backgroundEffect === b.id
                        return (
                            <button
                                key={b.id}
                                disabled={isPending}
                                onClick={() => handleUpdate('backgroundEffect', b.id)}
                                className={cn(
                                    "w-full p-4 rounded-2xl border transition-all group relative overflow-hidden flex items-center justify-between",
                                    isSelected
                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 shadow-sm"
                                        : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-700"
                                )}
                            >
                                <div className="flex items-center gap-3 z-10 relative">
                                    <div className={cn(
                                        "p-2 rounded-xl border transition-all",
                                        isSelected ? "bg-blue-100 dark:bg-blue-800 text-blue-600" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400"
                                    )}>
                                        <b.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{b.name}</span>
                                </div>

                                {isSelected && (
                                    <div className="flex items-center gap-1.5 z-10">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                        <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">{t('editors.effects.active')}</span>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </EditorSection>

            <div className="h-6 flex items-center justify-center">
                {isPending && (
                    <div className="flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-widest text-zinc-400 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {t('editors.effects.syncing')}
                    </div>
                )}

                {showSuccess && !isPending && (
                    <div className="flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                        <Check className="w-3.5 h-3.5" />
                        {t('editors.effects.deployed')}
                    </div>
                )}
            </div>
        </div>
    )
}
