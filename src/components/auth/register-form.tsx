"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/actions/register"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BackgroundEffect } from "@/components/effects/background-effect"
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
        <div className="h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white overflow-hidden relative">
            <div className="fixed inset-0 z-0 opacity-5 pointer-events-none">
                <BackgroundEffect type="aurora" primaryColor="#000" />
            </div>

            {/* Technical Header */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 border-b border-zinc-100 flex-shrink-0">
                <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase tracking-[0.5em] opacity-30 leading-none mb-1">{t('auth.register.entity_reg')}</span>
                    <div className="text-2xl font-black tracking-tighter uppercase italic">MoodSpace</div>
                </div>
                <div className="flex items-center gap-6">
                    <LanguageSwitcher />
                    <Link href="/">
                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest gap-2">
                            <ShieldPlus className="w-3 h-3" />
                            {t('auth.register.cancel')}
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto">
                <div className="w-full max-w-sm space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-black/5 bg-zinc-50 rounded-full mb-2">
                            <UserPlus className="w-3 h-3 opacity-40" />
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">{t('auth.register.request_alloc')}</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-balance">{t('auth.register.title')} <br /><span className="italic text-zinc-300">{t('auth.register.title_italic')}</span></h1>
                    </div>

                    <div className="p-10 border border-zinc-200 bg-white relative shadow-2xl">
                        {/* Technical accents */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-black" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-black" />

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-1">{t('auth.register.unique_identifier')}</label>
                                <Input
                                    name="username"
                                    placeholder={t('auth.register.placeholder_username')}
                                    className="h-11 rounded-none border-zinc-200 bg-zinc-50/50 shadow-none focus:ring-0 focus:border-black font-mono text-[10px]"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-1">{t('auth.register.communication_node')}</label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder={t('auth.register.placeholder_email')}
                                    className="h-11 rounded-none border-zinc-200 bg-zinc-50/50 shadow-none focus:ring-0 focus:border-black font-mono text-[10px]"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-1">{t('auth.register.private_key')}</label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder={t('auth.register.placeholder_password')}
                                    className="h-11 rounded-none border-zinc-200 bg-zinc-50/50 shadow-none focus:ring-0 focus:border-black font-mono text-[10px]"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-4 text-[9px] font-bold uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 italic transition-all animate-in fade-in slide-in-from-top-2">
                                    // {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 text-[9px] font-bold uppercase tracking-widest text-green-600 bg-green-50 border border-green-100 italic transition-all animate-in fade-in slide-in-from-top-2">
                                    // {success}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 bg-black text-white rounded-none font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all"
                                disabled={loading}
                            >
                                {loading ? t('auth.register.establishing') : t('auth.register.register_identity')}
                            </Button>
                        </form>
                    </div>

                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pb-8">
                        {t('auth.register.already_registered')}{" "}
                        <Link href="/auth/login" className="text-black hover:underline underline-offset-4">
                            {t('auth.register.resume_session')}
                        </Link>
                    </p>
                </div>
            </main>

            <footer className="py-6 text-center text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-300 border-t border-zinc-100 flex-shrink-0">
                {t('auth.register.footer')}
            </footer>
        </div>
    )
}
