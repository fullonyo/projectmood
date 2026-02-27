"use client"

import { useState, useEffect, useTransition } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cloud, Search, MapPin, Loader2, Sparkles, Wind, Sun, CloudRain, Snowflake, Droplets, Layers, Globe, Activity } from "lucide-react"
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
                <header className="flex items-center gap-2 opacity-30 px-1 mb-2">
                    <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
                    <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('editors.weather.title') || 'Weather Studio'}</h3>
                </header>

                <nav className="grid grid-cols-2 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                    {[
                        { id: 'connection', label: t('editors.weather.tabs.connection') || 'Conexão', icon: Globe },
                        { id: 'esthetics', label: t('editors.weather.tabs.esthetics') || 'Estética', icon: Sparkles }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={cn(
                                "flex flex-col items-center justify-center py-4 gap-1.5 transition-all relative group",
                                activeTab === tab.id
                                    ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                        >
                            {activeTab === tab.id && (
                                <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                            )}
                            <div className={cn("text-[6px] font-black uppercase tracking-[0.2em] transition-opacity", activeTab === tab.id ? "opacity-100" : "opacity-40")}>
                                {tab.label}
                            </div>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="weather-tab-active"
                                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-black dark:bg-white"
                                />
                            )}
                        </button>
                    ))}
                </nav>
            </header>

            {/* Connection Tab */}
            {activeTab === 'connection' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800">
                        {[
                            { id: 'auto', label: 'AUTO-DETECT', icon: MapPin },
                            { id: 'manual', label: 'BUSCA MANUAL', icon: Search }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setMode(btn.id as any)}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-3 text-[7px] font-black tracking-[0.2em] transition-all relative group",
                                    mode === btn.id
                                        ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                )}
                            >
                                {mode === btn.id && (
                                    <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                                )}
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
                        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-black dark:border-white opacity-20" />
                        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white opacity-20" />

                        <div className="relative z-10 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 flex items-center justify-center relative">
                                <div className="absolute top-0 right-0 w-1 h-1 bg-black/5 dark:bg-white/5" />
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
                                <h4 className="text-4xl font-black italic tracking-tighter">{temp}°C</h4>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{vibe || '...'}</p>
                            </div>

                            <div className="h-[1px] w-8 bg-black/10 dark:bg-white/10" />

                            <p className="text-[9px] font-black uppercase tracking-widest opacity-30 font-mono">
                                {location || 'Detectando...'}
                            </p>
                        </div>
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
                            <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800 max-h-32 overflow-y-auto custom-scrollbar">
                                {BLEND_MODES.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setBlendMode(m)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 text-[8px] font-black uppercase tracking-widest transition-all relative group",
                                            blendMode === m
                                                ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                        )}
                                    >
                                        {blendMode === m && (
                                            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                                        )}
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            blendMode === m ? "bg-black dark:bg-white" : "bg-transparent border border-zinc-300 dark:border-zinc-700"
                                        )} />
                                        {m.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Button
                onClick={handleSave}
                disabled={isFetching || !location}
                className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-16 font-black uppercase tracking-[0.4em] text-[10px] transition-all border border-black dark:border-white relative group mt-4"
            >
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-30 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-30 group-hover:opacity-100 transition-opacity" />
                {block?.id ? t('editors.weather.update_btn') || 'Atualizar Clima' : t('editors.weather.deploy_btn') || 'Adicionar ao Mural'}
            </Button>
        </div>
    )
}
