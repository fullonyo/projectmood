"use client"

import { useEffect, useRef } from "react"
import { signIn, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Script from "next/script"

export function GoogleOneTap() {
    const { status } = useSession()
    const pathname = usePathname()
    const initialized = useRef(false)

    const initializeGSI = () => {
        if (typeof window === "undefined" || !window.google || initialized.current) return
        
        const isAuthRoute = pathname.startsWith("/auth") || pathname === "/"
        if (status !== "unauthenticated" || !isAuthRoute) return

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId) return

        try {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: any) => {
                    console.log("Google One Tap: Autenticando...");
                    await signIn("google", {
                        id_token: response.credential,
                        callbackUrl: "/studio",
                    })
                },
                itp_support: true,
                use_fedcm_for_prompt: true, // Mantemos true, mas tratamos o erro silenciosamente
            })

            window.google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed()) {
                    // Silenciamos o log comum se não houver erro crítico
                    if (notification.getNotDisplayedReason() !== "suppressed_by_user") {
                        console.log("GSI Status:", notification.getNotDisplayedReason());
                    }
                }
            })
            
            initialized.current = true
        } catch (error) {
            console.error("GSI Init Error:", error)
        }
    }

    // Reinicializa se a rota mudar (importante para SPAs)
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
