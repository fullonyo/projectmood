"use client"

import React, { memo } from "react"
import { cn } from "@/lib/utils"
import { Cloud, Sun, CloudRain, Snowflake, Wind } from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { useStudioBlock } from "@/hooks/use-studio-block"

const WEATHER_METADATA: Record<string, { icon: any, label: string, color: string, gradient: string, animation: string }> = {
    sun: { icon: Sun, label: 'Sunny', color: '#f59e0b', gradient: 'from-amber-500/10 to-transparent', animation: 'animate-[studio-weather-spin_20s_linear_infinite]' },
    rain: { icon: CloudRain, label: 'Rainy', color: '#3b82f6', gradient: 'from-blue-600/10 to-transparent', animation: 'animate-bounce' },
    snow: { icon: Snowflake, label: 'Snowy', color: '#94a3b8', gradient: 'from-slate-300/10 to-transparent', animation: 'animate-pulse' },
    wind: { icon: Wind, label: 'Windy', color: '#10b981', gradient: 'from-emerald-500/10 to-transparent', animation: 'animate-[studio-weather-bob_4s_ease-in-out_infinite]' },
    cloud: { icon: Cloud, label: 'Cloudy', color: '#64748b', gradient: 'from-zinc-500/10 to-transparent', animation: 'animate-[studio-weather-bob_5s_ease-in-out_infinite]' }
}

interface WeatherBlockPublicProps {
    content: {
        vibe: string
        location: string
        icon?: string
        temp?: number | string
        opacity?: number
        blendMode?: string
    }
}

/**
 * WeatherBlockPublic - Padronizado com Studio FUS 💎
 * Utiliza o hook universal useStudioBlock para redimensionamento fluido.
 */
export const SmartWeather = memo(({ content }: WeatherBlockPublicProps) => {
    const { t } = useTranslation()
    const { ref, isHorizontal, isSmall, fluidScale, viewportScale } = useStudioBlock()

    const metadata = WEATHER_METADATA[content.icon || 'cloud'] || WEATHER_METADATA.cloud
    const Icon = metadata.icon

    // Estados de visibilidade derivados do padrão FUS
    const showSecondary = !isSmall && fluidScale > 0.6
    const showVibe = !isSmall && (fluidScale > 0.8 || (isHorizontal && fluidScale > 0.5))

    // Fallbacks
    const displayLocation = content.location || 'Unknown'
    const displayVibe = content.vibe || '...'
    const displayTemp = content.temp !== undefined ? content.temp : '--'

    return (
        <div
            ref={ref}
            className={cn(
                "w-full h-full bg-white/10 dark:bg-zinc-950/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none shadow-none flex items-center justify-center group hover:scale-[1.02] transition-all duration-700 relative overflow-hidden text-zinc-900 dark:text-zinc-100",
                isHorizontal ? "flex-row text-left px-[10%]" : "flex-col text-center"
            )}
            style={{
                gap: Math.round((isHorizontal ? 24 : 16) * fluidScale)
            }}
        >
            {/* Atmospheric Background Component */}
            <div className={cn("absolute inset-0 bg-gradient-to-br -z-10 opacity-50", metadata.gradient)} />

            {/* Studio Glass Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

            {/* Group 1: Icon & Label */}
            <div className={cn("flex flex-col items-center shrink-0")} style={{ gap: Math.round(6 * fluidScale) }}>
                <div
                    className="rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 flex items-center justify-center shadow-xl"
                    style={{
                        width: Math.round(52 * fluidScale),
                        height: Math.round(52 * fluidScale)
                    }}
                >
                    <Icon
                        className={cn("text-current opacity-90", metadata.animation)}
                        style={{
                            width: Math.round(26 * fluidScale),
                            height: Math.round(26 * fluidScale),
                            color: metadata.color
                        }}
                    />
                </div>
                {showSecondary && !isHorizontal && (
                    <p className="uppercase tracking-[0.4em] font-black opacity-30 leading-none whitespace-nowrap" style={{ fontSize: Math.max(6, Math.round(8 * fluidScale)) }}>
                        {t('canvas.weather_registry') || 'CLIMA'}
                    </p>
                )}
            </div>

            {/* Group 2: Stats */}
            <div className={cn("flex flex-col min-h-0", isHorizontal ? "items-start flex-1" : "items-center")} style={{ gap: Math.round(4 * fluidScale) }}>
                <p className="font-serif italic leading-none opacity-90 whitespace-nowrap"
                    style={{ fontSize: Math.round(48 * fluidScale) }}>
                    {displayTemp}°
                </p>

                {showVibe && (
                    <p className="font-serif leading-tight opacity-70 line-clamp-1 italic whitespace-nowrap overflow-hidden text-ellipsis w-full"
                        style={{ fontSize: Math.round(18 * fluidScale) }}>
                        {displayVibe}
                    </p>
                )}

                {showSecondary && (
                    <div
                        className="bg-current opacity-10 my-0.5"
                        style={{ height: 1, width: Math.round(30 * fluidScale) }}
                    />
                )}

                <p className="font-black opacity-40 uppercase tracking-[0.2em] line-clamp-1 truncate w-full"
                    style={{ fontSize: Math.round(10 * fluidScale) }}>
                    {displayLocation}
                </p>
            </div>

            {/* Micro Glow */}
            <div
                className="absolute -bottom-10 -right-10 w-24 h-24 blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: metadata.color }}
            />
        </div>
    )
})

SmartWeather.displayName = "SmartWeather"
