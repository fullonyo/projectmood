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
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Entre na sua conta para editar seu mood.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Email</label>
                    <Input name="email" type="email" placeholder="maikon@exemplo.com" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Senha</label>
                    <Input name="password" type="password" placeholder="••••••••" required />
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" isLoading={loading}>
                    Entrar
                </Button>
            </form>

            <div className="text-center text-sm">
                Não tem uma conta?{" "}
                <Link href="/auth/register" className="font-semibold text-black dark:text-white hover:underline">
                    Cadastrar-se
                </Link>
            </div>
        </div>
    )
}
