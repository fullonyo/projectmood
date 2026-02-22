"use client"

import { useState, useEffect } from "react"
import { Activity, Database, Server, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export function SystemHealth() {
    const [health, setHealth] = useState({
        db: { status: "online", latency: "14ms" },
        api: { status: "online", uptime: "99.9%" },
        schema: { version: "2024.02.21", migration: "ok" }
    })

    // In a real app, this could be a server action call
    useEffect(() => {
        const interval = setInterval(() => {
            setHealth(prev => ({
                ...prev,
                db: { ...prev.db, latency: `${Math.floor(Math.random() * 5) + 10}ms` }
            }))
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="border border-zinc-900 bg-[#0a0a0a] p-8">
            <header className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-emerald-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">System Integrity</h3>
                <span className="ml-auto text-[10px] font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    All Systems Operational
                </span>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4 p-4 border border-zinc-900/50 bg-zinc-950/30 group hover:border-zinc-800 transition-colors">
                    <Database className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Database Engine</p>
                        <p className="text-sm font-black tracking-tighter">PostgreSQL v15</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-600">Latency:</span>
                            <span className="text-[10px] font-mono text-emerald-500">{health.db.latency}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-zinc-900/50 bg-zinc-950/30 group hover:border-zinc-800 transition-colors">
                    <Server className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Internal API</p>
                        <p className="text-sm font-black tracking-tighter">Node.js / Next.js</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-600">Health:</span>
                            <span className="text-[10px] font-mono text-emerald-500">100% Stability</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-zinc-900/50 bg-zinc-950/30 group hover:border-zinc-800 transition-colors">
                    <Clock className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Schema Sync</p>
                        <p className="text-sm font-black tracking-tighter">Prisma 6.1.6</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-600">Sync:</span>
                            <span className="text-[10px] font-mono text-emerald-500">Version Verified</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
