"use client"

import { useEffect, useRef } from "react"
import { signIn, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Script from "next/script"

// Variável global para evitar re-inicialização no HMR/Turbopack
let gsiInitialized = false;

export function GoogleOneTap() {
    const { status } = useSession()
    const pathname = usePathname()

    const initializeGSI = () => {
        if (typeof window === "undefined" || !window.google) return
        if (status !== "unauthenticated") return

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId) return

        try {
            // Limpa prompts anteriores para evitar sobreposição no ciclo de vida
            window.google.accounts.id.cancel()

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: any) => {
                    await signIn("google", {
                        id_token: response.credential,
                        callbackUrl: "/studio",
                    })
                },
                auto_select: false,
                use_fedcm_for_prompt: false,
                itp_support: true,
            })

            setTimeout(() => {
                if (status === "unauthenticated") {
                    window.google.accounts.id.prompt((notification: any) => {
                        // Se o bubble foi suprimido pelo Google (ex: muitos cancelamentos),
                        // podemos forçar a exibição em certas condições ou apenas logar
                        if (notification.isNotDisplayed()) {
                            console.warn("One Tap suprimido pelo Google:", notification.getNotDisplayedReason())
                        }
                    })
                }
            }, 3000)
            
        } catch (error) {
            console.error("GSI Lifecycle Error:", error)
        }
    }

    useEffect(() => {
        // Reinicializamos sempre que o status de autenticação mudar ou a rota mudar
        if (window.google && status === "unauthenticated") {
            initializeGSI()
        }
    }, [pathname, status])

    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={initializeGSI}
        />
    )
}

declare global {
    interface Window {
        google: any
    }
}
