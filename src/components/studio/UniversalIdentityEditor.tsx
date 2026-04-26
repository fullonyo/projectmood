"use client"

import { useState, useTransition } from "react"
import { User, AtSign, Globe, Check } from "lucide-react"
import { EditorHeader, EditorSection, EditorActionButton } from "./EditorUI"
import { updateProfile } from "@/actions/profile"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/i18n/context"
import { cn } from "@/lib/utils"

interface UniversalIdentityEditorProps {
    currentName: string
    currentUsername: string
    onClose: () => void
}

export function UniversalIdentityEditor({ currentName, currentUsername, onClose }: UniversalIdentityEditorProps) {
    const { t } = useTranslation()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    
    const [name, setName] = useState(currentName || "")
    const [username, setUsername] = useState(currentUsername || "")
    const [error, setError] = useState<string | null>(null)

    const isChanged = name !== (currentName || "") || username !== (currentUsername || "")

    const handleSave = () => {
        if (!isChanged) {
            onClose()
            return
        }

        setError(null)
        startTransition(async () => {
            const result = await updateProfile({ 
                name: name.trim(), 
                username: username.trim().toLowerCase() 
            })

            if (result?.error) {
                setError(result.error)
                // Traduz o erro se for o conhecido de username em uso
                const errorMessage = result.error === "Este nome de usuário já está em uso por outra conta." 
                    ? t('editors.identity.error_in_use') 
                    : result.error
                toast.error(errorMessage)
            } else {
                toast.success(t('editors.identity.success') || "Identidade atualizada")
                router.refresh()
                onClose()
            }
        })
    }

    return (
        <div className="flex flex-col h-full">
            <EditorHeader 
                title={t('editors.identity.title')} 
                subtitle={t('editors.identity.subtitle')}
                onClose={onClose}
            />

            <div className="flex-1 overflow-y-auto space-y-12 pb-24 custom-scrollbar">
                {/* Display Name Section */}
                <EditorSection title={t('editors.identity.display_name_label')}>
                    <div className="space-y-3">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="visual name..."
                                className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-2xl pl-12 pr-4 text-[13px] font-bold tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm placeholder:text-zinc-400 transition-all"
                            />
                        </div>
                        <p className="text-[10px] text-zinc-400 px-1 lowercase italic">
                            {t('editors.identity.display_name_hint')}
                        </p>
                    </div>
                </EditorSection>

                {/* Username Section */}
                <EditorSection title={t('editors.identity.username_label')}>
                    <div className="space-y-3">
                        <div className="relative group">
                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                placeholder="alias"
                                className={cn(
                                    "w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-2xl pl-12 pr-4 text-[13px] font-bold lowercase tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm placeholder:text-zinc-400 transition-all",
                                    error ? "ring-1 ring-red-500/50" : ""
                                )}
                            />
                        </div>
                        <p className="text-[10px] text-zinc-400 px-1 lowercase italic">
                            {t('editors.identity.username_hint')}
                        </p>
                    </div>
                </EditorSection>

                {/* Preview Section */}
                <EditorSection title={t('editors.identity.tab_view_label')}>
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50 flex items-center gap-3">
                        <Globe className="w-4 h-4 text-zinc-400" />
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                            {username || 'nyo'} — moodspace
                        </span>
                        <div className="ml-auto flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400/20" />
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/20" />
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/20" />
                        </div>
                    </div>
                </EditorSection>

                {error && (
                    <div className="text-[10px] font-bold uppercase tracking-tight text-red-500 px-1 pt-2 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        {error === "Este nome de usuário já está em uso por outra conta." ? t('editors.identity.error_in_use') : error}
                    </div>
                )}
            </div>

            <div className="p-6 bg-gradient-to-t from-white via-white to-transparent dark:from-[#050505] dark:via-[#050505] absolute bottom-0 left-0 right-0">
                <EditorActionButton 
                    onClick={handleSave} 
                    isLoading={isPending}
                    label={isChanged ? t('editors.identity.sync_btn') : t('common.close')}
                    icon={Check}
                />
            </div>
        </div>
    )
}
