"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle, Info } from "lucide-react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: "danger" | "info"
    isLoading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = "info",
    isLoading = false
}: ConfirmModalProps) {
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

                    {/* Modal — Studio Immersive Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                            "relative w-full max-w-[340px] bg-zinc-950/90 backdrop-blur-2xl border rounded-none overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] group",
                            type === 'danger' ? "border-red-500/20" : "border-white/10"
                        )}
                    >
                        {/* HUD Decoration */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
                        {/* Background Texture */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <filter id="noiseFilterConfirm">
                                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                                </filter>
                                <rect width="100%" height="100%" filter="url(#noiseFilterConfirm)" />
                            </svg>
                        </div>

                        {/* Top Indicator Strip - Extra Subtlety */}
                        <div className={cn(
                            "h-[1px] w-full",
                            type === 'danger' ? "bg-red-500/40" : "bg-white/10"
                        )} />

                        {/* Close Toggle */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center border border-white/5 hover:border-white/20 hover:bg-white/5 text-white/30 hover:text-white transition-all transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="relative z-10 flex flex-col items-center text-center px-8 py-10 space-y-6">
                            {/* Icon — Studio Geometric Shield */}
                            <div className={cn(
                                "w-16 h-16 flex items-center justify-center border transition-colors duration-500",
                                type === 'danger'
                                    ? "border-red-500/30 text-red-500 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                                    : "border-white/10 text-white bg-white/5"
                            )}>
                                {type === 'danger' ? <AlertTriangle className="w-7 h-7" /> : <Info className="w-7 h-7" />}
                            </div>

                            {/* Typography System */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/90 font-mono">
                                    {title}
                                </h3>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono leading-relaxed px-2">
                                    {message}
                                </p>
                            </div>

                            {/* Actions Group */}
                            <div className="flex flex-col w-full gap-3 pt-4">
                                <Button
                                    onClick={onConfirm}
                                    isLoading={isLoading}
                                    className={cn(
                                        "w-full h-11 font-black uppercase tracking-[0.4em] text-[9px] font-mono border rounded-none hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[4px_4px_0_0_rgba(255,255,255,0.05)] active:shadow-none hover:shadow-none",
                                        type === 'danger'
                                            ? "bg-red-500/80 hover:bg-red-500 text-white border-red-400/20"
                                            : "bg-white text-black border-white"
                                    )}
                                >
                                    {confirmText}
                                </Button>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="w-full h-10 text-[8px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white font-mono hover:bg-white/5 transition-all"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
