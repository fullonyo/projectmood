"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Activity } from "lucide-react"
import { useTranslation } from "@/i18n/context"

interface SidebarBackButtonProps {
    onClick: () => void;
    labelKey?: string;
}

export function SidebarBackButton({ onClick, labelKey = 'sidebar.library.inspector_back' }: SidebarBackButtonProps) {
    const { t } = useTranslation()

    return (
        <button
            onClick={onClick}
            className="w-full h-10 px-0 flex items-center justify-start hover:opacity-70 transition-opacity text-zinc-500 rounded-none mb-6 relative group"
        >
            <div className="w-6 h-6 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mr-3 group-hover:-translate-x-1 transition-transform bg-white dark:bg-zinc-950 relative">
                <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white opacity-20 group-hover:opacity-100 transition-opacity" />
                <ChevronLeft className="w-3 h-3 text-black dark:text-white" />
            </div>
            <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black dark:text-white">{t(labelKey)}</span>
            </div>
        </button>
    )
}
