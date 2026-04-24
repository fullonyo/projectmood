"use client"

import { LogOut, Ban, ShieldAlert } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/i18n/context"

export default function BannedPage() {
    const { t } = useTranslation()

    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-8">
                    <Ban className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-3xl font-black uppercase tracking-tighter">
                    {t('auth.banned.title') || "Acesso Restrito"}
                </h1>
                <p className="text-sm text-zinc-400 font-mono">
                    {t('auth.banned.message') || "Esta conta foi suspensa por violar os Termos de Aura da plataforma. O acesso ao seu quarto digital e ao Command Center foram revogados."}
                </p>

                <div className="pt-8 border-t border-zinc-900 mt-8 flex flex-col items-center gap-6">
                    <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500">
                        <ShieldAlert className="w-4 h-4" /> System Lockdown
                    </div>

                    <Button 
                        variant="ghost" 
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white hover:bg-white/5 gap-3"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        {t('auth.banned.logout') || "Encerrar Protocolo de Acesso"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
