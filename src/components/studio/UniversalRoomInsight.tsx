"use client"

import { useTranslation } from "@/i18n/context"
import { MoodBlock, Profile } from "@/types/database"
import { motion } from "framer-motion"
import {
    Activity,
    Calendar,
    Layers,
    Zap,
    History
} from "lucide-react"
import { useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"

interface SidebarRoomInsightProps {
    blocks: MoodBlock[]
    profile: Profile
    publishedAt?: string | null
}

export function UniversalRoomInsight({ blocks, profile, publishedAt }: SidebarRoomInsightProps) {
    const { t, locale } = useTranslation()

    const stats = useMemo(() => {
        const publishedDate = publishedAt ? new Date(publishedAt) : null
        const dateLocale = locale === 'pt' ? ptBR : enUS

        // Simulating color dominance for HUD effect
        // In a real scenario, we could extract this from block contents
        const colors = blocks
            .filter(b => b.content && (b.content as any).color)
            .map(b => (b.content as any).color)
            .slice(0, 5)

        return {
            count: blocks.length,
            lastRelease: publishedDate
                ? formatDistanceToNow(publishedDate, { addSuffix: true, locale: dateLocale })
                : t('publish.never_published'),
            dominantColors: colors.length > 0 ? colors : ['#ccc', '#eee', '#999']
        }
    }, [blocks, profile, locale, t])

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Atmosphere Section */}
            <section className="space-y-4">
                <header className="px-1">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                        {t('sidebar.insight.atmosphere')}
                    </h3>
                </header>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm group">
                        <div className="flex items-center gap-2 mb-3 text-zinc-400">
                            <Layers className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{t('sidebar.insight.memories')}</span>
                        </div>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                            {stats.count.toString().padStart(2, '0')}
                        </div>
                    </div>

                    <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm group">
                        <div className="flex items-center gap-2 mb-3 text-zinc-400">
                            <History className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{t('sidebar.insight.released')}</span>
                        </div>
                        <div className="text-[10px] font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-tight leading-tight truncate">
                            {stats.lastRelease}
                        </div>
                    </div>
                </div>
            </section>

            {/* Chromatic Palette */}
            <section className="space-y-4">
                <header className="px-1">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                        {t('sidebar.insight.luminance')}
                    </h3>
                </header>

                <div className="flex gap-2 h-10 px-1">
                    {stats.dominantColors.map((color, i) => (
                        <motion.div
                            key={i}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex-1 rounded-full border border-black/5 dark:border-white/5 shadow-sm"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    {/* Fill remaining space */}
                    {Array.from({ length: Math.max(0, 5 - stats.dominantColors.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-black/5 dark:border-white/5 opacity-50" />
                    ))}
                </div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                    {t('sidebar.insight.dynamic_weight')}
                </p>
            </section>

            <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800" />
        </div>
    )
}
