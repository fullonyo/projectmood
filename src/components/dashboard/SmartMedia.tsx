"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useStudioBlock } from "@/hooks/use-studio-block"

import { Music, VolumeX } from "lucide-react"
import { useState, useRef, useEffect, useMemo } from "react"
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

    // --- UI HELPERS ---

    const wrapperClasses = cn(
        "w-full h-full relative overflow-hidden transition-all duration-700",
        "bg-[var(--glass-bg)] backdrop-blur-2xl border border-[var(--glass-border)]",
        "rounded-[32px] shadow-2xl group",
        !isPublic && "cursor-pointer"
    )

    const renderHUDMarkings = () => (
        <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black/20 dark:border-white/20 m-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black/20 dark:border-white/20 m-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
    )

    const renderLyricsOverlay = (mode: 'audio' | 'overlay' = 'overlay') => {
        if (localLyricsDisplay === 'fullscreen' || lyricsMode === 'fullscreen') return mode === 'audio' ? <div className="h-6 mb-4" /> : null
        if (!currentLyric) return mode === 'audio' ? <div className="h-6 mb-4" /> : null

        const content = (
            <div className="flex flex-col items-center gap-1">
                <span className="text-[6px] font-black tracking-[0.4em] opacity-30 uppercase">Lyrics // Live</span>
                <motion.p
                    key={currentLyric}
                    initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
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

        return mode === 'audio' 
            ? <div className="w-full py-2 z-30 pointer-events-none flex justify-center mb-4">{content}</div>
            : <div className="absolute inset-x-0 top-[15%] flex flex-col items-center justify-center z-30 pointer-events-none px-6 text-center">{content}</div>
    }

    // --- RENDERING ---

    let mediaContent: React.ReactNode = null

    if (mediaType === 'audio' && audioUrl) {
        mediaContent = (
            <div className="w-full h-full flex flex-col items-center justify-center pointer-events-auto" onClick={togglePlay}>
                {/* Background Ambient Glow */}
                <div 
                    className={cn(
                        "absolute inset-0 bg-gradient-to-br from-rose-400/10 via-transparent to-violet-500/10 transition-opacity duration-1000 pointer-events-none",
                        isPlaying ? "opacity-100" : "opacity-0"
                    )}
                />

                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    loop
                />

                <div className="flex flex-col items-center justify-center w-full relative z-10 shrink-0 px-4">
                    {/* Organic Centered Waveform */}
                    <div 
                        className="flex items-center justify-center opacity-90"
                        style={{ 
                            height: `${Math.max(32, Math.round(56 * scale))}px`, 
                            gap: `${Math.max(2, Math.round(3 * scale))}px`,
                            marginBottom: `${Math.max(12, Math.round(20 * scale))}px`
                        }}
                    >
                        {[...Array(32)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "transition-all duration-300 rounded-full shrink-0",
                                    isPlaying 
                                        ? "bg-gradient-to-t from-rose-400 to-violet-400 dark:from-rose-500 dark:to-violet-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" 
                                        : "bg-zinc-300/50 dark:bg-zinc-600/50"
                                )}
                                style={{
                                    width: `${Math.max(2, Math.round(3 * scale))}px`,
                                    height: isPlaying ? `${15 + Math.random() * 85}%` : `${Math.max(4, Math.round(6 * scale))}px`,
                                    animationDelay: `${i * 0.03}s`,
                                    transform: isPlaying ? `scaleY(${0.8 + Math.random() * 0.4})` : 'scaleY(1)'
                                }}
                            />
                        ))}
                    </div>

                    {/* Meta Info HUD */}
                    <div className="text-center overflow-hidden w-full flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2">
                            {isPlaying && (
                                <div className="flex gap-[2px] items-center shrink-0">
                                    <div className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
                                    <div className="w-1 h-1 rounded-full bg-rose-400 animate-pulse delay-75" />
                                    <div className="w-1 h-1 rounded-full bg-rose-400 animate-pulse delay-150" />
                                </div>
                            )}
                            <p className="font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 truncate" style={{ fontSize: Math.max(14, Math.round(22 * scale)) }}>
                                {audioMetadata?.name || "Untitled Track"}
                            </p>
                        </div>
                        
                        {audioMetadata?.artist && (
                            <p className="font-medium text-zinc-500 dark:text-zinc-400 truncate opacity-80" style={{ fontSize: Math.max(10, Math.round(14 * scale)), marginTop: `${Math.max(2, Math.round(6 * scale))}px` }}>
                                {audioMetadata.artist}
                            </p>
                        )}
                    </div>
                </div>

                {renderLyricsOverlay('audio')}

                {isGlobalMuted && (
                    <div className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-500 animate-pulse border border-red-500/20 z-20 backdrop-blur-md">
                        <VolumeX className="w-4 h-4" />
                    </div>
                )}

                {/* Progress Glowing Edge */}
                <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden rounded-b-[32px]">
                    <div className="w-full bg-black/5 dark:bg-white/5" style={{ height: `${Math.max(4, Math.round(6 * scale))}px` }}>
                        <div
                            className="h-full bg-gradient-to-r from-rose-400 via-fuchsia-400 to-violet-500 transition-all duration-300 relative group-hover:brightness-110"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // YouTube Logic
    if (mediaType === 'video' && videoId) {
        const muteParam = (hasInteracted && !isGlobalMuted) ? '0' : '1';
        const autoplayParam = isPublic ? `&autoplay=1&mute=${muteParam}` : '';

        mediaContent = (
            <>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}&controls=1&rel=0${autoplayParam}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                />
                {renderLyricsOverlay()}
            </>
        )
    }

    // Spotify Logic
    if (mediaType === 'music' && trackId) {
        const spotifyAutoplay = isPublic && hasInteracted && !isGlobalMuted ? '&autoplay=1' : '';

        mediaContent = (
            <div className="w-full h-full relative rounded-2xl overflow-hidden p-4">
                {isGlobalMuted ? (
                    <div className="w-full h-full bg-zinc-100/10 dark:bg-zinc-900/10 border border-dashed border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl flex flex-col items-center justify-center gap-3 animate-in fade-in duration-500">
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
                        className="transition-all duration-1000 grayscale-[0.3] hover:grayscale-0"
                    />
                )}
                {renderLyricsOverlay()}
            </div>
        )
    }

    if (!mediaContent) {
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

    return (
        <div 
            ref={ref} 
            className={cn(
                wrapperClasses, 
                mediaType === 'audio' && isPlaying && "shadow-[0_10px_40px_-10px_rgba(244,63,94,0.15)] dark:shadow-[0_10px_40px_-10px_rgba(244,63,94,0.1)]",
                mediaType === 'audio' && "active:scale-[0.97]"
            )}
        >
            {renderHUDMarkings()}
            {mediaContent}
            {!isPublic && (
                <div className="absolute inset-0 bg-transparent z-10" />
            )}
        </div>
    )
}
