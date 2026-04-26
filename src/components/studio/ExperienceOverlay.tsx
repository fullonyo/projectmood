"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Play, Activity } from "lucide-react"
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
                        <div className="space-y-6">
                            <div className="flex items-center justify-center gap-2 opacity-30 mb-8">
                                <Activity className="w-4 h-4 text-white" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                                    {t('public_page.overlay.title')}
                                </h3>
                            </div>

                            <p className="text-white text-6xl md:text-8xl font-black italic tracking-tighter leading-none opacity-90">
                                @{username}
                            </p>
                            <div className="h-[2px] w-24 bg-white/10 mx-auto" />
                        </div>

                        <button
                            onClick={onEnter}
                            className="group relative flex items-center justify-center w-28 h-28 mx-auto transition-all duration-700 active:scale-95"
                        >
                            {/* Inner technical marks */}
                            <div className="absolute inset-0 border border-white/10 rounded-none group-hover:border-white/40 transition-all duration-500" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white opacity-20 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white opacity-20 group-hover:opacity-100 transition-opacity" />

                            {/* Icon */}
                            <Play className="w-8 h-8 text-white fill-white group-hover:scale-110 transition-all duration-500 relative z-10" />
                        </button>

                        <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.5em] animate-pulse">
                            {t('public_page.overlay.click_to_enter')}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
