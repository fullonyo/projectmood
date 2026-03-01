"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, ArrowRight, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

interface GuestPromotionProps {
    username: string
}

export function GuestPromotion({ username }: GuestPromotionProps) {
    const { t } = useTranslation()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Delay to let the user enjoy the profile first
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 2500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-xl pointer-events-auto font-sans"
                >
                    <div className="bg-zinc-950/90 backdrop-blur-2xl border border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                        {/* Status Label (Signature Industrial Style) */}
                        <div className="absolute top-0 right-0 bg-white text-black text-[7px] font-black px-3 py-1 uppercase tracking-[0.3em] leading-none">
                            {t('auth.promotion.official_registry')}
                        </div>

                        {/* Technical corner accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                                <Shield className="w-6 h-6 text-white/20" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                        {t('auth.promotion.viewing_status')}
                                    </span>
                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse opacity-50" />
                                </div>
                                <h3 className="text-base font-black tracking-tighter text-white uppercase italic">
                                    @{username.toLowerCase()} mood
                                </h3>
                            </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                            <Link
                                href="/auth/register"
                                className={cn(
                                    "group relative flex items-center justify-center gap-4 px-10 py-4 bg-zinc-200 text-zinc-950 transition-all duration-300 hover:bg-white hover:scale-[1.02] active:scale-[0.98]",
                                    "text-[10px] font-black uppercase tracking-[0.25em] overflow-hidden shadow-xl"
                                )}
                            >
                                <UserPlus className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                                <span className="relative z-10">{t('auth.promotion.btn_claim')}</span>
                                <ArrowRight className="w-3.5 h-3.5 absolute right-3 opacity-0 group-hover:opacity-40 transition-all translate-x-1 group-hover:translate-x-0" />
                            </Link>
                        </div>
                    </div>

                    {/* Technical Metadata Footer */}
                    <div className="flex justify-between items-center px-4 mt-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.4em]">MoodSpace // v3.1 Master</span>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-[7px] font-mono text-white/40 uppercase tracking-widest hover:text-white transition-colors border-b border-white/10 hover:border-white/40 pb-0.5"
                        >
                            {t('auth.promotion.dismiss')}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
