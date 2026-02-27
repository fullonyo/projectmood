"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Play } from "lucide-react"
import { useTranslation } from "@/i18n/context"

interface ExperienceOverlayProps {
    isVisible: boolean
    onEnter: () => void
    username: string
}

export function ExperienceOverlay({ isVisible, onEnter, username }: ExperienceOverlayProps) {
    const { t } = useTranslation()

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-zinc-950/90 backdrop-blur-3xl overflow-hidden"
                >
                    {/* Analog Noise Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            <filter id="noiseFilter">
                                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                            </filter>
                            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                        </svg>
                    </div>

                    {/* Scanning Line */}
                    <div className="absolute left-0 right-0 h-[1px] bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] z-10 pointer-events-none animate-[studio-scan_8s_linear_infinite]" />

                    <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center space-y-12 p-12 relative z-20"
                    >
                        <div className="space-y-4">
                            <h1 className="text-white/30 text-[9px] font-black uppercase tracking-[0.6em] leading-none mb-4">
                                {t('public_page.overlay.title')}
                            </h1>
                            <div className="h-[1px] w-12 bg-white/10 mx-auto mb-6" />
                            <p className="text-white text-5xl font-extralight tracking-tighter leading-tight italic opacity-90">
                                @{username}
                            </p>
                        </div>

                        <button
                            onClick={onEnter}
                            className="group relative flex items-center justify-center w-20 h-20 mx-auto transition-all duration-500"
                        >
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500" />

                            {/* Circle Border */}
                            <div className="absolute inset-0 border border-white/20 rounded-full group-hover:scale-110 group-hover:border-white/40 transition-all duration-500" />

                            {/* Icon */}
                            <Play className="w-6 h-6 text-white fill-white group-hover:scale-110 transition-all duration-500 relative z-10" />
                        </button>

                        <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] animate-pulse">
                            {t('public_page.overlay.click_to_enter')}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
