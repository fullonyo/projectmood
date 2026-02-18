"use client"

import { useTransition, useState } from 'react'
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/actions/profile"
import { MousePointer2, Sparkles, Wallpaper, Loader2, Check } from "lucide-react"

interface EffectsEditorProps {
    profile: any
}

export function EffectsEditor({ profile }: EffectsEditorProps) {
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
        { id: 'auto', name: 'Padrão', icon: '👆' },
        { id: 'retro', name: 'Retro', icon: '↗️' },
        { id: 'heart', name: 'Heart', icon: '💖' },
        { id: 'pixel', name: 'Pixel', icon: '👾' },
        { id: 'ghost', name: 'Ghost', icon: '👻' },
    ]

    const trails = [
        { id: 'none', name: 'Nenhum', icon: '🚫' },
        { id: 'sparkles', name: 'Brilhos', icon: '✨' },
        { id: 'ghost', name: 'Fantasma', icon: '👻' },
        { id: 'pixel-dust', name: 'Pixel Dust', icon: '👾' },
    ]

    const backgrounds = [
        { id: 'none', name: 'Cor Sólida', icon: '🎨' },
        { id: 'noise', name: 'Noise (Granulado)', icon: '📺' },
        { id: 'aurora', name: 'Aurora Boreal', icon: '🌌' },
        { id: 'grid-move', name: 'Retro Grid', icon: '🌐' },
    ]

    return (
        <div className="space-y-8 p-1">
            {/* Cursors */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/80">
                    <MousePointer2 className="w-4 h-4" />
                    <Label>Cursor Style</Label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {cursors.map((c) => (
                        <button
                            key={c.id}
                            disabled={isPending}
                            onClick={() => handleUpdate('customCursor', c.id)}
                            className={`
                                p-3 rounded-xl border flex flex-col items-center gap-2 transition-all
                                ${profile.customCursor === c.id
                                    ? 'bg-white/10 border-white/40 shadow-lg scale-105'
                                    : 'bg-zinc-900/50 border-white/5 hover:bg-white/5 hover:border-white/20'
                                }
                            `}
                        >
                            <span className="text-xl">{c.icon}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">{c.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mouse Trails */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/80">
                    <Sparkles className="w-4 h-4" />
                    <Label>Rastro do Mouse</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {trails.map((t) => (
                        <button
                            key={t.id}
                            disabled={isPending}
                            onClick={() => handleUpdate('mouseTrails', t.id)}
                            className={`
                                p-3 rounded-xl border flex items-center gap-3 transition-all
                                ${profile.mouseTrails === t.id
                                    ? 'bg-white/10 border-white/40 shadow-lg'
                                    : 'bg-zinc-900/50 border-white/5 hover:bg-white/5 hover:border-white/20'
                                }
                            `}
                        >
                            <span className="text-lg">{t.icon}</span>
                            <span className="text-xs font-medium opacity-80">{t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Background Effects */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/80">
                    <Wallpaper className="w-4 h-4" />
                    <Label>Efeito de Fundo</Label>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {backgrounds.map((b) => {
                        const isSelected = profile.backgroundEffect === b.id
                        return (
                            <button
                                key={b.id}
                                disabled={isPending}
                                onClick={() => handleUpdate('backgroundEffect', b.id)}
                                className={`
                                w-full p-4 rounded-xl border flex items-center justify-between transition-all group relative overflow-hidden
                                ${isSelected
                                        ? 'bg-white/10 border-white/40'
                                        : 'bg-zinc-900/50 border-white/5 hover:bg-white/5 hover:border-white/20'
                                    }
                            `}
                            >
                                <div className="flex items-center gap-3 z-10 relative">
                                    <span className="text-lg p-2 bg-black/20 rounded-full">{b.icon}</span>
                                    <span className="text-sm font-medium">{b.name}</span>
                                </div>

                                {/* Preview mini-bg */}
                                {b.id === 'aurora' && <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-blue-500 to-pink-500 pointer-events-none" />}
                                {b.id === 'noise' && <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />}
                                {b.id === 'grid-move' && <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />}

                                {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] z-10" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="h-4 flex items-center justify-center">
                {isPending && (
                    <div className="flex items-center justify-center gap-2 text-xs text-white/50 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Salvando alterações...
                    </div>
                )}

                {showSuccess && !isPending && (
                    <div className="flex items-center justify-center gap-2 text-xs text-green-400 animate-in fade-in slide-in-from-bottom-1">
                        <Check className="w-3 h-3" />
                        Salvo com sucesso!
                    </div>
                )}
            </div>
        </div>
    )
}
