"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface AudioContextState {
    isGlobalMuted: boolean
    globalVolume: number
    activeLyrics: string | null
    lyricsMode: 'integrated' | 'fullscreen'
    toggleGlobalMute: () => void
    setIsGlobalMuted: (val: boolean) => void
    setGlobalVolume: (val: number) => void
    setActiveLyrics: (lyrics: string | null) => void
    setLyricsMode: (mode: 'integrated' | 'fullscreen') => void
}

const AudioContext = createContext<AudioContextState | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [isGlobalMuted, setIsGlobalMuted] = useState(false)
    const [globalVolume, setGlobalVolume] = useState(1)
    const [activeLyrics, setActiveLyrics] = useState<string | null>(null)
    const [lyricsMode, setLyricsMode] = useState<'integrated' | 'fullscreen'>('integrated')

    // Load initial state
    useEffect(() => {
        const savedMute = localStorage.getItem("mood_audio_muted")
        if (savedMute !== null) {
            setIsGlobalMuted(savedMute === "true")
        }

        const savedVolume = localStorage.getItem("mood_audio_volume")
        if (savedVolume !== null) {
            setGlobalVolume(parseFloat(savedVolume))
        }

        const savedLyricsMode = localStorage.getItem("mood_lyrics_mode")
        if (savedLyricsMode === 'integrated' || savedLyricsMode === 'fullscreen') {
            setLyricsMode(savedLyricsMode)
        }
    }, [])

    // Persist changes automatically
    useEffect(() => {
        localStorage.setItem("mood_audio_muted", String(isGlobalMuted))
    }, [isGlobalMuted])

    useEffect(() => {
        localStorage.setItem("mood_audio_volume", String(globalVolume))
    }, [globalVolume])

    useEffect(() => {
        localStorage.setItem("mood_lyrics_mode", lyricsMode)
    }, [lyricsMode])

    const toggleGlobalMute = () => {
        setIsGlobalMuted(prev => !prev)
    }

    return (
        <AudioContext.Provider
            value={{
                isGlobalMuted,
                globalVolume,
                activeLyrics,
                lyricsMode,
                toggleGlobalMute,
                setIsGlobalMuted,
                setGlobalVolume,
                setActiveLyrics,
                setLyricsMode
            }}
        >
            {children}
        </AudioContext.Provider>
    )
}

export function useAudio() {
    const context = useContext(AudioContext)
    if (context === undefined) {
        throw new Error("useAudio must be used within an AudioProvider")
    }
    return context
}
