"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { checkUsernameAvailability } from "@/actions/register"

export function HeroClaimInput() {
    const { t } = useTranslation()
    const [username, setUsername] = useState("")
    const [isChecking, setIsChecking] = useState(false)
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (username.length < 3) {
            setIsAvailable(null)
            setIsChecking(false)
            return
        }

        setIsChecking(true)
        const timeoutId = setTimeout(async () => {
            try {
                const available = await checkUsernameAvailability(username)
                setIsAvailable(available)
            } catch (err) {
                setIsAvailable(null)
            } finally {
                setIsChecking(false)
            }
        }, 500) // 500ms debounce

        return () => clearTimeout(timeoutId)
    }, [username])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        // Limpeza real-time: remove espaços, @, maiúsculas, acentos, etc.
        const clean = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "")
        setUsername(clean)
    }

    const handleClaim = (e: React.FormEvent) => {
        e.preventDefault()
        if (!username || isAvailable === false) return

        router.push(`/auth/register?username=${username}`)
    }

    return (
        <form
            onSubmit={handleClaim}
            className="w-full max-w-xl mx-auto mt-12 group relative"
        >
            <div className={cn(
                "relative flex flex-col sm:flex-row items-stretch gap-0 border border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-500",
                isAvailable === false ? "border-red-500/50 focus-within:border-red-500/80" : 
                isAvailable === true ? "border-emerald-500/50 focus-within:border-emerald-500/80" : 
                "focus-within:border-white/30"
            )}>
                {/* Efeito de Glow */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-500 pointer-events-none" />

                <div className="flex-1 flex items-center px-6 py-4 border-r border-white/10 sm:border-r">
                    <span className="text-zinc-400 font-mono text-sm tracking-tighter mr-2 select-none">moodspace.com.br/</span>
                    <input
                        type="text"
                        value={username}
                        onChange={handleChange}
                        placeholder={t('landing.claim_username_placeholder')}
                        className="flex-1 w-full bg-transparent border-none outline-none text-white font-mono text-sm tracking-tighter placeholder:text-zinc-500"
                    />
                    
                    {/* Status Indicator */}
                    <div className="ml-2 w-4 h-4 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isChecking && (
                                <motion.div key="loader" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} className="text-zinc-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </motion.div>
                            )}
                            {!isChecking && isAvailable === true && (
                                <motion.div key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-emerald-400">
                                    <Check className="w-4 h-4" />
                                </motion.div>
                            )}
                            {!isChecking && isAvailable === false && (
                                <motion.div key="x" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-red-400">
                                    <X className="w-4 h-4" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isAvailable === false}
                    className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                    {t('landing.claim_username_btn')}
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            <p className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] h-4">
                <AnimatePresence mode="wait">
                    {isAvailable === true && (
                        <motion.span key="available" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-emerald-500 block">
                            {t('landing.claim_status_available')}
                        </motion.span>
                    )}
                    {isAvailable === false && (
                        <motion.span key="unavailable" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-red-500 block">
                            {t('landing.claim_status_taken')}
                        </motion.span>
                    )}
                    {isAvailable === null && (
                        <motion.span key="default" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-zinc-500 animate-pulse block">
                            {t('landing.claim_status_default')}
                        </motion.span>
                    )}
                </AnimatePresence>
            </p>
        </form>
    )
}
