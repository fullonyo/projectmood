import { BadgeCheck, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
    type?: string | null;
    className?: string;
    isVerified: boolean;
}

export function VerificationBadge({ type, className, isVerified }: VerificationBadgeProps) {
    if (!isVerified) return null;

    const config = {
        verified: {
            icon: BadgeCheck,
            color: "text-blue-500",
            label: "Verificado",
            bg: "bg-blue-500/10",
        },
        premium: {
            icon: Star,
            color: "text-amber-500",
            label: "Membro Premium",
            bg: "bg-amber-500/10",
        },
        notable: {
            icon: ShieldCheck,
            color: "text-purple-500",
            label: "Usuário Notável",
            bg: "bg-purple-500/10",
        }
    };

    const current = config[type as keyof typeof config] || config.verified;
    const Icon = current.icon;

    return (
        <div
            title={current.label}
            className={cn(
                "inline-flex items-center justify-center rounded-full p-0.5 transition-transform hover:scale-110 cursor-help",
                current.bg,
                className
            )}
        >
            <Icon className={cn("w-3.5 h-3.5", current.color)} />
        </div>
    );
}
