"use client"

import { useTransition } from "react"
import { toggleFeatureFlag } from "@/actions/system-config"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Lock, Power, CheckCircle2, Ban } from "lucide-react"

export function FeatureToggle({
    flag
}: {
    flag: { id: string, key: string, name: string, description: string | null, isEnabled: boolean, isPremium: boolean }
}) {
    const [isPending, startTransition] = useTransition()

    return (
        <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-zinc-900 bg-zinc-950/50 hover:bg-zinc-900/30 hover:border-zinc-800 transition-all duration-300">
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-[12px] font-black uppercase tracking-wider text-zinc-100 group-hover:text-white transition-colors">{flag.name}</h3>
                    <div className="h-px w-4 bg-zinc-800" />
                    <code className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-widest">
                        {flag.key}
                    </code>
                </div>
                {flag.description && (
                    <p className="text-[10px] text-zinc-500 font-mono tracking-tight leading-relaxed max-w-md italic">{flag.description}</p>
                )}
            </div>

            <div className="flex items-center gap-8">
                {/* VIP / Premium Toggle */}
                <div className="flex flex-col items-end gap-2">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-1.5 cursor-pointer group-hover:text-zinc-400 transition-colors">
                        <Lock className="w-2.5 h-2.5" /> VIP Exclusive
                    </label>
                    <div className="flex items-center gap-3">
                        <Switch
                            disabled={isPending}
                            checked={flag.isPremium}
                            onCheckedChange={() => startTransition(async () => { await toggleFeatureFlag(flag.key, "isPremium", flag.isPremium) })}
                            className={`${flag.isPremium ? 'data-[state=checked]:bg-amber-500' : 'data-[state=unchecked]:bg-zinc-900'}`}
                        />
                    </div>
                </div>

                <div className="w-px h-10 bg-zinc-900/50 hidden sm:block" />

                {/* Kill Switch (Enabled/Disabled) */}
                <div className="flex flex-col items-end gap-2 min-w-[100px]">
                    <div className="flex items-center gap-1.5">
                        {flag.isEnabled ? (
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Status: Live
                            </span>
                        ) : (
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-1">
                                <Ban className="w-2.5 h-2.5" /> Status: Offline
                            </span>
                        )}
                    </div>
                    <Switch
                        disabled={isPending}
                        checked={flag.isEnabled}
                        onCheckedChange={() => startTransition(async () => { await toggleFeatureFlag(flag.key, "isEnabled", flag.isEnabled) })}
                        className={`${flag.isEnabled ? 'data-[state=checked]:bg-emerald-500' : 'data-[state=unchecked]:bg-red-950/30'}`}
                    />
                </div>
            </div>
        </div>
    )
}
