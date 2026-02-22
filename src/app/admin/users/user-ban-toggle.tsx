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
                        toast.success(nextStatus ? "Usuário banido" : "Usuário reativado")
                    } else {
                        toast.error(result.error || "Erro ao atualizar status")
                    }
                })
            }}
            disabled={isPending}
            className={`p-2 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest ${isBanned
                ? "text-zinc-500 hover:text-green-500"
                : "text-zinc-500 hover:text-red-500"
                } ${isPending ? "opacity-50 pointer-events-none" : ""}`}
            title={isBanned ? "Unban User" : "Ban User"}
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isBanned ? (
                <Unlock className="w-4 h-4" />
            ) : (
                <Ban className="w-4 h-4" />
            )}
        </button>
    )
}
