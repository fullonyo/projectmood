"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

export function HeroClaimInput() {
    const { t } = useTranslation()
    const [username, setUsername] = useState("")
    const router = useRouter()

    const handleClaim = (e: React.FormEvent) => {
        e.preventDefault()
        if (!username) return
        
        // Limpar o username (remover espaços, @, etc)
        const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "")
        router.push(`/auth/register?username=${cleanUsername}`)
    }

    return (
        <form 
            onSubmit={handleClaim}
            className="w-full max-w-xl mx-auto mt-12 group"
        >
            <div className="relative flex flex-col sm:flex-row items-stretch gap-0 border border-white/10 bg-black/40 backdrop-blur-xl focus-within:border-white/30 transition-all duration-500">
                {/* Efeito de Glow (ReactBits DNA) */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex-1 flex items-center px-6 py-4 border-r border-white/10 sm:border-r">
                    <span className="text-zinc-500 font-mono text-sm tracking-tighter mr-2 select-none">moodspace.com.br/</span>
                    <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t('landing.claim_username_placeholder')}
                        className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm tracking-tighter placeholder:text-zinc-700"
                    />
                </div>

                <button 
                    type="submit"
                    className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    {t('landing.claim_username_btn')}
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>
            
            <p className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 animate-pulse">
                Disponibilidade limitada para curadores
            </p>
        </form>
    )
}
