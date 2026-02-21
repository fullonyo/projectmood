import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: string
        isUp: boolean
    }
    highlight?: boolean
    className?: string
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    highlight = false,
    className
}: MetricCardProps) {
    return (
        <div className={cn(
            "p-6 border transition-all duration-300 group relative overflow-hidden",
            highlight
                ? "border-zinc-700 bg-zinc-900 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                : "border-zinc-900 bg-[#0a0a0a] hover:border-zinc-800",
            className
        )}>
            {/* Subtle Gradient background for highlight */}
            {highlight && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            )}

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        {title}
                    </span>
                    <div className={cn(
                        "p-2 border transition-colors",
                        highlight ? "border-zinc-700 bg-zinc-800" : "border-zinc-900 bg-zinc-950"
                    )}>
                        <Icon className={cn("w-4 h-4", highlight ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
                    </div>
                </div>

                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black tracking-tighter text-[#ededed]">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </h3>

                    {trend && (
                        <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5",
                            trend.isUp ? "text-emerald-500" : "text-red-500"
                        )}>
                            {trend.isUp ? "↑" : "↓"} {trend.value}
                        </span>
                    )}
                </div>

                {(description || trend) && (
                    <p className="mt-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        {description || "Metrics calculated in real-time"}
                    </p>
                )}
            </div>
        </div>
    )
}
