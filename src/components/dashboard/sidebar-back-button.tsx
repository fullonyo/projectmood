"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useTranslation } from "@/i18n/context"

interface SidebarBackButtonProps {
    onClick: () => void;
    labelKey?: string;
}

export function SidebarBackButton({ onClick, labelKey = 'sidebar.library.inspector_back' }: SidebarBackButtonProps) {
    const { t } = useTranslation()

    return (
        <Button
            variant="ghost"
            onClick={onClick}
            className="w-full justify-start h-10 px-0 hover:bg-transparent hover:opacity-70 transition-opacity text-zinc-500 rounded-none mb-6 relative group"
        >
            <div className="w-6 h-6 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mr-3 group-hover:-translate-x-1 transition-transform bg-white dark:bg-zinc-950">
                <ChevronLeft className="w-3 h-3 text-black dark:text-white" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black dark:text-white">{t(labelKey)}</span>
        </Button>
    )
}
