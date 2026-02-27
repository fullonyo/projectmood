"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { Activity } from "lucide-react"

interface AnalyticsDisplayProps {
    views: number
    loading: boolean
}

export function AnalyticsDisplay({ views, loading }: AnalyticsDisplayProps) {
    const { t } = useTranslation()

    const getVibeStatus = (count: number) => {
        if (count > 1000) return { label: t('public_page.analytics.viral'), color: "text-white" }
        if (count > 100) return { label: t('public_page.analytics.high'), color: "text-white" }
        return { label: t('public_page.analytics.stable'), color: "text-zinc-500" }
    }

    const vibe = getVibeStatus(views)

    return (
        <div className="fixed bottom-4 left-4 sm:bottom-10 sm:left-10 z-[60] mix-blend-difference pointer-events-none group">
            <div className="flex flex-col items-start gap-3 bg-white/5 backdrop-blur-sm p-4 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white opacity-20" />

                <header className="flex items-center gap-2 opacity-30">
                    <Activity className="w-2.5 h-2.5 text-white" />
                    <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em] text-white">Metrics.Live</h3>
                </header>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-1 h-1 rounded-full animate-pulse bg-current", vibe.color)} />
                        <span className="text-[6px] font-black uppercase tracking-[0.4em] opacity-40">
                            {vibe.label}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2 leading-none">
                        <span className="text-2xl font-black tracking-tighter tabular-nums text-white italic">
                            {loading ? "00" : views.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[7px] font-black uppercase tracking-[0.5em] opacity-20 text-white">
                            {t('public_page.analytics.views')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
