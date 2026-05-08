"use client"

import { useTranslation } from "@/i18n/context"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ className }: { className?: string }) {
    const { locale, setLocale } = useTranslation()

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <button
                onClick={() => setLocale('pt')}
                className={cn(
                    "text-[8px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105",
                    locale === 'pt' ? "opacity-100 text-zinc-900 dark:text-white underline underline-offset-4" : "opacity-50 text-zinc-500 hover:opacity-100"
                )}
            >
                PT
            </button>
            <span className="text-[8px] opacity-20 text-zinc-400">/</span>
            <button
                onClick={() => setLocale('en')}
                className={cn(
                    "text-[8px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105",
                    locale === 'en' ? "opacity-100 text-zinc-900 dark:text-white underline underline-offset-4" : "opacity-50 text-zinc-500 hover:opacity-100"
                )}
            >
                EN
            </button>
        </div>
    )
}
