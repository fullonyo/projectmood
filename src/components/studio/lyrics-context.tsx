"use client"

import React, { createContext, useContext, useState } from "react"

interface LyricsContextState {
    activeLyrics: string | null
    setActiveLyrics: (lyrics: string | null) => void
}

const LyricsContext = createContext<LyricsContextState | undefined>(undefined)

export function LyricsProvider({ children }: { children: React.ReactNode }) {
    const [activeLyrics, setActiveLyrics] = useState<string | null>(null)

    const value = React.useMemo(() => ({
        activeLyrics,
        setActiveLyrics
    }), [activeLyrics])

    return (
        <LyricsContext.Provider value={value}>
            {children}
        </LyricsContext.Provider>
    )
}

export function useLyrics() {
    const context = useContext(LyricsContext)
    if (context === undefined) {
        throw new Error("useLyrics must be used within a LyricsProvider")
    }
    return context
}
