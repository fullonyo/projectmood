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
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center justify-between mb-2">
                    <Link href="/" className="flex flex-col hover:opacity-70 transition-opacity">
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-30 leading-none mb-1">System Node</span>
                        <div className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                            MoodSpace
                        </div>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 border border-black dark:border-white">
                        <span className="text-[8px] font-black uppercase tracking-widest">Active Studio</span>
                    </div>
                </div>
            </div>

            {/* Profile Context Card */}
            <div className="px-6 py-10">
                <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative group transition-all duration-500 shadow-sm">
                    {/* Technical corner accents */}
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-zinc-300 dark:border-zinc-700" />
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-zinc-300 dark:border-zinc-700" />

                    <div className="flex items-center gap-5 mb-6">
                        <div className="relative">
                            <button
                                onClick={handleAvatarClick}
                                disabled={isUploading}
                                className="relative w-14 h-14 overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-500 group/avatar disabled:opacity-50"
                            >
                                <img
                                    src={avatarSrc}
                                    alt={username}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
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
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 leading-none mb-1.5">Identity Protocol</span>
                            <h4 className="text-base font-black tracking-tighter dark:text-white uppercase italic">{firstName}</h4>
                            <span className="text-[7px] font-mono text-zinc-300 dark:text-zinc-600 mt-1">S_ID // {username.toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-zinc-100 dark:border-zinc-900">
                        <div className="flex flex-col">
                            <p className="text-[7px] uppercase font-black text-zinc-400 tracking-[0.3em] mb-1">Access Level</p>
                            <p className="text-[9px] font-black uppercase text-black dark:text-white">Studio_Free</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-[7px] uppercase font-black text-zinc-400 tracking-[0.3em] mb-1">System Status</p>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-black dark:bg-white animate-pulse" />
                                <p className="text-[9px] font-black uppercase text-black dark:text-white">Authorized</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6 custom-scrollbar space-y-10 animate-in fade-in slide-in-from-right-2 duration-500">

                {/* Visualização Contextual */}
                <div className="space-y-6">
                    <header className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-black dark:bg-white" />
                            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">Deployment Area</h3>
                        </div>
                        <p className="text-[9px] text-zinc-400 uppercase tracking-widest">External Visibility Protocols</p>
                    </header>

                    <div className="grid gap-4">
                        <Link href={`/${username}`} target="_blank" className="w-full">
                            <Button
                                className="w-full justify-between h-14 rounded-none text-[10px] font-black uppercase tracking-[0.3em] bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-95 transition-all group shadow-none border border-black dark:border-white"
                            >
                                <div className="flex items-center gap-3">
                                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    Launch Public Space
                                </div>
                                <div className="flex gap-1.5 opacity-30">
                                    <div className="w-1 h-1 bg-white dark:bg-black animate-pulse" />
                                    <div className="w-1 h-1 bg-white dark:bg-black animate-pulse delay-75" />
                                    <div className="w-1 h-1 bg-white dark:bg-black animate-pulse delay-150" />
                                </div>
                            </Button>
                        </Link>

                        <div className="transition-all duration-300">
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

            {/* Bottom Section - Session Closure */}
            <div className="p-8 border-t border-zinc-100 dark:border-zinc-900 shrink-0">
                <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full justify-between h-14 rounded-none text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-red-500"
                >
                    <div className="flex items-center gap-3">
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Terminate_Session
                    </div>
                    <span className="text-[8px] opacity-20 font-mono">0x00_EXIT</span>
                </Button>
            </div>
        </aside>
    )
}
