"use client"

import { useState, useTransition } from "react"
import { User, AtSign, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { EditorHeader, EditorSection, EditorActionButton } from "./EditorUI"
import { Input } from "@/components/ui/input"
import { updateProfile } from "@/actions/profile"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/i18n/context"
import { motion } from "framer-motion"

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

    const handleSave = () => {
        setError(null)
        
        startTransition(async () => {
            const result = await updateProfile({ 
                name: name.trim(), 
                username: username.trim().toLowerCase() 
            })

            if (result?.error) {
                setError(result.error)
                toast.error(result.error)
            } else {
                toast.success(t('common.success') || "Identidade atualizada")
                router.refresh()
                onClose()
            }
        })
    }

    const isChanged = name !== (currentName || "") || username !== (currentUsername || "")

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
            <EditorHeader 
                title="identity" 
                subtitle="personal metadata"
                onClose={onClose}
            />

            <div className="flex-1 overflow-y-auto px-1 space-y-16 pb-10 custom-scrollbar">
                {/* Display Name Section */}
                <div className="space-y-2 group/input">
                    <label className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-700 px-1 group-focus-within/input:text-blue-500 transition-colors">
                        display name
                    </label>
                    <div className="relative">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="visual name..."
                            className="h-14 px-1 rounded-none bg-transparent border-none text-2xl font-black tracking-tighter placeholder:text-zinc-100 dark:placeholder:text-zinc-800 focus-visible:ring-0 transition-all caret-blue-500"
                        />
                        {/* Linha de Foco Animada */}
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-100 dark:bg-zinc-800" />
                        <motion.div 
                            className="absolute bottom-0 left-0 h-[1.5px] bg-blue-500 z-10"
                            initial={{ width: 0 }}
                            whileInView={{ width: "auto" }}
                            animate={{ 
                                width: name !== (currentName || "") ? "100%" : "0%",
                                opacity: name !== (currentName || "") ? 1 : 0
                            }}
                        />
                        <motion.div 
                            className="absolute bottom-0 left-0 h-[1.5px] bg-zinc-900 dark:bg-white z-20"
                            initial={{ width: 0 }}
                            whileFocus={{ width: "100%" }}
                        />
                    </div>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-600 px-1 font-medium italic opacity-40 group-focus-within/input:opacity-100 transition-opacity">
                        how you appear inside the mural.
                    </p>
                </div>

                {/* Username Section */}
                <div className="space-y-2 group/input">
                    <label className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-700 px-1 group-focus-within/input:text-blue-500 transition-colors">
                        username
                    </label>
                    <div className="space-y-8">
                        <div className="relative">
                            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-200 dark:text-zinc-800 pointer-events-none">@</span>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                placeholder="alias"
                                className="h-14 pl-8 pr-1 rounded-none bg-transparent border-none text-2xl font-mono font-bold tracking-tighter placeholder:text-zinc-100 dark:placeholder:text-zinc-800 focus-visible:ring-0 transition-all caret-blue-500"
                            />
                            {/* Linha de Foco Animada */}
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-100 dark:bg-zinc-800" />
                            <motion.div 
                                className="absolute bottom-0 left-0 h-[1.5px] bg-blue-500 z-10"
                                animate={{ 
                                    width: username !== (currentUsername || "") ? "100%" : "0%",
                                    opacity: username !== (currentUsername || "") ? 1 : 0
                                }}
                            />
                            <motion.div 
                                className="absolute bottom-0 left-0 h-[1.5px] bg-zinc-900 dark:bg-white z-20"
                                initial={{ width: 0 }}
                                whileFocus={{ width: "100%" }}
                            />
                        </div>

                        {/* Preview Minimalista da Aba */}
                        <div className="pt-2 flex flex-col gap-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-200 dark:text-zinc-800 px-1">browser tab</span>
                            <div className="flex items-center gap-4 px-2 py-3 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-100/50 dark:border-zinc-800/50">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                <span className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 tracking-tight lowercase">
                                    @{username || "username"} — moodspace
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] font-bold uppercase tracking-tight text-red-500 px-1 pt-4 flex items-center gap-2"
                    >
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        {error}
                    </motion.div>
                )}
            </div>

            <div className="pt-10">
                <EditorActionButton
                    label={isPending ? "syncing..." : "sync identity"}
                    onClick={handleSave}
                    disabled={!isChanged || !username}
                    isLoading={isPending}
                />
            </div>
        </div>
    )
}
