"use client"

import { useTranslation } from "@/i18n/context"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ className, lightText = false }: { className?: string, lightText?: boolean }) {
    const { locale, setLocale } = useTranslation()

    const activeClass = lightText 
        ? "opacity-100 text-white underline underline-offset-4" 
        : "opacity-100 text-zinc-900 dark:text-white underline underline-offset-4";
        
    const inactiveClass = lightText 
        ? "opacity-50 text-white/70 hover:opacity-100 hover:text-white" 
        : "opacity-50 text-zinc-500 hover:opacity-100";
        
    const separatorClass = lightText ? "text-white/30" : "opacity-20 text-zinc-400";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <button
                onClick={() => setLocale('pt')}
                className={cn(
                    "text-[8px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105",
                    locale === 'pt' ? activeClass : inactiveClass
                )}
            >
                PT
            </button>
            <span className={cn("text-[8px]", separatorClass)}>/</span>
            <button
                onClick={() => setLocale('en')}
                className={cn(
                    "text-[8px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105",
                    locale === 'en' ? activeClass : inactiveClass
                )}
            >
                EN
            </button>
        </div>
    )
}
