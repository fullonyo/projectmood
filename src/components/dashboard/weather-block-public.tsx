"use client"

import { cn } from "@/lib/utils"
import { Cloud, Sun, CloudRain, Snowflake, Wind } from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { useViewportScale } from "@/lib/canvas-scale"

const ICONS: Record<string, any> = {
    sun: Sun,
    rain: CloudRain,
    snow: Snowflake,
    wind: Wind,
    cloud: Cloud
}

interface WeatherBlockPublicProps {
    content: {
        vibe: string
        location: string
        icon?: string
    }
}

export function WeatherBlockPublic({ content }: WeatherBlockPublicProps) {
    const { t } = useTranslation()
    const Icon = ICONS[content.icon || 'cloud'] || Cloud
    const scale = useViewportScale()

    return (
        <div
            className="bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-none shadow-none text-center flex flex-col group hover:scale-[1.02] transition-transform"
            style={{ minWidth: Math.round(200 * scale), padding: Math.round(28 * scale), gap: Math.round(16 * scale) }}
        >
            <div className="flex flex-col items-center" style={{ gap: Math.round(8 * scale) }}>
                <div className="rounded-none bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center" style={{ width: Math.round(48 * scale), height: Math.round(48 * scale), marginBottom: Math.round(4 * scale) }}>
                    <Icon className="text-current opacity-80" style={{ width: Math.round(24 * scale), height: Math.round(24 * scale) }} />
                </div>
                <p className="uppercase tracking-[0.4em] font-black opacity-30" style={{ fontSize: Math.round(10 * scale) }}>{t('canvas.weather_registry')}</p>
            </div>

            <div className="flex flex-col" style={{ gap: Math.round(4 * scale) }}>
                <p className="font-serif italic leading-tight" style={{ fontSize: Math.round(24 * scale) }}>{content.vibe}</p>
                <div className="bg-current mx-auto opacity-20" style={{ height: Math.max(1, Math.round(1 * scale)), width: Math.round(32 * scale) }} />
                <p className="font-black opacity-40 uppercase tracking-[0.2em]" style={{ fontSize: Math.round(10 * scale) }}>{content.location}</p>
            </div>
        </div>
    )
}
