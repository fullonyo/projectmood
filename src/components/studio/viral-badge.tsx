"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

export function ViralBadge() {
    const { t } = useTranslation()
    return (
        <Link
            href="/auth/register"
            className={cn(
                "fixed bottom-10 right-10 z-[60] mix-blend-difference group",
                "flex flex-col items-end pointer-events-auto"
            )}
        >
            <div className="flex items-center gap-3 mb-1">
                <span className="text-[7px] font-black uppercase tracking-[0.5em] opacity-30 group-hover:opacity-100 transition-opacity">
                    {t('public_page.badge.auth_access')}
                </span>
                <div className="h-[1px] w-4 bg-current opacity-20" />
            </div>

            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end group-hover:-translate-x-1 transition-transform duration-500">
                    <span className="text-[10px] font-black tracking-widest uppercase leading-none mb-0.5">
                        {t('public_page.badge.claim')}
                    </span>
                    <div className="flex items-center gap-1.5 opacity-40">
                        <span className="text-[6px] font-bold uppercase tracking-tighter italic">{t('public_page.badge.open')}</span>
                        <div className="w-1 h-1 bg-current animate-pulse" />
                    </div>
                </div>

                <div className="w-9 h-9 border border-current flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-current">
                    <ShieldAlert className="w-4 h-4 group-hover:mix-blend-difference group-hover:invert" />
                </div>
            </div>

            {/* Studio Technical Footer */}
            <div className="mt-2 flex flex-col items-end opacity-20 group-hover:opacity-100 transition-opacity">
                <div className="h-[1px] w-12 bg-current mb-1" />
                <span className="text-[5px] font-mono uppercase tracking-[0.2em]">{t('public_page.badge.footer')}</span>
            </div>
        </Link>
    )
}
