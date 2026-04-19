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
import { BLEND_MODES } from "@/lib/editor-constants"
import { EditorHeader, EditorSection, PillSelector, GridSelector, EditorActionButton, EditorSlider } from "./EditorUI"

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
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={t('editors.weather.title')}
                subtitle={t('editors.weather.subtitle')}
            />

            <PillSelector
                options={[
                    { id: 'connection', label: "Sincronização", icon: Globe },
                    { id: 'esthetics', label: "Visual", icon: Sparkles },
                ]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as TabType)}
            />

            {activeTab === 'connection' ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Modo de Detecção">
                        <PillSelector
                            options={[
                                { id: 'auto', label: 'Automático', icon: MapPin },
                                { id: 'manual', label: 'Manual', icon: Search }
                            ]}
                            activeId={mode}
                            onChange={(id) => setMode(id as any)}
                        />
                    </EditorSection>

                    {mode === 'manual' && (
                        <EditorSection title="Localização">
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex gap-4">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <Input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Ex: São Paulo, Tokyo..."
                                        className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 h-12 text-[11px] font-medium"
                                    />
                                </div>
                                <Button
                                    onClick={() => handleFetchWeather(location)}
                                    disabled={isFetching}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-[9px]"
                                >
                                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                                </Button>
                            </div>
                        </EditorSection>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-2xl text-center">
                            {error}
                        </div>
                    )}

                    <EditorSection title="Status Atual">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center gap-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 dark:bg-blue-900/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                            
                            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-inner">
                                {isFetching ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                ) : (
                                    (() => {
                                        const CurrentIcon = WEATHER_ICONS[icon] || Cloud
                                        return <CurrentIcon className="w-10 h-10 text-zinc-800 dark:text-white" />
                                    })()
                                )}
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-5xl font-black italic tracking-tighter text-zinc-900 dark:text-white">{temp}°C</h4>
                                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600">{vibe || 'Detectando vibe...'}</p>
                            </div>

                            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-full">
                                <MapPin className="w-3 h-3 text-zinc-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{location || '...'}</span>
                            </div>
                        </div>
                    </EditorSection>
                </div>
            ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Mensagem / Vibe">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <div className="relative">
                                <Wind className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input
                                    value={vibe}
                                    onChange={(e) => setVibe(e.target.value)}
                                    placeholder="Ex: Tarde chuvosa de outono..."
                                    className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 h-12 text-[11px] font-medium"
                                />
                            </div>
                        </div>
                    </EditorSection>

                    <div className="grid grid-cols-2 gap-6">
                        <EditorSlider
                            label="Opacidade"
                            value={Math.round(opacity * 100)}
                            unit="%"
                            min={0}
                            max={100}
                            onChange={(v) => setOpacity(v / 100)}
                        />

                        <EditorSection title="Blend Mode">
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm max-h-40 overflow-y-auto custom-scrollbar">
                                <div className="space-y-1">
                                    {BLEND_MODES.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setBlendMode(m)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                                blendMode === m ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                            )}
                                        >
                                            {m.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </EditorSection>
                    </div>
                </div>
            )}

            <EditorActionButton 
                onClick={handleSave} 
                isLoading={isFetching || isPending} 
                disabled={!location}
                label={block?.id ? t('editors.weather.update_btn') || 'Atualizar Clima' : t('editors.weather.deploy_btn') || 'Adicionar ao Mural'}
            />
        </div>
    )
}
