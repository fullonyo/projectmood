"use client"

import { useTranslation } from "@/i18n/context"
import { Room } from "@/types/database"
import { cn } from "@/lib/utils"
import { Camera, Loader2 } from "lucide-react"

interface IdentitySectionProps {
    currentName: string | null
    currentUsername: string
    profile: Room
    userAvatar: string | null
    publishedAt?: Date | string | null
    hasUnpublishedChanges?: boolean
    /** Callback para acionar o seletor de arquivo de avatar (opcional) */
    onAvatarClick?: () => void
    isUploading?: boolean
}

export function IdentitySection({
    currentName,
    currentUsername,
    profile,
    userAvatar,
    publishedAt,
    hasUnpublishedChanges,
    onAvatarClick,
    isUploading = false
}: IdentitySectionProps) {
    const { t, dict } = useTranslation()

    // Cascata: avatar da sala atual → avatar do espaço primário (passado via userAvatar) → placeholder gerado
    const avatarSrc = profile.avatarUrl || userAvatar || `https://avatar.vercel.sh/${currentUsername}`
    const isDraft = hasUnpublishedChanges ?? !publishedAt

    return (
        <div className="space-y-8">
            <div className="flex flex-col items-center text-center gap-4">
                {/* Avatar — Organic Floating Style */}
                <div className="relative group shrink-0">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-0 group-hover:opacity-100" />
                    <button
                        type="button"
                        onClick={onAvatarClick}
                        disabled={isUploading || !onAvatarClick}
                        className={cn(
                            "relative w-24 h-24 rounded-[2.5rem] overflow-hidden bg-zinc-50 dark:bg-white/5 transition-all duration-500",
                            onAvatarClick && "cursor-pointer hover:rounded-[1.5rem] active:scale-95",
                            !onAvatarClick && "cursor-default",
                            isUploading && "opacity-60"
                        )}
                        aria-label="Alterar avatar"
                    >
                        <img
                            src={avatarSrc}
                            alt={currentUsername}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />

                        {isUploading && (
                            <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-zinc-950 dark:text-white animate-spin" />
                            </div>
                        )}

                        {onAvatarClick && !isUploading && (
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                <Camera className="w-5 h-5 text-white/70" />
                            </div>
                        )}
                    </button>
                </div>

                <div className="flex flex-col items-center">
                    <h4 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white italic leading-none mb-2">
                        {currentName || currentUsername}
                    </h4>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-1 h-1 rounded-full",
                            isDraft ? "bg-amber-400" : "bg-emerald-500"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                            @{currentUsername.toLowerCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Contexto do espaço — Minimalist Divider */}
            <div className="relative pt-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
                
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[7px] uppercase font-black text-zinc-400 tracking-[0.4em]">
                        {dict.multiverse.current_space_label}
                    </p>
                    <p className="text-[11px] font-black uppercase text-zinc-950 dark:text-white tracking-widest">
                        {profile.title || (profile.isPrimary ? dict.multiverse.primary_space : dict.multiverse.pocket_dimension)}
                    </p>
                </div>
            </div>
        </div>
    )
}
