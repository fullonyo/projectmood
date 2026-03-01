"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { DESIGN_VIEWPORT_WIDTH } from "@/lib/canvas-scale"

const MIN_SCALE = 0.25

interface ScaleContextType {
    scale: number
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined)

export function ScaleProvider({ children }: { children: React.ReactNode }) {
    const [scale, setScale] = useState(1)

    useEffect(() => {
        const compute = () => {
            const raw = window.innerWidth / DESIGN_VIEWPORT_WIDTH
            setScale(Math.max(MIN_SCALE, raw))
        }

        compute()

        // Listener único para toda a aplicação
        window.addEventListener('resize', compute)
        return () => window.removeEventListener('resize', compute)
    }, [])

    return (
        <ScaleContext.Provider value={{ scale }}>
            {children}
        </ScaleContext.Provider>
    )
}

export function useGlobalScale(): number {
    const context = useContext(ScaleContext)
    if (context === undefined) {
        // Fallback para componentes fora do provider ou durante SSR
        return 1
    }
    return context.scale
}
