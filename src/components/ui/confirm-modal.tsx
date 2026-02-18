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
    // Fechar com ESC
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
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="relative w-full max-w-[320px] bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-8"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            {/* Icon */}
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center",
                                type === 'danger' ? "bg-red-50 dark:bg-red-900/20 text-red-500" : "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                            )}>
                                {type === 'danger' ? <AlertTriangle className="w-8 h-8" /> : <Info className="w-8 h-8" />}
                            </div>

                            {/* Text */}
                            <div className="space-y-1">
                                <h3 className="text-xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-zinc-100">
                                    {title}
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col w-full gap-2 pt-4">
                                <Button
                                    onClick={onConfirm}
                                    isLoading={isLoading}
                                    className={cn(
                                        "w-full rounded-2xl font-black uppercase tracking-widest text-xs h-12",
                                        type === 'danger' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white"
                                    )}
                                >
                                    {confirmText}
                                </Button>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="w-full h-10 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
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
