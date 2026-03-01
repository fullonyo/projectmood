"use client"

import { useAudio } from "./audio-context"
import { motion, AnimatePresence } from "framer-motion"

/**
 * GlobalLyricsOverlay - Renderizador universal de legendas 🎤🌌
 * Aparece na base da tela (fora dos blocos) quando o modo 'fullscreen' está ativo.
 */
export function GlobalLyricsOverlay() {
    const { activeLyrics, lyricsMode } = useAudio()

    // Renderiza sempre que houver uma legenda ativa (o SmartMedia controla o envio)
    if (!activeLyrics) return null

    return (
        <div className="fixed inset-x-0 bottom-16 sm:bottom-20 z-[9999] pointer-events-none flex flex-col items-center justify-center px-10 text-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeLyrics}
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col items-center gap-2"
                >
                    <span className="text-[8px] font-black tracking-[0.6em] opacity-40 uppercase text-black dark:text-white">
                        Global Lyrics // Studio System
                    </span>
                    <p className="text-2xl md:text-3xl font-black uppercase tracking-widest text-black dark:text-white leading-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] dark:drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        {activeLyrics}
                    </p>
                    {/* Linha técnica HUD */}
                    <div className="w-24 h-[1px] bg-current opacity-10 mt-2" />
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
