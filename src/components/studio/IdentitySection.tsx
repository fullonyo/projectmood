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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                {/* Avatar — clicável se onAvatarClick for fornecido */}
                <div className="relative group shrink-0">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                    <button
                        type="button"
                        onClick={onAvatarClick}
                        disabled={isUploading || !onAvatarClick}
                        className={cn(
                            "relative w-16 h-16 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300",
                            onAvatarClick && "cursor-pointer hover:ring-2 hover:ring-blue-400/50 active:scale-95",
                            !onAvatarClick && "cursor-default",
                            isUploading && "opacity-60"
                        )}
                        aria-label="Alterar avatar"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={avatarSrc}
                            alt={currentUsername}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Overlay de loading */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                            </div>
                        )}

                        {/* Overlay de câmera (apenas quando clicável e não carregando) */}
                        {onAvatarClick && !isUploading && (
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                                <Camera className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </button>
                </div>

                <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 leading-none mb-1.5">
                        {t('leftSidebar.identity_protocol')}
                    </span>
                    <h4 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white truncate">
                        {currentName || currentUsername}
                    </h4>
                    <span className="text-[9px] font-medium text-blue-500/70 mt-1">
                        @{currentUsername.toLowerCase()}
                    </span>
                </div>
            </div>

            {/* Contexto do espaço + status de publicação */}
            <div className="flex items-center justify-between pt-5 border-t border-zinc-50 dark:border-zinc-800/50">
                <div className="flex flex-col min-w-0 mr-4">
                    <p className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest mb-1">
                        {dict.multiverse.current_space_label}
                    </p>
                    <p className="text-[10px] font-bold uppercase text-zinc-900 dark:text-zinc-300 truncate">
                        {profile.title || (profile.isPrimary ? dict.multiverse.primary_space : dict.multiverse.pocket_dimension)}
                    </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                    <p className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest mb-1">
                        {t('leftSidebar.system_status')}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isDraft
                                ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        )} />
                        <p className={cn(
                            "text-[10px] font-bold uppercase tracking-tighter",
                            isDraft ? "text-amber-600" : "text-emerald-600"
                        )}>
                            {isDraft ? t('publish.unpublished_changes') : t('publish.synced')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
