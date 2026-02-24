"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop — High Immersion Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Modal Content — Studio Immersive Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                            "relative w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-none overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]",
                            className
                        )}
                    >
                        {/* Background Texture */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <filter id="noiseFilterModal">
                                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                                </filter>
                                <rect width="100%" height="100%" filter="url(#noiseFilterModal)" />
                            </svg>
                        </div>

                        {/* Scanning Line - Sutileza Studio */}
                        <div className="absolute left-0 right-0 h-[1px] bg-white/5 z-0 pointer-events-none animate-[studio-scan_10s_linear_infinite]" />

                        {/* Header */}
                        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/90 font-mono">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center border border-white/5 hover:border-white/20 hover:bg-white/5 text-white/40 hover:text-white transition-all"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="relative z-10 p-6">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
