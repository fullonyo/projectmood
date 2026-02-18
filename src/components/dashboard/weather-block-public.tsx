"use client"

import { cn } from "@/lib/utils"
import { Cloud, Sun, CloudRain, Snowflake, Wind } from "lucide-react"

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
    const Icon = ICONS[content.icon || 'cloud'] || Cloud

    return (
        <div className="p-7 bg-white/10 dark:bg-zinc-900/10 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl min-w-[200px] text-center space-y-4 group hover:scale-[1.02] transition-transform">
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-1">
                    <Icon className="w-6 h-6 text-current opacity-80" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Vibe do Momento</p>
            </div>

            <div className="space-y-1">
                <p className="text-2xl font-serif italic leading-tight">{content.vibe}</p>
                <div className="h-[1px] w-8 bg-current mx-auto opacity-20" />
                <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">{content.location}</p>
            </div>
        </div>
    )
}
