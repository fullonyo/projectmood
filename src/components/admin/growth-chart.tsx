"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GrowthChartProps {
    data: { label: string; count: number }[]
    title: string
}

export function GrowthChart({ data, title }: GrowthChartProps) {
    const max = Math.max(...data.map(d => d.count), 1)

    return (
        <div className="p-8 border border-zinc-900 bg-[#0a0a0a] h-full flex flex-col">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-emerald-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">{title}</h3>
                </div>
                <div className="px-3 py-1 border border-zinc-800 text-[9px] font-mono text-zinc-500 uppercase">
                    30-Day Trajectory
                </div>
            </header>

            <div className="flex-1 flex items-end gap-[2px] h-48 group">
                {data.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex-1 bg-zinc-900/50 relative group/bar hover:bg-zinc-800 transition-colors"
                        style={{ height: "100%" }}
                    >
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-emerald-500/80 group-hover/bar:bg-emerald-400 transition-all duration-700 ease-out"
                            style={{
                                height: `${(item.count / max) * 100}%`,
                                transitionDelay: `${idx * 20}ms`
                            }}
                        />

                        {/* Tooltip-like info on hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                            {item.count} REGISTROS
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-between text-[8px] font-mono text-zinc-600 uppercase tracking-tighter">
                <span>{data[0]?.label}</span>
                <span>{data[Math.floor(data.length / 2)]?.label}</span>
                <span>{data[data.length - 1]?.label}</span>
            </div>
        </div>
    )
}
