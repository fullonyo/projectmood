"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function ViralBadge() {
    return (
        <Link
            href="/auth/register"
            className={cn(
                "fixed bottom-10 right-10 z-[60] group",
                "flex items-center gap-0 overflow-hidden",
                "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950",
                "rounded-full p-1.5 pr-6 shadow-2xl transition-all duration-500 hover:pr-8 hover:scale-105",
                "animate-in fade-in slide-in-from-right-10 duration-1000"
            )}
        >
            <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center transition-all duration-500 group-hover:rotate-90 group-hover:bg-blue-500 group-hover:text-white">
                <Plus className="w-4 h-4" />
            </div>

            <div className="flex flex-col ml-3">
                <span className="text-[7px] font-black uppercase tracking-[0.3em] opacity-40 leading-none mb-1 group-hover:opacity-100 transition-opacity">MoodSpace</span>
                <span className="text-[11px] font-black tracking-tighter leading-none uppercase italic">Claim Your Studio</span>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </Link>
    )
}
