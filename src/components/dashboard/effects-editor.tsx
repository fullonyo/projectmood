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
        { id: 'auto', name: 'Padrão', icon: MousePointer2 },
        { id: 'retro', name: 'Retro', icon: ArrowUpRight },
        { id: 'heart', name: 'Heart', icon: Heart },
        { id: 'pixel', name: 'Pixel', icon: LayoutGrid },
        { id: 'ghost', name: 'Ghost', icon: Ghost },
    ]

    const trails = [
        { id: 'none', name: 'Nenhum', icon: Ban },
        { id: 'sparkles', name: 'Brilhos', icon: Sparkles },
        { id: 'ghost', name: 'Fantasma', icon: Ghost },
        { id: 'pixel-dust', name: 'Pixel Dust', icon: Grid2X2 },
    ]

    const backgrounds = [
        { id: 'none', name: 'Cor Sólida', icon: Palette },
        { id: 'noise', name: 'Noise (Granulado)', icon: Tv },
        { id: 'aurora', name: 'Aurora Boreal', icon: Waves },
        { id: 'liquid', name: 'Liquid Flow', icon: Droplets },
        { id: 'mesh-gradient', name: 'Mesh Gradient', icon: Wand2 },
        { id: 'metaballs', name: 'MetaBalls (Mouse)', icon: MousePointer2 },
        { id: 'hyperspeed', name: 'Hyperspeed', icon: Zap },
        { id: 'rain', name: 'Chuva Melancólica', icon: CloudRain },
        { id: 'rhythm', name: 'Ritmo (Ondas)', icon: Music },
        { id: 'vintage', name: 'Vintage Movie', icon: History },
        { id: 'universe', name: 'Universo Profundo', icon: Telescope },
        { id: 'grid-move', name: 'Retro Grid', icon: Grid3X3 },
        { id: 'stars', name: 'Starfield', icon: Sparkles },
    ]

    return (
        <div className="space-y-8 p-1">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        <MousePointer2 className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.effects.cursor_title')}</h3>
                </div>
                <div className="grid grid-cols-3 border border-zinc-200 dark:border-zinc-800">
                    {cursors.map((c) => (
                        <button
                            key={c.id}
                            disabled={isPending}
                            onClick={() => handleUpdate('customCursor', c.id)}
                            className={cn(
                                "p-4 border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-2 transition-all group",
                                profile.customCursor === c.id
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "bg-white dark:bg-zinc-950 opacity-60 hover:opacity-100"
                            )}
                        >
                            <c.icon className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{c.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.effects.trails_title')}</h3>
                </div>
                <div className="grid grid-cols-2 border border-zinc-200 dark:border-zinc-800">
                    {trails.map((t) => (
                        <button
                            key={t.id}
                            disabled={isPending}
                            onClick={() => handleUpdate('mouseTrails', t.id)}
                            className={cn(
                                "p-4 border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-3 transition-all group",
                                profile.mouseTrails === t.id
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "bg-white dark:bg-zinc-950 opacity-60 hover:opacity-100"
                            )}
                        >
                            <t.icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        <Wallpaper className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.effects.atmosphere_title')}</h3>
                </div>
                <div className="grid grid-cols-1 border border-zinc-200 dark:border-zinc-800">
                    {backgrounds.map((b) => {
                        const isSelected = profile.backgroundEffect === b.id
                        return (
                            <button
                                key={b.id}
                                disabled={isPending}
                                onClick={() => handleUpdate('backgroundEffect', b.id)}
                                className={cn(
                                    "w-full p-4 border-b last:border-b-0 border-zinc-200 dark:border-zinc-800 flex items-center justify-between transition-all group relative overflow-hidden",
                                    isSelected
                                        ? "bg-black text-white dark:bg-white dark:text-black"
                                        : "bg-white dark:bg-zinc-950 opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className="flex items-center gap-3 z-10 relative">
                                    <div className="p-2 border border-current opacity-20">
                                        <b.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{b.name}</span>
                                </div>

                                {isSelected && (
                                    <div className="flex items-center gap-1.5 z-10">
                                        <div className="w-1.5 h-1.5 bg-current animate-pulse" />
                                        <span className="text-[7px] font-mono opacity-50 uppercase tracking-tighter">{t('editors.effects.active')}</span>
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
