"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface UsageChartProps {
    data: { type: string; count: number }[]
    title: string
}

export function UsageChart({ data, title }: UsageChartProps) {
    const max = Math.max(...data.map(d => d.count), 1)

    return (
        <div className="p-8 border border-zinc-900 bg-[#0a0a0a] h-full">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-white" />
                    <h3 className="text-sm font-black uppercase tracking-widest">{title}</h3>
                </div>
                <div className="px-3 py-1 border border-zinc-800 text-[9px] font-mono text-zinc-500 uppercase">
                    Distribution Log
                </div>
            </header>

            <div className="space-y-5">
                {data.map((item, idx) => (
                    <div key={item.type} className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                {item.type.replace('block_', '')}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                                {item.count} <span className="text-zinc-700">/ items</span>
                            </span>
                        </div>
                        <div className="h-2 bg-zinc-900 relative overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-white transition-all duration-1000 ease-out"
                                style={{
                                    width: `${(item.count / max) * 100}%`,
                                    transitionDelay: `${idx * 100}ms`
                                }}
                            />
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="h-[300px] flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-900">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Data Transmitted</p>
                    </div>
                )}
            </div>
        </div>
    )
}
