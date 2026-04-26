"use client"

import { useState, useTransition } from "react"
import { useTranslation } from "@/i18n/context"
import { MOOD_TEMPLATES, MoodTemplate } from "@/lib/templates"
import { applyTemplateAction } from "@/actions/templates"
import { addMoodBlock } from "@/actions/profile"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Loader2, ArrowRight, Activity } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function TemplateChooser({ roomId }: { roomId?: string }) {
    const { t } = useTranslation()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    const handleApply = (id: string) => {
        startTransition(async () => {
            const res = await applyTemplateAction(id, roomId)
            if (res.success) {
                toast.success(t('templates.applying'))
                router.refresh()
            } else {
                toast.error(res.error)
            }
        })
    }

    const handleStartFresh = () => {
        startTransition(async () => {
            const res = await addMoodBlock('text', { text: 'New Mood...', style: 'simple' }, { x: 50, y: 50, roomId })
            if (res.success) {
                toast.success(t('templates.start_fresh'))
                router.refresh()
            } else {
                toast.error(res.error)
            }
        })
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center z-50 p-6 overflow-y-auto bg-zinc-900/90 backdrop-blur-3xl">
            {/* Background Texture for consistency */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <filter id="noiseFilterTemplate">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilterTemplate)" />
                </svg>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-5xl space-y-12 text-center my-auto relative z-10"
            >
                <header className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 opacity-50 bg-white/5 px-3 py-1 rounded-full">
                        <Activity className="w-2.5 h-2.5 text-blue-400" />
                        <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400">{t('templates.empty_state')}</h3>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic text-white">
                        {t('templates.chooser_title')}
                    </h1>
                    <p className="text-zinc-500 text-[10px] md:text-xs font-medium uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed">
                        {t('templates.chooser_subtitle')}
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(Object.values(MOOD_TEMPLATES) as MoodTemplate[]).map((template, idx) => {
                        const Icon = template.icon
                        const isHovered = hoveredId === template.id

                        return (
                            <motion.button
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (idx * 0.1) }}
                                onMouseEnter={() => setHoveredId(template.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                onClick={() => handleApply(template.id)}
                                disabled={isPending}
                                className={cn(
                                    "group relative flex flex-col items-start p-8 transition-all duration-500 text-left border rounded-[2rem] overflow-hidden active:scale-[0.98]",
                                    template.profile.theme === 'dark' ? "bg-zinc-900/50 border-zinc-800/50" : "bg-white border-zinc-200",
                                    isHovered ? "border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.1)] -translate-y-2" : ""
                                )}
                            >
                                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/10 rounded-bl-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className={cn(
                                    "p-4 rounded-2xl border mb-6 transition-all duration-700 shadow-sm",
                                    template.profile.theme === 'dark' ? "bg-zinc-800/50 border-zinc-700/50 text-white" : "bg-zinc-50 border-zinc-100 text-black",
                                    isHovered ? "rotate-[-8deg] scale-110 bg-blue-600 text-white border-blue-500 shadow-[0_10px_20px_rgba(37,99,235,0.2)]" : ""
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                <h3 className={cn(
                                    "text-lg font-black uppercase tracking-tight mb-1",
                                    template.profile.theme === 'dark' ? "text-white" : "text-black"
                                )}>
                                    {t(`templates.items.${template.tk}.title`)}
                                </h3>

                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: template.profile.primaryColor }} />
                                    {t(`templates.items.${template.tk}.vibe`)}
                                </p>

                                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    {t(`templates.items.${template.tk}.desc`)}
                                </p>

                                <div className="mt-auto pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-blue-500 transition-colors">
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            {t('templates.applying')}
                                        </>
                                    ) : (
                                        <>
                                            {t('common.select')}
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </motion.button>
                        )
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="pt-8"
                >
                    <button
                        onClick={handleStartFresh}
                        disabled={isPending}
                        className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all py-4 px-10 rounded-full border border-white/5 hover:bg-white/5 hover:border-white/10 active:scale-95"
                    >
                        {t('templates.start_fresh')}
                    </button>
                </motion.div>
            </motion.div>
        </div>
    )
}
