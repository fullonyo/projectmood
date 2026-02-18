"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/actions/register"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterForm() {
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
            setError(res.error)
            setLoading(false)
        }

        if (res.success) {
            setSuccess(res.success)
            setTimeout(() => {
                router.push("/auth/login")
            }, 2000)
        }
    }

    return (
        <div className="h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white overflow-hidden">
            {/* Header */}
            <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-zinc-100 flex-shrink-0">
                <div className="text-2xl font-black tracking-tighter">MOOD.</div>
                <Link href="/">
                    <Button variant="ghost" className="text-sm">← Voltar</Button>
                </Link>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto">
                <div className="w-full max-w-md space-y-6">
                    {/* Título */}
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Crie sua conta.</h1>
                        <p className="text-zinc-500 text-lg">Comece a construir seu espaço único.</p>
                    </div>

                    {/* Card do Formulário */}
                    <div className="p-8 rounded-[40px] bg-zinc-50 border border-zinc-100 -rotate-1 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">Nome de usuário</label>
                                <Input
                                    name="username"
                                    placeholder="seu_username"
                                    className="h-12 rounded-2xl bg-white border-zinc-200 shadow-inner focus:ring-2 focus:ring-black transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">Email</label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="h-12 rounded-2xl bg-white border-zinc-200 shadow-inner focus:ring-2 focus:ring-black transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">Senha</label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 rounded-2xl bg-white border-zinc-200 shadow-inner focus:ring-2 focus:ring-black transition-all"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-2xl border border-red-100">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 text-sm text-green-600 bg-green-50 rounded-2xl border border-green-100">
                                    {success}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-md"
                                disabled={loading}
                            >
                                {loading ? "Criando..." : "Criar Conta"}
                            </Button>
                        </form>
                    </div>

                    {/* Link para Login */}
                    <p className="text-center text-sm text-zinc-500 pb-4">
                        Já tem conta?{" "}
                        <Link href="/auth/login" className="font-black text-black hover:underline">
                            Entrar
                        </Link>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-zinc-400 border-t border-zinc-100 text-sm flex-shrink-0">
                © 2026 MOOD Project. O seu espaço, o seu estilo.
            </footer>
        </div>
    )
}
