"use client"

import { cn } from "@/lib/utils"
import { ShieldCheck } from "lucide-react"
import { useTranslation } from "@/i18n/context"

interface ProfileSignatureProps {
    username: string
    name?: string
    avatarUrl?: string
    isVerified?: boolean
}

export function ProfileSignature({ username, name, avatarUrl, isVerified = true }: ProfileSignatureProps) {
    const { t } = useTranslation()

    return (
        <header className="fixed top-4 left-4 sm:top-10 sm:left-10 z-50 mix-blend-difference group pointer-events-none">
            <div className="flex items-start gap-5">
                {/* Studio Avatar - High Fashion Style */}
                <div className="relative pointer-events-auto">
                    <div className="w-16 h-16 bg-white dark:bg-zinc-950 overflow-hidden border border-black dark:border-white transition-all duration-500 group-hover:scale-105 rounded-none">
                        <img
                            src={avatarUrl || `https://avatar.vercel.sh/${username}`}
                            alt={username}
                            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                        />
                    </div>
                    {/* Active Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-zinc-950 flex items-center justify-center rounded-none border border-black dark:border-white shadow-none">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-none animate-pulse" />
                    </div>
                </div>

                {/* Studio Credentials */}
                <div className="flex flex-col pt-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-40">{t('public_page.signature.role')}</span>
                        {isVerified && <ShieldCheck className="w-2.5 h-2.5 opacity-40" />}
                    </div>

                    <h1 className="text-2xl font-black tracking-tighter leading-none mb-1 group-hover:translate-x-1 transition-transform duration-500">
                        {name || username}
                    </h1>

                    <div className="flex items-center gap-2 opacity-40 group-hover:opacity-80 transition-opacity duration-500">
                        <span className="text-[10px] font-bold tracking-tighter italic">@{username.toLowerCase()}</span>
                        <div className="w-4 h-[1px] bg-current" />
                        <span className="text-[8px] font-black uppercase tracking-widest">{t('public_page.signature.studio')}</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
