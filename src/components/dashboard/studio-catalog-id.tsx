"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

interface StudioCatalogIDProps {
    profileId: string
    createdAt?: string | Date
    views?: number
}

export function StudioCatalogID({ profileId, createdAt, views = 0 }: StudioCatalogIDProps) {
    const { t } = useTranslation()

    const catalogNumber = useMemo(() => {
        const date = createdAt ? new Date(createdAt) : new Date()
        const year = date.getFullYear().toString().slice(-2)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')

        // Dynamic Ranking Prefix
        let prefix = "CS" // Curated Space
        if (views > 1000) prefix = "VA" // Viral Atmosphere
        else if (views > 100) prefix = "HV" // High Vibration

        // Use the last 6 characters of the ID for higher uniqueness
        const uniquePart = profileId.slice(-6).toUpperCase()

        return `${prefix}-${year}${month}-${uniquePart}`
    }, [profileId, createdAt, views])

    return (
        <div className="fixed top-10 right-10 z-[60] mix-blend-difference pointer-events-none group">
            <div className="flex flex-col items-end">
                <span className="text-[7px] font-black uppercase tracking-[0.5em] opacity-30 group-hover:opacity-100 transition-opacity">
                    {t('public_page.catalog.title')}
                </span>
                <div className="flex items-center gap-3">
                    <div className="h-[1px] w-8 bg-current opacity-20" />
                    <span className="text-sm font-light tracking-[0.3em] font-mono opacity-40">
                        {catalogNumber}
                    </span>
                </div>
                <div className="mt-1 flex gap-1">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-1 h-1 bg-current opacity-10" />
                    ))}
                </div>
            </div>
        </div>
    )
}
