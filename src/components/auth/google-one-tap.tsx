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
        if (typeof window === "undefined" || !window.google || gsiInitialized) return
        
        // Só ativamos o One Tap dentro das páginas de autenticação para evitar erros na Landing
        const isAuthRoute = pathname.startsWith("/auth")
        if (status !== "unauthenticated" || !isAuthRoute) return

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId) return

        try {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: any) => {
                    await signIn("google", {
                        id_token: response.credential,
                        callbackUrl: "/studio",
                    })
                },
                auto_select: false,
                use_fedcm_for_prompt: false, // Forçamos false para evitar o NetworkError do FedCM
                itp_support: true,
            })

            // Pequeno delay para garantir que o DOM está pronto e evitar conflitos de renderização
            setTimeout(() => {
                window.google.accounts.id.prompt((notification: any) => {
                    if (notification.isNotDisplayed()) {
                        console.log("GSI Status:", notification.getNotDisplayedReason());
                    }
                });
            }, 1000);
            
            gsiInitialized = true;
        } catch (error) {
            console.error("GSI Init Error:", error)
        }
    }

    useEffect(() => {
        if (window.google) {
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
