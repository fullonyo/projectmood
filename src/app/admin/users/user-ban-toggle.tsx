"use client"

import { useTransition } from "react"
import { toggleBanUser } from "@/actions/admin"
import { Ban, Unlock } from "lucide-react"

export function UserBanToggle({ userId, isBanned }: { userId: string, isBanned: boolean }) {
    const [isPending, startTransition] = useTransition()

    return (
        <button
            onClick={() => {
                startTransition(() => {
                    toggleBanUser(userId, isBanned)
                })
            }}
            disabled={isPending}
            className={`p-2 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest ${isBanned
                    ? "text-zinc-500 hover:text-green-500"
                    : "text-zinc-500 hover:text-red-500"
                } ${isPending ? "opacity-50 pointer-events-none" : ""}`}
            title={isBanned ? "Unban User" : "Ban User"}
        >
            {isBanned ? (
                <>
                    <Unlock className="w-4 h-4" />
                </>
            ) : (
                <>
                    <Ban className="w-4 h-4" />
                </>
            )}
        </button>
    )
}
