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
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Criar conta</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Comece a expressar seu mood hoje mesmo.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Nome de usuário</label>
                    <Input name="username" placeholder="ex: maikon_dev" required />
                </div>
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

                {success && (
                    <div className="p-3 text-sm text-green-500 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                        {success}
                    </div>
                )}

                <Button type="submit" className="w-full" isLoading={loading}>
                    Cadastrar
                </Button>
            </form>

            <div className="text-center text-sm">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="font-semibold text-black dark:text-white hover:underline">
                    Entrar
                </Link>
            </div>
        </div>
    )
}
