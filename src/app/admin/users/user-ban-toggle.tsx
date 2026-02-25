"use client"

import { useTransition } from "react"
import { adminBanUser } from "@/actions/moderation"
import { Ban, Unlock, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function UserBanToggle({ userId, isBanned }: { userId: string, isBanned: boolean }) {
    const [isPending, startTransition] = useTransition()

    return (
        <button
            onClick={() => {
                const nextStatus = !isBanned;
                startTransition(async () => {
                    const result = await adminBanUser(userId, nextStatus)
                    if (result.success) {
                        toast.success(nextStatus ? "Usuário isolado" : "Usuário reintegrado")
                    } else {
                        toast.error(result.error || "Erro no protocolo")
                    }
                })
            }}
            disabled={isPending}
            className={`h-8 w-8 flex items-center justify-center transition-all border border-transparent ${isBanned
                ? "text-emerald-500 hover:border-emerald-500/20 hover:bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                : "text-zinc-600 hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                } ${isPending ? "opacity-50 pointer-events-none" : ""}`}
            title={isBanned ? "Unban User" : "Ban User"}
        >
            {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isBanned ? (
                <Unlock className="w-3.5 h-3.5" />
            ) : (
                <Ban className="w-3.5 h-3.5" />
            )}
        </button>
    )
}
