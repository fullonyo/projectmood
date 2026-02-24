"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/actions/register"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BackgroundEffect } from "@/components/effects/background-effect"
import { StaticTextures } from "@/components/effects/static-textures"
import { UserPlus, ShieldPlus } from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { LanguageSwitcher } from "@/components/dashboard/language-switcher"

export default function RegisterForm() {
    const { t } = useTranslation()
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        const res = await registerUser(data as any)

        if (res.error) {
            setError(`${t('auth.register.identity_rejected')}: ${res.error}`)
            setLoading(false)
        }

        if (res.success) {
            setSuccess(t('auth.register.identity_established'))
            setTimeout(() => {
                router.push("/auth/login")
            }, 2000)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-white selection:text-black overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0">
                <BackgroundEffect type="aurora" primaryColor="#18181b" />
            </div>
            <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none">
                <StaticTextures type="cross" />
            </div>

            {/* Studio Header (Signature Style - Synced with Landing) */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-12 flex-shrink-0">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-40 leading-none mb-1">{t('landing.studio_platform')}</span>
                    <div className="text-2xl font-black tracking-tighter uppercase italic">MoodSpace</div>
                </div>
                <div className="flex items-center gap-6">
                    <LanguageSwitcher className="opacity-50 hover:opacity-100 transition-opacity" />
                    <Link href="/">
                        <Button variant="ghost" className="text-[9px] font-black uppercase tracking-[0.3em] gap-2 opacity-40 hover:opacity-100 border border-transparent hover:border-white/10 hover:bg-white/5 transition-all">
                            <ShieldPlus className="w-3.5 h-3.5" />
                            {t('auth.register.cancel')}
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
                <div className="w-full max-w-sm space-y-10">
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/5 bg-white/5 backdrop-blur-md rounded-none mb-2">
                            <UserPlus className="w-3.5 h-3.5 opacity-40" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">{t('auth.register.request_alloc')}</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-balance">
                            {t('auth.register.title')} <br />
                            <span className="italic text-zinc-600">{t('auth.register.title_italic')}</span>
                        </h1>
                    </div>

                    <div className="p-8 sm:p-12 border border-white/10 bg-zinc-900/60 backdrop-blur-2xl relative rounded-none shadow-2xl">
                        {/* Technical accents (Architectural) */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20" />

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1 block">
                                    {t('auth.register.unique_identifier')}
                                </label>
                                <Input
                                    name="username"
                                    placeholder={t('auth.register.placeholder_username')}
                                    className="h-11 rounded-none border-white/10 bg-white/5 shadow-none focus:ring-0 focus:border-white/40 font-mono text-[10px] placeholder:text-zinc-700"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1 block">
                                    {t('auth.register.communication_node')}
                                </label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder={t('auth.register.placeholder_email')}
                                    className="h-11 rounded-none border-white/10 bg-white/5 shadow-none focus:ring-0 focus:border-white/40 font-mono text-[10px] placeholder:text-zinc-700"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1 block">
                                    {t('auth.register.private_key')}
                                </label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder={t('auth.register.placeholder_password')}
                                    className="h-11 rounded-none border-white/10 bg-white/5 shadow-none focus:ring-0 focus:border-white/40 font-mono text-[10px] placeholder:text-zinc-700"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-4 text-[9px] font-bold uppercase tracking-widest text-red-400 bg-red-400/5 border border-red-500/20 italic transition-all animate-in fade-in slide-in-from-top-2">
                                    // {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 text-[9px] font-bold uppercase tracking-widest text-green-400 bg-green-400/5 border border-green-500/20 italic transition-all animate-in fade-in slide-in-from-top-2">
                                    // {success}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-15 bg-white text-black rounded-none font-black uppercase tracking-[0.3em] text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-none hover:bg-zinc-200"
                                disabled={loading}
                            >
                                {loading ? t('auth.register.establishing') : t('auth.register.register_identity')}
                            </Button>
                        </form>
                    </div>

                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 pb-8">
                        {t('auth.register.already_registered')}{" "}
                        <Link href="/auth/login" className="text-white hover:underline underline-offset-4 decoration-zinc-700">
                            {t('auth.register.resume_session')}
                        </Link>
                    </p>
                </div>
            </main>

            <footer className="py-8 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-600 border-t border-white/5 flex-shrink-0">
                {t('auth.register.footer')}
            </footer>
        </div>
    )
}
