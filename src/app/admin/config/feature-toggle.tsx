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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-zinc-900 bg-[#0a0a0a] hover:bg-zinc-900/50 transition-colors">
            <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-wide">{flag.name}</h3>
                    <Badge variant="outline" className="text-[9px] font-mono tracking-wider border-zinc-800 text-zinc-500 rounded-none bg-zinc-950 px-1.5 leading-none py-0.5">
                        {flag.key}
                    </Badge>
                </div>
                {flag.description && (
                    <p className="text-xs text-zinc-500 font-mono">{flag.description}</p>
                )}
            </div>

            <div className="flex items-center gap-6">
                {/* VIP / Premium Toggle */}
                <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 cursor-pointer">
                        <Lock className="w-3 h-3" /> VIP Only
                    </label>
                    <Switch
                        disabled={isPending}
                        checked={flag.isPremium}
                        onCheckedChange={() => startTransition(() => toggleFeatureFlag(flag.key, "isPremium", flag.isPremium))}
                        className={`${flag.isPremium ? 'bg-amber-500' : 'bg-zinc-800'}`}
                    />
                </div>

                <div className="w-px h-8 bg-zinc-900 hidden sm:block" />

                {/* Kill Switch (Enabled/Disabled) */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 min-w-[70px] justify-end">
                        {flag.isEnabled ? (
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Live
                            </span>
                        ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
                                <Ban className="w-3 h-3" /> Offline
                            </span>
                        )}
                    </div>
                    <Switch
                        disabled={isPending}
                        checked={flag.isEnabled}
                        onCheckedChange={() => startTransition(() => toggleFeatureFlag(flag.key, "isEnabled", flag.isEnabled))}
                        className={`${flag.isEnabled ? 'bg-emerald-500' : 'bg-red-500/50'}`}
                    />
                </div>
            </div>
        </div>
    )
}
