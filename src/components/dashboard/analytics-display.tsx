"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

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
        <div className="fixed bottom-10 left-10 z-[60] mix-blend-difference pointer-events-none">
            <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                    <div className={cn("w-1 h-1 rounded-full animate-pulse bg-current", vibe.color)} />
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-40">
                        {vibe.label}
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5 leading-none">
                    <span className="text-xl font-black tracking-tighter tabular-nums">
                        {loading ? "..." : views.toLocaleString()}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-20">
                        {t('public_page.analytics.views')}
                    </span>
                </div>
            </div>
        </div>
    )
}
