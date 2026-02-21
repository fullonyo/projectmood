"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BackgroundEffect } from "@/components/effects/background-effect"
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
        <div className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white overflow-hidden relative">
            <div className="fixed inset-0 z-0 opacity-5 pointer-events-none">
                <BackgroundEffect type="aurora" primaryColor="#000" />
            </div>

            {/* Technical Header */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 border-b border-zinc-100 flex-shrink-0">
                <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase tracking-[0.5em] opacity-30 leading-none mb-1">{t('auth.login.auth_protocol')}</span>
                    <div className="text-2xl font-black tracking-tighter uppercase italic">MoodSpace</div>
                </div>
                <div className="flex items-center gap-6">
                    <LanguageSwitcher />
                    <Link href="/">
                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest gap-2">
                            <ShieldEllipsis className="w-3 h-3" />
                            {t('auth.login.abort')}
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Login Protocol Form */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto">
                <div className="w-full max-w-sm space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-black/5 bg-zinc-50 rounded-full mb-2">
                            <Fingerprint className="w-3 h-3 opacity-40" />
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">{t('auth.login.identify_presence')}</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase leading-none">{t('auth.login.title')} <br /><span className="italic text-zinc-300">{t('auth.login.title_italic')}</span></h1>
                    </div>

                    <div className="p-6 sm:p-10 border border-zinc-200 bg-white relative">
                        {/* Technical corner accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-400" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-400" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-400" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-400" />

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-1">{t('auth.login.identity_url')}</label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder={t('auth.login.placeholder_email')}
                                    className="h-12 rounded-none border-zinc-200 bg-zinc-50/50 shadow-none focus:ring-0 focus:border-black transition-all font-mono text-[10px]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-1">{t('auth.login.access_key')}</label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder={t('auth.login.placeholder_password')}
                                    className="h-12 rounded-none border-zinc-200 bg-zinc-50/50 shadow-none focus:ring-0 focus:border-black transition-all font-mono text-[10px]"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-4 text-[9px] font-bold uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 italic transition-all animate-in fade-in slide-in-from-top-2">
                                    // {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 bg-black text-white rounded-none font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-none"
                                disabled={loading}
                            >
                                {loading ? t('auth.login.authorizing') : t('auth.login.initiate_access')}
                            </Button>
                        </form>
                    </div>

                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        {t('auth.login.unauthorized')}{" "}
                        <Link href="/auth/register" className="text-black hover:underline underline-offset-4">
                            {t('auth.login.establish_identity')}
                        </Link>
                    </p>
                </div>
            </main>

            <footer className="py-6 text-center text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-300 border-t border-zinc-100 flex-shrink-0">
                {t('auth.login.footer')}
            </footer>
        </div>
    )
}
