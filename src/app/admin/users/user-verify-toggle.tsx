"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";
import { adminVerifyUser } from "@/actions/moderation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
                toast.success(nextVerified ? "Usuário verificado" : "Verificação removida");
            } else {
                toast.error(result.error || "Erro ao atualizar status");
                console.error(result.error);
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "h-8 w-8 flex items-center justify-center transition-all border border-transparent",
                isVerified
                    ? "text-blue-500 border-blue-500/20 bg-blue-500/5 shadow-[0_0_10px_rgba(59,130,246,0.05)]"
                    : "text-zinc-600 hover:text-white hover:border-zinc-800 hover:bg-zinc-900"
            )}
            title={isVerified ? "Remover Verificação" : "Verificar Usuário"}
        >
            {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            ) : (
                <BadgeCheck className={cn("w-3.5 h-3.5", isVerified ? "fill-current" : "")} />
            )}
        </button>
    );
}
