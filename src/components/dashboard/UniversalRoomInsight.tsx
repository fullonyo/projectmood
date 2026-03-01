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
            {/* Atmosphere HUD Section */}
            <section className="space-y-4">
                <header className="flex items-center gap-2 opacity-30 px-1">
                    <Activity className="w-2.5 h-2.5" />
                    <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">
                        {t('sidebar.insight.atmosphere')}
                    </h3>
                </header>

                <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800">
                    <div className="p-4 bg-white dark:bg-zinc-950 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black dark:border-white opacity-20 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-2 mb-2 opacity-30">
                            <Layers className="w-3 h-3" />
                            <span className="text-[7px] font-black uppercase tracking-[0.3em]">{t('sidebar.insight.memories')}</span>
                        </div>
                        <div className="text-xl font-black italic tracking-tighter">
                            {stats.count.toString().padStart(2, '0')}
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-950 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black dark:border-white opacity-20 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-2 mb-2 opacity-30">
                            <History className="w-3 h-3" />
                            <span className="text-[7px] font-black uppercase tracking-[0.3em]">{t('sidebar.insight.released')}</span>
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-tighter leading-tight italic truncate">
                            {stats.lastRelease}
                        </div>
                    </div>
                </div>
            </section>

            {/* Chromatic Palette */}
            <section className="space-y-4">
                <header className="flex items-center gap-2 opacity-30 px-1">
                    <Zap className="w-2.5 h-2.5" />
                    <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">
                        {t('sidebar.insight.luminance')}
                    </h3>
                </header>

                <div className="flex gap-1 h-8">
                    {stats.dominantColors.map((color, i) => (
                        <motion.div
                            key={i}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex-1 border border-black/5 dark:border-white/5"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    {/* Fill remaining space to maintain HUD grid feel */}
                    {Array.from({ length: Math.max(0, 5 - stats.dominantColors.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex-1 bg-zinc-100 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 opacity-20" />
                    ))}
                </div>
                <p className="text-[7px] font-mono text-zinc-400 uppercase tracking-widest">
                    {t('sidebar.insight.dynamic_weight')}
                </p>
            </section>

            {/* System Status Divider */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-100 dark:via-zinc-800 to-transparent" />
        </div>
    )
}
