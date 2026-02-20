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
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
                    />

                    {/* Modal — Caixa Bruta */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="relative w-full max-w-[340px] bg-white dark:bg-zinc-950 border-2 border-black dark:border-white overflow-hidden"
                    >
                        {/* Faixa superior de contexto (Danger / Info) */}
                        <div className={cn(
                            "h-1 w-full",
                            type === 'danger' ? "bg-red-500" : "bg-black dark:bg-white"
                        )} />

                        {/* Botão Fechar */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center border border-transparent hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-zinc-400"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex flex-col items-center text-center px-8 py-8 space-y-5">
                            {/* Ícone — Quadrado brutalist */}
                            <div className={cn(
                                "w-14 h-14 flex items-center justify-center border-2",
                                type === 'danger'
                                    ? "border-red-500 text-red-500 bg-red-500/5"
                                    : "border-black dark:border-white text-black dark:text-white bg-black/5 dark:bg-white/5"
                            )}>
                                {type === 'danger' ? <AlertTriangle className="w-7 h-7" /> : <Info className="w-7 h-7" />}
                            </div>

                            {/* Texto */}
                            <div className="space-y-2">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-zinc-100">
                                    {title}
                                </h3>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            {/* Ações */}
                            <div className="flex flex-col w-full gap-2 pt-2">
                                <Button
                                    onClick={onConfirm}
                                    isLoading={isLoading}
                                    className={cn(
                                        "w-full h-12 font-black uppercase tracking-[0.3em] text-[10px] border-2 hover:scale-[1.02] active:scale-95 transition-all",
                                        type === 'danger'
                                            ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                                            : "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                                    )}
                                >
                                    {confirmText}
                                </Button>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="w-full h-10 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all"
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
