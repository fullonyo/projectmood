import Link from "next/link"
import { Ban, ShieldAlert } from "lucide-react"

export default function BannedPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-8">
                    <Ban className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-3xl font-black uppercase tracking-tighter">Acesso Restrito</h1>
                <p className="text-sm text-zinc-400 font-mono">
                    Esta conta foi suspensa por violar os Termos de Aura da plataforma. O acesso ao seu quarto digital e ao Command Center foram revogados.
                </p>

                <div className="pt-8 border-t border-zinc-900 mt-8">
                    <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">
                        <ShieldAlert className="w-4 h-4" /> System Lockdown
                    </div>
                </div>
            </div>
        </div>
    )
}
