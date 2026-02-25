"use client"

import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

interface ConfigCategoryProps {
    title: string
    description: string
    icon: ReactNode
    children: ReactNode
}

export function ConfigCategory({
    title,
    description,
    icon,
    children
}: ConfigCategoryProps) {
    return (
        <section className="space-y-6">
            <header className="flex items-start gap-4 px-1 group">
                <div className="mt-1 p-2 border border-zinc-900 bg-zinc-950 text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-colors">
                    {icon}
                </div>
                <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-100">{title}</h2>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1 tracking-tight">{description}</p>
                </div>
            </header>
            <div className="grid gap-3">
                {children}
            </div>
        </section>
    )
}
