"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, ArrowRight, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface GuestPromotionProps {
    username: string
}

export function GuestPromotion({ username }: GuestPromotionProps) {
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
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xl pointer-events-auto"
                >
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
                        {/* Status Label (Industrial Style) */}
                        <div className="absolute -top-2.5 left-4 bg-white text-black text-[8px] font-black px-2 py-0.5 uppercase tracking-widest">
                            Official Registry
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border border-white/20 flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5 text-white/40" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Viewing Studio Instance</span>
                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                </div>
                                <h3 className="text-sm font-black tracking-tight text-white uppercase">
                                    @{username.toLowerCase()} space
                                </h3>
                            </div>
                        </div>

                        <Link
                            href="/auth/register"
                            className={cn(
                                "group relative flex items-center gap-3 px-6 py-3 bg-white text-black transition-all hover:pr-8",
                                "text-[11px] font-black uppercase tracking-widest overflow-hidden"
                            )}
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Claim Your Space</span>
                            <ArrowRight className="w-4 h-4 absolute right-2 opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                    </div>

                    {/* Technical Metadata Footer */}
                    <div className="flex justify-between items-center px-4 mt-2">
                        <span className="text-[6px] font-mono text-white/20 uppercase tracking-[0.4em]">Encrypted Connection // Protocol Alpha</span>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-[6px] font-mono text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            [ Dismiss Console ]
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
