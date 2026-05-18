"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { registerUser } from "@/actions/register"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BackgroundEffect } from "@/components/effects/background-effect"
import { StaticTextures } from "@/components/effects/static-textures"
import { UserPlus, ShieldPlus } from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { LanguageSwitcher } from "@/components/studio/language-switcher"

export default function RegisterForm() {
    const { t } = useTranslation()
    const searchParams = useSearchParams()
    const initialUsername = searchParams.get("username") || ""
    
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
            
            // Auto-login protocol initiation
            const loginRes = await signIn("credentials", {
                email: data.email as string,
                password: data.password as string,
                redirect: false,
            })

            if (!loginRes?.error) {
                setTimeout(() => {
                    router.push("/studio")
                }, 1500)
            } else {
                setTimeout(() => {
                    router.push("/auth/login")
                }, 2000)
            }
        }
    }

    return (
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

            <div className="p-6 sm:p-12 border border-white/10 bg-zinc-900/60 backdrop-blur-2xl relative rounded-none shadow-2xl">
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
                            defaultValue={initialUsername}
                            placeholder={t('auth.register.placeholder_username')}
                            className="h-11 rounded-none border-white/10 bg-white/5 shadow-none focus:ring-0 focus:border-white/40 font-mono text-[10px] text-white placeholder:text-zinc-500"
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
                            className="h-11 rounded-none border-white/10 bg-white/5 shadow-none focus:ring-0 focus:border-white/40 font-mono text-[10px] text-white placeholder:text-zinc-500"
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
                            className="h-11 rounded-none border-white/10 bg-white/5 shadow-none focus:ring-0 focus:border-white/40 font-mono text-[10px] text-white placeholder:text-zinc-500"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 text-[9px] font-bold uppercase tracking-widest text-red-400 bg-red-400/5 border border-red-500/20 flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-2">
                            <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 text-[9px] font-bold uppercase tracking-widest text-green-400 bg-green-400/5 border border-green-500/20 flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-2">
                            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                            {success}
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
                
                <div className="relative my-8 px-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/5"></span>
                    </div>
                    <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em]">
                        <span className="bg-transparent px-2 text-zinc-500 italic">ou sintonize via</span>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => signIn("google", { callbackUrl: "/studio" })}
                        className="w-full h-14 bg-white hover:bg-zinc-100 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-none transition-all duration-300 gap-4 border-none shadow-xl group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c3.11 0 5.72-1.03 7.63-2.81l-3.57-2.77c-.98.66-2.23 1.06-3.83 1.06-3.08 0-5.7-2.08-6.63-4.87l-3.69 2.86C4.01 20.31 7.69 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.37 13.61c-.24-.72-.37-1.48-.37-2.26s.13-1.54.37-2.26V6.23l-3.69-2.86A11.96 11.96 0 000 12c0 1.92.45 3.73 1.25 5.34l3.69-2.86c-.47-.47-.95-1.04-1.25-1.63z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.69 0 3.21.58 4.41 1.72l3.31-3.31C17.71 1.83 15.11 0 12 0 7.69 0 4.01 2.69 2.56 6.23l3.69 2.86c.93-2.79 3.55-4.87 6.63-4.87z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </Button>
                </div>
            </div>

            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 pb-8">
                {t('auth.register.already_registered')}{" "}
                <Link href="/auth/login" className="text-white hover:underline underline-offset-4 decoration-zinc-700">
                    {t('auth.register.resume_session')}
                </Link>
            </p>
        </div>
    )
}
