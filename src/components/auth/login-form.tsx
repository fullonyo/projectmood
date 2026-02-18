"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginForm() {
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
                setError("Credenciais inválidas")
                setLoading(false)
            } else {
                router.push("/dashboard")
            }
        } catch (err) {
            setError("Algo deu errado. Tente novamente.")
            setLoading(false)
        }
    }

    return (
        <div className="h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white overflow-hidden">
            {/* Header */}
            <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-zinc-100 flex-shrink-0">
                <div className="text-2xl font-black tracking-tighter uppercase italic">MoodSpace</div>
                <Link href="/">
                    <Button variant="ghost" className="text-sm">← Voltar</Button>
                </Link>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto">
                <div className="w-full max-w-md space-y-6">
                    {/* Título */}
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Bem-vindo de volta.</h1>
                        <p className="text-zinc-500 text-lg">Entre e continue criando seu espaço.</p>
                    </div>

                    {/* Card do Formulário */}
                    <div className="p-8 rounded-[40px] bg-zinc-50 border border-zinc-100 rotate-1 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
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

                            <Button
                                type="submit"
                                className="w-full h-12 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-md"
                                disabled={loading}
                            >
                                {loading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>
                    </div>

                    {/* Link para Register */}
                    <p className="text-center text-sm text-zinc-500">
                        Novo por aqui?{" "}
                        <Link href="/auth/register" className="font-black text-black hover:underline">
                            Criar conta
                        </Link>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-zinc-400 border-t border-zinc-100 text-sm flex-shrink-0">
                © 2026 MoodSpace. O seu espaço, o seu estilo.
            </footer>
        </div>
    )
}
