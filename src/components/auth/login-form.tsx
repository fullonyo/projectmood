"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BackgroundEffect } from "@/components/effects/background-effect"
import { StaticTextures } from "@/components/effects/static-textures"
import { Fingerprint, ShieldEllipsis } from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { LanguageSwitcher } from "@/components/dashboard/language-switcher"

export default function LoginForm() {
    const { t } = useTranslation()
    const [error, setError] = useState<string | undefined>("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (res?.error) {
                setError(t('auth.login.protocol_denied'))
                setLoading(false)
            } else {
                router.push("/dashboard")
            }
        } catch (err) {
            setError(t('auth.login.protocol_error'))
            setLoading(false)
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
                            <ShieldEllipsis className="w-3.5 h-3.5" />
                            {t('auth.login.abort')}
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Login Protocol Form */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
                <div className="w-full max-w-sm space-y-10">
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/5 bg-white/5 backdrop-blur-md rounded-none mb-2">
                            <Fingerprint className="w-3.5 h-3.5 opacity-40" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">{t('auth.login.identify_presence')}</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-balance">
                            {t('auth.login.title')} <br />
                            <span className="italic text-zinc-600">{t('auth.login.title_italic')}</span>
                        </h1>
                    </div>

                    <div className="p-8 sm:p-12 border border-white/10 bg-zinc-900/60 backdrop-blur-2xl relative rounded-none shadow-2xl">
                        {/* Technical corner accents (Architectural) */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20" />

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1 block">
                                    {t('auth.login.identity_url')}
                                </label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder={t('auth.login.placeholder_email')}
                                    className="h-12 rounded-none border-white/10 bg-white/5 shadow-none focus:ring-0 focus:border-white/40 transition-all font-mono text-[10px] placeholder:text-zinc-700"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1 block">
                                    {t('auth.login.access_key')}
                                </label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder={t('auth.login.placeholder_password')}
                                    className="h-12 rounded-none border-white/10 bg-white/5 shadow-none focus:ring-0 focus:border-white/40 transition-all font-mono text-[10px] placeholder:text-zinc-700"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-4 text-[9px] font-bold uppercase tracking-widest text-red-400 bg-red-400/5 border border-red-500/20 italic transition-all animate-in fade-in slide-in-from-top-2">
                                    // {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-15 bg-white text-black rounded-none font-black uppercase tracking-[0.3em] text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-none hover:bg-zinc-200"
                                disabled={loading}
                            >
                                {loading ? t('auth.login.authorizing') : t('auth.login.initiate_access')}
                            </Button>
                        </form>
                    </div>

                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        {t('auth.login.unauthorized')}{" "}
                        <Link href="/auth/register" className="text-white hover:underline underline-offset-4 decoration-zinc-700">
                            {t('auth.login.establish_identity')}
                        </Link>
                    </p>
                </div>
            </main>

            <footer className="py-8 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-600 border-t border-white/5 flex-shrink-0">
                {t('auth.login.footer')}
            </footer>
        </div>
    )
}
