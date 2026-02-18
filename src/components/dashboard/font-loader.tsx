"use client"

import { useEffect } from "react"

interface FontLoaderProps {
    fontFamily: string | null | undefined
}

export function FontLoader({ fontFamily }: FontLoaderProps) {
    useEffect(() => {
        if (!fontFamily || fontFamily === "Inter") return

        // Create Google Fonts link
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;700;900&display=swap`
        document.head.appendChild(link)

        // Apply font to body
        document.body.style.fontFamily = `"${fontFamily}", sans-serif`

        return () => {
            document.head.removeChild(link)
            document.body.style.fontFamily = ""
        }
    }, [fontFamily])

    return null
}
