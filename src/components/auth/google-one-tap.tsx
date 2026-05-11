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
        
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId) {
            console.warn("GSI: NEXT_PUBLIC_GOOGLE_CLIENT_ID não encontrado.");
            return
        }

        try {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: any) => {
                    await signIn("google", {
                        id_token: response.credential,
                        callbackUrl: "/studio",
                    })
                },
                // Tentativa de compatibilidade máxima:
                auto_select: false,
                use_fedcm_for_prompt: false,
                context: 'signin',
                itp_support: true,
            })
            
            gsiInitialized = true;
        } catch (error) {
            console.error("GSI Init Error:", error)
        }
    }

    const showPrompt = () => {
        if (typeof window !== "undefined" && window.google && status === "unauthenticated") {
            console.log("GSI: Solicitando prompt...");
            window.google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed()) {
                    console.warn("GSI Bubble não exibido. Motivo:", notification.getNotDisplayedReason());
                    console.info("Dica: Se você fechou o bubble recentemente, limpe o cookie 'g_state' para ele reaparecer.");
                }
                if (notification.isSkippedMoment()) {
                    console.log("GSI Bubble pulado. Motivo:", notification.getSkippedReason());
                }
            });
        }
    }

    useEffect(() => {
        // 1. Garante que está inicializado
        if (window.google) {
            initializeGSI()
        }
        
        // 2. Tenta mostrar o prompt (com delay para suavidade)
        const timer = setTimeout(() => {
            showPrompt()
        }, 2000)

        return () => clearTimeout(timer)
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
