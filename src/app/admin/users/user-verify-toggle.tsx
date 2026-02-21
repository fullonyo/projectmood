"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";
import { adminVerifyUser } from "@/actions/moderation";
import { cn } from "@/lib/utils";

interface UserVerifyToggleProps {
    userId: string;
    isVerified: boolean;
    verificationType: string | null;
}

export function UserVerifyToggle({ userId, isVerified: initialVerified, verificationType }: UserVerifyToggleProps) {
    const [isPending, startTransition] = useTransition();
    const [isVerified, setIsVerified] = useState(initialVerified);

    const handleToggle = () => {
        const nextVerified = !isVerified;

        startTransition(async () => {
            const result = await adminVerifyUser(userId, nextVerified, "verified");
            if (result.success) {
                setIsVerified(nextVerified);
            } else {
                // Could add toast here
                console.error(result.error);
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "p-2 rounded-md transition-all flex items-center justify-center gap-2",
                isVerified
                    ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                    : "text-zinc-500 hover:text-white hover:bg-zinc-800"
            )}
            title={isVerified ? "Remover Verificação" : "Verificar Usuário"}
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            ) : (
                <BadgeCheck className={cn("w-4 h-4", isVerified ? "fill-current" : "")} />
            )}
        </button>
    );
}
