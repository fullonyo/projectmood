"use client"

import { useState } from "react"
import { Link2, Check } from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { MinimalTooltip } from "@/components/ui/minimal-tooltip"

interface ShareProfileButtonProps {
    username: string
    isPrimary?: boolean
    slug?: string
    minimal?: boolean
}

export function ShareProfileButton({ username, isPrimary = true, slug, minimal = false }: ShareProfileButtonProps) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)

    const path = isPrimary ? `/@${username.toLowerCase()}` : `/@${username.toLowerCase()}/${slug}`
    const profileUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${path}`
        : `https://mood.space${path}`

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(profileUrl)
            setCopied(true)
            toast.success(t('editors.share.copied') || "Link copiado!")
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
            toast.error("Falha ao copiar link")
        }
    }

    return (
        <MinimalTooltip content={copied ? (t('editors.share.copied') || "Copiado!") : (t('editors.share.link') || "Copiar Link")}>
            <button
                onClick={handleCopyLink}
                className={cn(
                    "flex items-center justify-center transition-all duration-500 p-2",
                    minimal 
                        ? "text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                        : "w-full h-12 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-[9px] font-bold uppercase tracking-widest gap-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm",
                    copied && "text-emerald-500"
                )}
            >
                {copied ? (
                    <Check className={cn(minimal ? "w-5 h-5" : "w-3.5 h-3.5", "animate-in zoom-in duration-300")} />
                ) : (
                    <Link2 className={cn(minimal ? "w-5 h-5" : "w-3.5 h-3.5")} />
                )}
                {!minimal && (copied ? t('editors.share.copied') : t('editors.share.link'))}
            </button>
        </MinimalTooltip>
    )
}
