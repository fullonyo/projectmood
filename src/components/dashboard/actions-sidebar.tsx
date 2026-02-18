"use client"

import { LogOut, ExternalLink, Share2, Eye, User, Settings } from "lucide-react"
import { Button } from "../ui/button"
import { ShareProfileButton } from "./share-profile-button"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

interface ActionsSidebarProps {
    username: string
}

export function ActionsSidebar({ username }: ActionsSidebarProps) {
    return (
        <aside className="w-80 h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl z-50">
            {/* Sidebar Header - Logo & Status */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center justify-between mb-2">
                    <Link href="/" className="text-2xl font-black tracking-tighter uppercase italic hover:opacity-70 transition-opacity">
                        MOOD.
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <Eye className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Editor</span>
                    </div>
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400">Gerenciamento de Espaço</p>
            </div>

            {/* Main Action Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">

                {/* Visualização Contextual */}
                <div className="space-y-4">
                    <header>
                        <h3 className="text-xl font-black tracking-tighter uppercase">Visualização</h3>
                        <p className="text-[11px] text-zinc-500 italic">Como o mundo vê o seu mural.</p>
                    </header>

                    <div className="grid gap-3">
                        <Link href={`/${username}`} target="_blank" className="w-full">
                            <Button
                                className="w-full justify-between h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] transition-transform group"
                            >
                                <div className="flex items-center gap-3">
                                    <ExternalLink className="w-4 h-4" />
                                    Ver Espaço Público
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </Button>
                        </Link>

                        <ShareProfileButton username={username} />
                    </div>
                </div>

                <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

                {/* Futuras Funcionalidades - Placeholder */}
                <div className="space-y-4 opacity-40 grayscale pointer-events-none">
                    <header>
                        <h3 className="text-xl font-black tracking-tighter uppercase">Configurações</h3>
                        <p className="text-[11px] text-zinc-500 italic">Em breve mais opções de controle.</p>
                    </header>
                    <div className="grid gap-2">
                        <Button variant="outline" className="justify-start gap-3 h-12 rounded-xl text-xs font-bold border-dashed">
                            <User className="w-4 h-4" />
                            Acesso & Segurança
                        </Button>
                        <Button variant="outline" className="justify-start gap-3 h-12 rounded-xl text-xs font-bold border-dashed">
                            <Settings className="w-4 h-4" />
                            Preferências de Conta
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Logout */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full justify-center gap-3 h-12 rounded-xl text-xs font-bold text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    Encerrar Sessão
                </Button>
            </div>
        </aside>
    )
}
