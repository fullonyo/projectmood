"use client"

import { useState, useTransition } from "react"
import { useTranslation } from "@/i18n/context"
import { MOOD_TEMPLATES, MoodTemplate } from "@/lib/templates"
import { applyTemplateAction } from "@/actions/templates"
import { addMoodBlock } from "@/actions/profile"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export function TemplateChooser() {
    const { t } = useTranslation()
    const [isPending, startTransition] = useTransition()
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    const handleApply = (id: string) => {
        startTransition(async () => {
            const res = await applyTemplateAction(id)
            if (res.success) {
                toast.success(t('templates.applying'))
            } else {
                toast.error(res.error)
            }
        })
    }

    const handleStartFresh = () => {
        startTransition(async () => {
            const res = await addMoodBlock('text', { text: 'New Mood...', style: 'simple' }, { x: 50, y: 50 })
            if (res.success) {
                toast.success(t('templates.start_fresh'))
            } else {
                toast.error(res.error)
            }
        })
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center z-50 p-6 overflow-y-auto bg-zinc-950 backdrop-blur-3xl">
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
                <header className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white text-black text-[8px] font-black uppercase tracking-[0.3em] mb-4"
                    >
                        <Sparkles className="w-3 h-3" />
                        {t('templates.empty_state')}
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic text-white">
                        {t('templates.chooser_title')}
                    </h1>
                    <p className="text-zinc-500 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] max-w-lg mx-auto leading-relaxed">
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
                                    "group relative flex flex-col items-start p-8 transition-all duration-500 text-left border overflow-hidden shadow-2xl active:scale-95",
                                    template.profile.theme === 'dark' ? "bg-black border-zinc-800" : "bg-white border-zinc-200",
                                    isHovered ? "ring-2 ring-blue-500 border-transparent -translate-y-2" : ""
                                )}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Icon className="w-24 h-24 rotate-12" />
                                </div>

                                <div className={cn(
                                    "p-3 border mb-6 transition-all duration-500",
                                    template.profile.theme === 'dark' ? "bg-zinc-900 border-zinc-800 text-white" : "bg-zinc-50 border-zinc-100 text-black",
                                    isHovered ? "rotate-[-4deg] scale-110" : ""
                                )}>
                                    <Icon className="w-5 h-5" />
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
                        className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 hover:text-black dark:hover:text-white transition-colors py-4 px-8 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                    >
                        {t('templates.start_fresh')}
                    </button>
                </motion.div>
            </motion.div>
        </div>
    )
}
