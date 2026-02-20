"use client"

import { cn } from "@/lib/utils"
import { Cloud, Sun, CloudRain, Snowflake, Wind } from "lucide-react"
import { useTranslation } from "@/i18n/context"

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

    return (
        <div className="p-7 bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-none shadow-none min-w-[200px] text-center space-y-4 group hover:scale-[1.02] transition-transform">
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-none bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center mb-1">
                    <Icon className="w-6 h-6 text-current opacity-80" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">{t('canvas.weather_registry')}</p>
            </div>

            <div className="space-y-1">
                <p className="text-2xl font-serif italic leading-tight">{content.vibe}</p>
                <div className="h-[1px] w-8 bg-current mx-auto opacity-20" />
                <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">{content.location}</p>
            </div>
        </div>
    )
}
