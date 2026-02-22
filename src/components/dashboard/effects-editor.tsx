"use client"

import { useTransition, useState } from 'react'
import { updateProfile } from "@/actions/profile"
import { cn } from "@/lib/utils"
import {
    MousePointer2,
    Sparkles,
    Wallpaper,
    Loader2,
    Check,
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

interface EffectsEditorProps {
    profile: any
}
import { useTranslation } from "@/i18n/context"

export function EffectsEditor({ profile }: EffectsEditorProps) {
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
        <div className="space-y-10 p-1">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                        <MousePointer2 className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.effects.cursor_title')}</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {cursors.map((c) => {
                        const isSelected = profile.customCursor === c.id
                        return (
                            <button
                                key={c.id}
                                disabled={isPending}
                                onClick={() => handleUpdate('customCursor', c.id)}
                                className={cn(
                                    "p-4 border transition-all group flex flex-col items-center gap-2",
                                    isSelected
                                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg scale-105"
                                        : "bg-white dark:bg-black/20 border-zinc-100 dark:border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-600"
                                )}
                            >
                                <c.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isSelected && "animate-pulse")} />
                                <span className="text-[7px] font-black uppercase tracking-[0.2em]">{c.name}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                        <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.effects.trails_title')}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {trails.map((t) => {
                        const isSelected = profile.mouseTrails === t.id
                        return (
                            <button
                                key={t.id}
                                disabled={isPending}
                                onClick={() => handleUpdate('mouseTrails', t.id)}
                                className={cn(
                                    "p-4 border transition-all group flex items-center justify-center gap-3",
                                    isSelected
                                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg scale-105"
                                        : "bg-white dark:bg-black/20 border-zinc-100 dark:border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-600"
                                )}
                            >
                                <t.icon className={cn("w-3.5 h-3.5 transition-transform group-hover:scale-110", isSelected && "animate-pulse")} />
                                <span className="text-[7px] font-black uppercase tracking-[0.2em]">{t.name}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                        <Wallpaper className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.effects.atmosphere_title')}</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {backgrounds.map((b) => {
                        const isSelected = profile.backgroundEffect === b.id
                        return (
                            <button
                                key={b.id}
                                disabled={isPending}
                                onClick={() => handleUpdate('backgroundEffect', b.id)}
                                className={cn(
                                    "w-full p-4 border transition-all group relative overflow-hidden flex items-center justify-between",
                                    isSelected
                                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg"
                                        : "bg-white dark:bg-black/20 border-zinc-100 dark:border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-600"
                                )}
                            >
                                <div className="flex items-center gap-3 z-10 relative">
                                    <div className={cn("p-2 border border-current opacity-20", isSelected && "opacity-100")}>
                                        <b.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">{b.name}</span>
                                </div>

                                {isSelected && (
                                    <div className="flex items-center gap-1.5 z-10">
                                        <div className="w-1 h-1 bg-current animate-ping" />
                                        <span className="text-[7px] font-black opacity-50 uppercase tracking-widest animate-pulse">{t('editors.effects.active')}</span>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="h-6 flex items-center justify-center">
                {isPending && (
                    <div className="flex items-center justify-center gap-2 text-[7px] font-black uppercase tracking-[0.4em] text-zinc-400 animate-pulse">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        {t('editors.effects.syncing')}
                    </div>
                )}

                {showSuccess && !isPending && (
                    <div className="flex items-center justify-center gap-2 text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500">
                        <Check className="w-2.5 h-2.5" />
                        {t('editors.effects.deployed')}
                    </div>
                )}
            </div>
        </div>
    )
}
