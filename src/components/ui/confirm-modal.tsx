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
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                            "relative w-full max-w-[360px] bg-white dark:bg-zinc-950 border rounded-[2rem] overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.2)]",
                            type === 'danger' ? "border-red-100 dark:border-red-900/30" : "border-zinc-100 dark:border-zinc-800"
                        )}
                    >
                        {/* Close Toggle */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col items-center text-center px-8 py-10">
                            {/* Icon Container */}
                            <div className={cn(
                                "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-all shadow-sm",
                                type === 'danger'
                                    ? "bg-red-50 text-red-500 dark:bg-red-900/20"
                                    : "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                            )}>
                                {type === 'danger' ? <AlertTriangle className="w-8 h-8" /> : <Info className="w-8 h-8" />}
                            </div>

                            {/* Typography */}
                            <div className="space-y-3 mb-10">
                                <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                                    {title}
                                </h3>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            {/* Actions Group */}
                            <div className="flex flex-col w-full gap-3">
                                <Button
                                    onClick={onConfirm}
                                    isLoading={isLoading}
                                    className={cn(
                                        "w-full h-14 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg",
                                        type === 'danger'
                                            ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                                    )}
                                >
                                    {confirmText}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                                >
                                    {cancelText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
