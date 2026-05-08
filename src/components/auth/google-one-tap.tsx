"use client"

import { useEffect, useRef } from "react"
import { signIn, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export function GoogleOneTap() {
    const { status } = useSession()
    const pathname = usePathname()
    const initialized = useRef(false)

    useEffect(() => {
        // Só mostramos o One Tap se o usuário estiver deslogado e em rotas de auth ou landing
        const isAuthRoute = pathname.startsWith("/auth") || pathname === "/"
        if (status !== "unauthenticated" || !isAuthRoute || initialized.current) {
            return
        }

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId) {
            console.warn("Google One Tap: NEXT_PUBLIC_GOOGLE_CLIENT_ID não encontrado no .env")
            return
        }

        const script = document.createElement("script")
        script.src = "https://accounts.google.com/gsi/client"
        script.async = true
        script.defer = true
        script.onload = () => {
            if (!window.google) return

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: any) => {
                    console.log("Google One Tap: Token recebido, iniciando signIn...");
                    await signIn("google", {
                        id_token: response.credential,
                        callbackUrl: "/studio",
                    })
                },
                auto_select: false,
                use_fedcm_for_prompt: false, // Desativa FedCM para evitar NetworkError local
                itp_support: true,           // Melhora suporte a Intelligent Tracking Prevention
                cancel_on_tap_outside: false,
            })

            // Exibe a bolha
            window.google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed()) {
                    console.log("One Tap não exibido:", notification.getNotDisplayedReason())
                }
            })
            
            initialized.current = true
        }

        document.body.appendChild(script)

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
        }
    }, [status, pathname])

    return null
}

// Tipagem para o objeto global do Google
declare global {
    interface Window {
        google: any
    }
}
