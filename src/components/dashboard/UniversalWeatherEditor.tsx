"use client"

import { useState, useEffect, useTransition } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cloud, Search, MapPin, Loader2, Sparkles, Wind, Sun, CloudRain, Snowflake, Droplets, Layers, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { MoodBlock } from "@/types/database"
import { getWeatherAction } from "@/actions/weather"
import { Slider } from "@/components/ui/slider"

const BLEND_MODES = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color-dodge', 'color-burn', 'hard-light', 'soft-light',
    'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
]

const WEATHER_ICONS: Record<string, any> = {
    sun: Sun,
    rain: CloudRain,
    snow: Snowflake,
    wind: Wind,
    cloud: Cloud
}

type TabType = 'connection' | 'esthetics'

interface UniversalWeatherEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (type: string, content: any) => Promise<void>
    onClose?: () => void
}

export function UniversalWeatherEditor({
    block,
    onUpdate,
    onAdd,
    onClose
}: UniversalWeatherEditorProps) {
    const { t } = useTranslation()
    const [isPending, startTransition] = useTransition()
    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('connection')

    const content = block?.content || {}
    const [location, setLocation] = useState(content.location || "")
    const [vibe, setVibe] = useState(content.vibe || "")
    const [temp, setTemp] = useState(content.temp || 25)
    const [icon, setIcon] = useState(content.icon || 'cloud')
    const [mode, setMode] = useState<'auto' | 'manual'>(content.mode || 'auto')
    const [opacity, setOpacity] = useState(content.opacity ?? 1)
    const [blendMode, setBlendMode] = useState(content.blendMode || 'normal')

    // Live update for existing block
    useEffect(() => {
        if (!block?.id || !onUpdate) return
        onUpdate(block.id, {
            content: { location, vibe, temp, icon, mode, opacity, blendMode }
        })
    }, [location, vibe, temp, icon, mode, opacity, blendMode, block?.id, onUpdate])

    const handleFetchWeather = async (searchLoc?: string) => {
        setError(null)
        setIsFetching(true)

        try {
            const result = await getWeatherAction(searchLoc)
            if (result.success && result.data) {
                const data = result.data
                setLocation(data.location)
                setVibe(data.condition)
                setTemp(data.temp)
                setIcon(data.icon)
            } else {
                setError(result.error || "Erro ao buscar clima")
            }
        } catch (e) {
            setError("Serviço indisponível")
        } finally {
            setIsFetching(false)
        }
    }

    // Auto-fetch on mount if auto mode and no location
    useEffect(() => {
        if (mode === 'auto' && !location && !block?.id) {
            handleFetchWeather()
        }
    }, [mode, location, block?.id])

    const handleSave = () => {
        const finalContent = { location, vibe, temp, icon, mode, opacity, blendMode }
        startTransition(async () => {
            if (block?.id) {
                if (onClose) onClose()
            } else if (onAdd) {
                await onAdd('weather', finalContent)
                if (onClose) onClose()
            }
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* Header with Navigation Synergy */}
            <header className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        <Cloud className="w-4 h-4 text-black dark:text-white" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.weather.title') || 'Weather Studio'}</h3>
                        <p className="text-[8px] text-zinc-400 uppercase tracking-widest leading-none mt-1">{t('editors.weather.subtitle') || 'Atmosfera em Tempo Real'}</p>
                    </div>
                </div>

                <nav className="flex gap-1 border-b border-zinc-100 dark:border-zinc-900 pb-px">
                    {[
                        { id: 'connection', label: t('editors.weather.tabs.connection') || 'Conexão', icon: Globe },
                        { id: 'esthetics', label: t('editors.weather.tabs.esthetics') || 'Estética', icon: Sparkles }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={cn(
                                "flex-1 px-2 py-3 text-[8px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-2",
                                activeTab === tab.id
                                    ? "text-black dark:text-white"
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            )}
                        >
                            <tab.icon className="w-3 h-3" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="weather-tab-active"
                                    className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-black dark:bg-white"
                                />
                            )}
                        </button>
                    ))}
                </nav>
            </header>

            {/* Connection Tab */}
            {activeTab === 'connection' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-1">
                        {[
                            { id: 'auto', label: 'AUTO-DETECT', icon: MapPin },
                            { id: 'manual', label: 'BUSCA MANUAL', icon: Search }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setMode(btn.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 text-[8px] font-black tracking-[0.2em] transition-all",
                                    mode === btn.id
                                        ? "bg-black text-white dark:bg-white dark:text-black shadow-lg"
                                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                )}
                            >
                                <btn.icon className="w-3 h-3" />
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {mode === 'manual' && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-50">{t('editors.weather.location_label') || 'Cidade/Local'}</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Ex: London, Tokyo..."
                                    className="bg-zinc-50 dark:bg-zinc-900 border-none rounded-none h-12 text-[10px] font-mono uppercase focus-visible:ring-1 ring-black dark:ring-white"
                                />
                                <Button
                                    onClick={() => handleFetchWeather(location)}
                                    disabled={isFetching}
                                    className="bg-black dark:bg-white text-white dark:text-black rounded-none h-12 w-12"
                                >
                                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Status Preview Card */}
                    <div className="p-6 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 flex items-center justify-center">
                                {isFetching ? (
                                    <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                                ) : (
                                    (() => {
                                        const CurrentIcon = WEATHER_ICONS[icon] || Cloud
                                        return <CurrentIcon className="w-8 h-8 opacity-80" />
                                    })()
                                )}
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-4xl font-serif italic">{temp}°C</h4>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{vibe || '...'}</p>
                            </div>

                            <div className="h-[1px] w-8 bg-black/10 dark:bg-white/10" />

                            <p className="text-[9px] font-black uppercase tracking-widest opacity-50">
                                {location || 'Detectando...'}
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                    </div>
                </div>
            )}

            {/* Esthetics Tab */}
            {activeTab === 'esthetics' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Vibe Override */}
                    <div className="space-y-4">
                        <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                            <Wind className="w-3 h-3" /> {t('editors.weather.vibe_label') || 'Mensagem do Momento (Vibe)'}
                        </Label>
                        <Input
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                            placeholder="Ex: Rainy Afternoon..."
                            className="bg-zinc-50 dark:bg-zinc-900 border-none rounded-none h-12 text-[10px] font-mono uppercase focus-visible:ring-1 ring-black dark:ring-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> {t('editors.shape.opacity_label') || 'Opacidade'}: {Math.round(opacity * 100)}%
                            </Label>
                            <Slider
                                value={[opacity * 100]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={([v]: number[]) => setOpacity(v / 100)}
                                className="mt-4"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <Layers className="w-3 h-3" /> {t('editors.shape.blend_label') || 'Blend Mode'}
                            </Label>
                            <select
                                value={blendMode}
                                onChange={(e) => setBlendMode(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none h-10 text-[9px] font-black uppercase tracking-widest px-3 outline-none focus:ring-1 ring-black dark:ring-white"
                            >
                                {BLEND_MODES.map(m => (
                                    <option key={m} value={m}>{m.replace('-', ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <Button
                onClick={handleSave}
                disabled={isFetching || !location}
                className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-16 font-black uppercase tracking-[0.5em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl mt-4"
            >
                {block?.id ? t('editors.weather.update_btn') || 'Atualizar Clima' : t('editors.weather.deploy_btn') || 'Adicionar ao Mural'}
            </Button>
        </div>
    )
}
