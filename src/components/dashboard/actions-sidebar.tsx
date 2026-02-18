"use client"

import { LogOut, ExternalLink, Share2, Eye, User, Settings, CheckCircle2, Camera, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { ShareProfileButton } from "./share-profile-button"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"
import { updateProfile } from "@/actions/profile"
import imageCompression from 'browser-image-compression'

interface ActionsSidebarProps {
    username: string
    profile: any
}

export function ActionsSidebar({ username, profile }: ActionsSidebarProps) {
    const [greeting, setGreeting] = useState("Bons ventos")
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 12) setGreeting("Bom dia")
        else if (hour >= 12 && hour < 18) setGreeting("Boa tarde")
        else setGreeting("Boa noite")
    }, [])

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 400,
                useWebWorker: true
            }

            const compressedFile = await imageCompression(file, options)
            const reader = new FileReader()

            reader.onload = async () => {
                const base64 = reader.result as string
                await updateProfile({ avatarUrl: base64 })
                setIsUploading(false)
            }
            reader.readAsDataURL(compressedFile)
        } catch (error) {
            console.error("Erro no upload do avatar:", error)
            setIsUploading(false)
        }
    }

    const firstName = profile.name?.split(' ')[0] || username
    const avatarSrc = profile.avatarUrl || `https://avatar.vercel.sh/${username}`

    return (
        <aside className="w-80 h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl z-50">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
            />

            {/* Sidebar Header - Studio Identity */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                    <Link href="/" className="text-2xl font-black tracking-tighter uppercase italic hover:opacity-70 transition-opacity flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
                        MoodSpace
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <Eye className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Studio</span>
                    </div>
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400">Gerenciamento de Espaço</p>
            </div>

            {/* Profile Context Card */}
            <div className="px-6 py-8">
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 group hover:border-blue-500/30 transition-all duration-500 shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                            <button
                                onClick={handleAvatarClick}
                                disabled={isUploading}
                                className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-xl group-hover:scale-110 transition-all duration-500 group/avatar disabled:opacity-50"
                            >
                                <img
                                    src={avatarSrc}
                                    alt={username}
                                    className="w-full h-full object-cover"
                                />
                                {isUploading ? (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                                        <Camera className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </button>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                                <CheckCircle2 className="w-2 h-2 text-white" />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-0.5">{greeting},</p>
                            <h4 className="text-sm font-black tracking-tight dark:text-white capitalize">{firstName}</h4>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                        <div className="text-center flex-1">
                            <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest">Plano</p>
                            <p className="text-[10px] font-black text-blue-500">Free Spirit</p>
                        </div>
                        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                        <div className="text-center flex-1">
                            <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest">Status</p>
                            <p className="text-[10px] font-black text-green-500">Editor</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar space-y-10 animate-in fade-in slide-in-from-right-2 duration-500">

                {/* Visualização Contextual */}
                <div className="space-y-4">
                    <header className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-black tracking-[0.2em] uppercase text-zinc-500">Publicação</h3>
                            <p className="text-[10px] text-zinc-400 italic">Sincronize sua arte com o mundo.</p>
                        </div>
                        <div className="w-8 h-[1px] bg-zinc-100 dark:bg-zinc-800" />
                    </header>

                    <div className="grid gap-3">
                        <Link href={`/${username}`} target="_blank" className="w-full">
                            <Button
                                className="w-full justify-between h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-black dark:bg-white text-white dark:text-black hover:scale-[1.03] active:scale-95 transition-all group shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <ExternalLink className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                                    Ver Espaço Público
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-bounce" />
                                </div>
                            </Button>
                        </Link>

                        <div className="hover:scale-[1.03] transition-transform duration-300">
                            <ShareProfileButton username={username} />
                        </div>
                    </div>
                </div>

                {/* Futuras Funcionalidades - Polished Placeholder */}
                <div className="space-y-4">
                    <header className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-black tracking-[0.2em] uppercase text-zinc-500/50">Configurações</h3>
                            <p className="text-[10px] text-zinc-400/50 italic">Novos controles em breve.</p>
                        </div>
                    </header>
                    <div className="grid gap-2 opacity-30 grayscale cursor-not-allowed">
                        <Button variant="outline" className="justify-start gap-4 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest border-dashed">
                            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <User className="w-3.5 h-3.5" />
                            </div>
                            Perfil & Identidade
                        </Button>
                        <Button variant="outline" className="justify-start gap-4 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest border-dashed">
                            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <Settings className="w-3.5 h-3.5" />
                            </div>
                            Sistema & UX
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Logout */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/10 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full justify-center gap-3 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group"
                >
                    <LogOut className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    Encerrar Sessão
                </Button>
            </div>
        </aside>
    )
}
