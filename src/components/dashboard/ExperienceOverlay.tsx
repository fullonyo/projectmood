"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Play } from "lucide-react"

interface ExperienceOverlayProps {
    isVisible: boolean
    onEnter: () => void
    username: string
}

export function ExperienceOverlay({ isVisible, onEnter, username }: ExperienceOverlayProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-3xl"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-center space-y-8 p-8"
                    >
                        <div className="space-y-2">
                            <h1 className="text-white/20 text-xs font-black uppercase tracking-[0.3em]">
                                MoodSpace
                            </h1>
                            <p className="text-white text-4xl font-light tracking-tight">
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

                        <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest animate-pulse">
                            Clique para entrar
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
