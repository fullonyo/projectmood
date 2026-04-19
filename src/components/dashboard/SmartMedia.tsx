"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useStudioBlock } from "@/hooks/use-studio-block"

import { Play, Pause, Music, Volume2, VolumeX } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useAudio } from "./audio-context"

export type MediaType = 'video' | 'music' | 'audio'

interface SmartMediaProps {
    mediaType: MediaType
    videoId?: string
    trackId?: string
    audioUrl?: string // Base64 or URL
    audioMetadata?: {
        name?: string
        artist?: string
    }
    isPublic?: boolean
    scale?: number
    hasInteracted?: boolean
    lyrics?: string // Valid format: [mm:ss] text
    lyricsDisplay?: 'integrated' | 'fullscreen'
}

interface LyricLine {
    time: number
    text: string
}

/**
 * SmartMedia - Padronizado com Studio FUS 💎
 * Renderizador de mídia (YouTube/Spotify/Audio) com escala fluida e suporte a autoplay seguro.
 */
export function SmartMedia({
    mediaType,
    videoId,
    trackId,
    audioUrl,
    audioMetadata,
    isPublic = false,
    scale: manualScale,
    hasInteracted = false,
    lyrics,
    lyricsDisplay: localLyricsDisplay
}: SmartMediaProps) {
    // Hook Padronizado Studio
    const { ref, fluidScale, viewportScale } = useStudioBlock()
    const { isGlobalMuted, globalVolume, setActiveLyrics, lyricsMode } = useAudio()
    const scale = manualScale ?? fluidScale

    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentLyric, setCurrentLyric] = useState<string>("")
    const audioRef = useRef<HTMLAudioElement>(null)

    // Lyrics Parser
    const parsedLyrics = useRef<LyricLine[]>([])
    useEffect(() => {
        if (!lyrics) {
            parsedLyrics.current = []
            return
        }

        const lines = lyrics.split('\n')
        const parsed = lines.map(line => {
            const match = line.match(/\[(\d{2}):(\d{2})\]\s*(.*)/)
            if (match) {
                const mins = parseInt(match[1])
                const secs = parseInt(match[2])
                return {
                    time: mins * 60 + secs,
                    text: match[3].trim()
                }
            }
            return null
        }).filter((l): l is LyricLine => l !== null)

        parsedLyrics.current = parsed.sort((a, b) => a.time - b.time)
    }, [lyrics])

    // Sync with global interaction for autoplay
    useEffect(() => {
        if (mediaType === 'audio' && audioUrl && isPublic && hasInteracted && audioRef.current) {
            if (isGlobalMuted) {
                audioRef.current.pause()
            } else {
                audioRef.current.play().catch(e => console.log("Autoplay blocked", e))
                setIsPlaying(true)
            }
        }
    }, [hasInteracted, isPublic, audioUrl, mediaType, isGlobalMuted])

    // Specific effect for manual mute toggle on HTML5 audio
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isGlobalMuted
            audioRef.current.volume = globalVolume
        }
    }, [isGlobalMuted, globalVolume])

    const togglePlay = (e: React.MouseEvent) => {
        if (!isPublic) return // Prevent interaction in editor if not intended, or let it work?
        e.stopPropagation()
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime
            const duration = audioRef.current.duration
            setProgress((current / duration) * 100)

            // Sync Lyrics
            if (parsedLyrics.current.length > 0) {
                const activeLine = [...parsedLyrics.current]
                    .reverse()
                    .find(line => current >= line.time)

                if (activeLine && activeLine.text !== currentLyric) {
                    setCurrentLyric(activeLine.text)
                    if (localLyricsDisplay === 'fullscreen' || lyricsMode === 'fullscreen') {
                        setActiveLyrics(activeLine.text)
                    }
                }
            }
        }
    }

    // Cleanup global lyrics on unmount or when playing stops
    useEffect(() => {
        return () => {
            if (localLyricsDisplay === 'fullscreen' || lyricsMode === 'fullscreen') {
                setActiveLyrics(null)
            }
        }
    }, [localLyricsDisplay, lyricsMode])

    useEffect(() => {
        if (!isPlaying && (localLyricsDisplay === 'fullscreen' || lyricsMode === 'fullscreen')) {
            setActiveLyrics(null)
        }
    }, [isPlaying, localLyricsDisplay, lyricsMode])

    // SHARED LYRICS OVERLAY (Smart Layout)
    const renderLyricsOverlay = (mode: 'audio' | 'overlay' = 'overlay') => {
        // Se o bloco estiver configurado para fullscreen ou o modo global for fullscreen, as legendas aparecem no overlay global
        if (localLyricsDisplay === 'fullscreen' || lyricsMode === 'fullscreen') return mode === 'audio' ? <div className="h-6 mb-4" /> : null

        if (!currentLyric) return mode === 'audio' ? <div className="h-6 mb-4" /> : null

        const content = (
            <div className="flex flex-col items-center gap-1">
                <span className="text-[6px] font-black tracking-[0.4em] opacity-30 uppercase">Lyrics // Live</span>
                <motion.p
                    key={currentLyric}
                    initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
                    className="font-black uppercase tracking-[0.3em] text-black dark:text-white leading-tight max-w-[90%] text-center"
                    style={{
                        fontSize: Math.max(9, Math.round(14 * scale * 0.8)),
                        textShadow: '0 0 20px rgba(0,0,0,0.2)'
                    }}
                >
                    {currentLyric}
                </motion.p>
            </div>
        )

        if (mode === 'audio') {
            return (
                <div className="w-full py-2 z-30 pointer-events-none flex justify-center mb-4">
                    {content}
                </div>
            )
        }

        return (
            <div className="absolute inset-x-0 top-[15%] flex flex-col items-center justify-center z-30 pointer-events-none px-6 text-center">
                {content}
            </div>
        )
    }

    // Common Wrapper for premium look
    const wrapperClasses = cn(
        "w-full h-full relative overflow-hidden transition-all duration-700 rounded-3xl",
        "bg-zinc-100 dark:bg-zinc-900",
        !isPublic && "cursor-pointer group"
    )

    // Audio Logic (Custom HUD Player)
    if (mediaType === 'audio' && audioUrl) {
        return (
            <div
                ref={ref}
                className={cn(wrapperClasses, "bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-8 shadow-xl border border-zinc-100 dark:border-zinc-800")}
            >
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    loop
                />

                {/* Waveform / Visualizer Placeholder */}
                <div className="flex items-end gap-[3px] h-10 mb-6 opacity-40">
                    {[...Array(16)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-1 bg-blue-500 transition-all duration-300 rounded-full",
                                isPlaying ? "animate-pulse" : "h-1"
                            )}
                            style={{
                                height: isPlaying ? `${20 + Math.random() * 80}%` : '4px',
                                animationDelay: `${i * 0.1}s`
                            }}
                        />
                    ))}
                </div>

                {/* Meta HUD */}
                <div className="text-center mb-6 overflow-hidden w-full">
                    <p className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white truncate" style={{ fontSize: Math.max(10, Math.round(14 * scale)) }}>
                        {audioMetadata?.name || "Untitled Track"}
                    </p>
                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest truncate mt-1" style={{ fontSize: Math.max(8, Math.round(10 * scale)) }}>
                        {audioMetadata?.artist || "Local Entry"}
                    </p>
                </div>

                {/* Progress HUD */}
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-6 relative overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {renderLyricsOverlay('audio')}

                {/* Controls HUD */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                        style={{ width: Math.round(48 * scale), height: Math.round(48 * scale) }}
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5" style={{ width: Math.round(20 * scale), height: Math.round(20 * scale) }} />
                        ) : (
                            <Play className="w-5 h-5 translate-x-0.5" style={{ width: Math.round(20 * scale), height: Math.round(20 * scale) }} />
                        )}
                    </button>
                    {isGlobalMuted && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 animate-pulse">
                            <VolumeX className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {!isPublic && (
                    <div className="absolute inset-0 bg-transparent z-10" />
                )}
            </div>
        )
    }



    // YouTube Logic
    if (mediaType === 'video' && videoId) {
        const muteParam = (hasInteracted && !isGlobalMuted) ? '0' : '1';
        const autoplayParam = isPublic ? `&autoplay=1&mute=${muteParam}` : '';

        return (
            <div ref={ref} className={wrapperClasses}>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}&controls=1&rel=0${autoplayParam}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full grayscale-[0.2] hover:grayscale-0 transition-all duration-1000 rounded-3xl"
                />
                {renderLyricsOverlay()}
                {!isPublic && (
                    <div className="absolute inset-0 bg-transparent z-10" />
                )}
            </div>
        )
    }

    // Spotify Logic
    if (mediaType === 'music' && trackId) {
        const spotifyAutoplay = isPublic && hasInteracted && !isGlobalMuted ? '&autoplay=1' : '';

        return (
            <div
                ref={ref}
                className={cn(wrapperClasses, "bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800 items-center justify-center flex group/spotify")}
                style={{ padding: Math.round(12 * scale) }}
            >
                <div className="w-full h-full relative">
                    {isGlobalMuted ? (
                        <div className="w-full h-full bg-zinc-100/10 dark:bg-zinc-900/10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 animate-in fade-in duration-500">
                            <VolumeX className="w-5 h-5 text-zinc-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Audio Suspended</span>
                        </div>
                    ) : (
                        <iframe
                            src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator${spotifyAutoplay}`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="rounded-2xl transition-all duration-1000 grayscale-[0.3] group-hover:grayscale-0"
                        />
                    )}
                    {renderLyricsOverlay()}
                    {!isPublic && (
                        <div className="absolute inset-0 bg-transparent z-10" />
                    )}
                </div>
            </div>
        )
    }

    return (
        <div ref={ref} className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 text-center">
            <Music className="w-8 h-8 text-zinc-300 mb-2" />
            <span
                className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest leading-tight"
                style={{ fontSize: Math.max(8, Math.round(10 * scale)) }}
            >
                Media Missing
            </span>
        </div>
    )
}
