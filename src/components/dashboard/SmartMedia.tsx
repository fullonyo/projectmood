"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useStudioBlock } from "@/hooks/use-studio-block"

import { Music, VolumeX, Play, Pause } from "lucide-react"
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

const AudioPlayer = ({ 
    audioUrl, isPlaying, togglePlay, progress, setProgress, scale = 1, audioMetadata, 
    renderLyricsOverlay, isGlobalMuted, audioRef, handleTimeUpdate, setIsPlaying
}: any) => {
    // Generate static heights for waveform - more striking and organic variations
    const staticHeights = useMemo(() => {
        return [...Array(36)].map((_, i) => {
            const val = 40 + Math.sin(i * 0.6) * 40 + Math.cos(i * 1.4) * 20;
            return Math.max(15, Math.min(100, Math.abs(val)));
        });
    }, []);

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "0:00"
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const currentTime = audioRef.current?.currentTime || 0

    // SEEKING LOGIC
    const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (audioRef.current && audioRef.current.duration) {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percentage = Math.max(0, Math.min(1, x / rect.width))
            const seekTime = percentage * audioRef.current.duration
            audioRef.current.currentTime = seekTime
            setProgress(percentage * 100)
        }
    }

    // Adjusted sizes for better harmony
    const buttonSize = Math.max(40, Math.round(48 * scale))
    const titleSize = Math.max(14, Math.round(18 * scale))
    const artistSize = Math.max(10, Math.round(12 * scale))
    const barWidth = Math.max(3, Math.round(4 * scale))
    const barGap = Math.max(2, Math.round(3 * scale))

    return (
        <div className="w-full h-full flex flex-col justify-center p-6 pointer-events-auto group/audio relative" onClick={togglePlay}>
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                loop
            />

            <div className="flex flex-col w-full mx-auto" style={{ gap: `${Math.round(20 * scale)}px` }}>
                
                {/* Header: Play Button + Typography */}
                <div className="flex items-center" style={{ gap: `${Math.round(16 * scale)}px` }}>
                    <button 
                        onClick={togglePlay}
                        className="shrink-0 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
                        style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
                    >
                        {isPlaying ? <Pause className="fill-current" style={{ width: `${Math.round(buttonSize/2.5)}px`, height: `${Math.round(buttonSize/2.5)}px` }} /> : <Play className="fill-current ml-1" style={{ width: `${Math.round(buttonSize/2.5)}px`, height: `${Math.round(buttonSize/2.5)}px` }} />}
                    </button>

                    <div className="flex flex-col justify-center overflow-hidden">
                        <h3 className="font-semibold text-zinc-900 dark:text-white tracking-tight truncate leading-tight" style={{ fontSize: `${titleSize}px` }}>
                            {audioMetadata?.name || "Untitled Track"}
                        </h3>
                        {audioMetadata?.artist && (
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium tracking-wide truncate opacity-80 uppercase" style={{ fontSize: `${artistSize}px`, marginTop: `${Math.round(2 * scale)}px` }}>
                                {audioMetadata.artist}
                            </p>
                        )}
                    </div>
                </div>

                {/* Waveform Row */}
                <div className="flex items-center" style={{ gap: `${Math.round(16 * scale)}px` }}>
                    <div 
                        className="flex-1 flex items-center justify-between relative overflow-hidden cursor-pointer group/scrub" 
                        onClick={handleScrub}
                        style={{ height: `${Math.round(40 * scale)}px`, gap: `${barGap}px` }}
                    >
                        {staticHeights.map((h, i) => {
                            const barProgress = (i / 36) * 100;
                            const isActive = barProgress <= progress;

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "transition-all duration-300 rounded-full shrink-0",
                                        isActive 
                                            ? "bg-gradient-to-t from-rose-500 to-rose-400 dark:from-rose-400 dark:to-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]" 
                                            : "bg-zinc-200/80 dark:bg-zinc-800/80",
                                        isPlaying && isActive && "animate-waveform",
                                        "group-hover/scrub:brightness-110"
                                    )}
                                    style={{
                                        width: `${barWidth}px`,
                                        height: isPlaying ? `${h}%` : isActive ? '25%' : '15%',
                                        animationDelay: `${i * 0.04}s`,
                                        animationDuration: `${0.6 + (i % 3) * 0.2}s`
                                    }}
                                />
                            )
                        })}
                    </div>

                    <div className="shrink-0 text-right tabular-nums font-mono font-semibold text-zinc-400 dark:text-zinc-500 tracking-tighter" style={{ fontSize: `${Math.max(10, Math.round(12 * scale))}px`, width: `${Math.round(36 * scale)}px` }}>
                        {formatTime(currentTime)}
                    </div>
                </div>

            </div>

            {renderLyricsOverlay('audio')}

            {isGlobalMuted && (
                <div className="absolute top-0 right-4 p-1.5 rounded-full bg-red-500/10 text-red-500 animate-pulse backdrop-blur-md">
                    <VolumeX className="w-3 h-3" />
                </div>
            )}
        </div>
    )
}

const VideoPlayer = ({ videoId, isPublic, hasInteracted, isGlobalMuted, renderLyricsOverlay }: any) => {
    const muteParam = (hasInteracted && !isGlobalMuted) ? '0' : '1';
    const autoplayParam = isPublic ? `&autoplay=1&mute=${muteParam}` : '';

    return (
        <>
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}&controls=1&rel=0${autoplayParam}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full grayscale-[0.1] hover:grayscale-0 transition-all duration-1000 object-cover"
            />
            {renderLyricsOverlay()}
        </>
    )
}

const MusicPlayer = ({ trackId, isPublic, hasInteracted, isGlobalMuted, renderLyricsOverlay }: any) => {
    const spotifyAutoplay = isPublic && hasInteracted && !isGlobalMuted ? '&autoplay=1' : '';

    return (
        <div className="w-full h-full relative rounded-[32px] overflow-hidden p-4 flex flex-col">
            {isGlobalMuted ? (
                <div className="w-full h-full bg-zinc-100/10 dark:bg-zinc-900/10 border border-dashed border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl flex flex-col items-center justify-center gap-3 animate-in fade-in duration-500">
                    <VolumeX className="w-6 h-6 text-zinc-400" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Audio Suspended</span>
                </div>
            ) : (
                <iframe
                    src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator${spotifyAutoplay}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="transition-all duration-1000 grayscale-[0.2] hover:grayscale-0 flex-1 rounded-2xl shadow-inner"
                />
            )}
            {renderLyricsOverlay()}
        </div>
    )
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
    const { ref, fluidScale } = useStudioBlock()
    const { isGlobalMuted, globalVolume, setActiveLyrics, lyricsMode } = useAudio()
    const scale = manualScale ?? fluidScale

    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentLyric, setCurrentLyric] = useState<string>("")
    const audioRef = useRef<HTMLAudioElement>(null)

    const parsedLyrics = useRef<LyricLine[]>([])
    
    // Lyrics Parser
    useEffect(() => {
        if (!lyrics) {
            parsedLyrics.current = []
            return
        }

        const lines = lyrics.split('\n')
        const parsed = lines.map(line => {
            const match = line.match(/\[(\d{2}):(\d{2})(?:\.\d+)?\]\s*(.*)/)
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

    // Autoplay sync
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
            const duration = audioRef.current.duration || 1
            setProgress((current / duration) * 100)

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

    useEffect(() => {
        return () => {
            if (localLyricsDisplay === 'fullscreen' || lyricsMode === 'fullscreen') {
                setActiveLyrics(null)
            }
        }
    }, [localLyricsDisplay, lyricsMode, setActiveLyrics])

    useEffect(() => {
        if (!isPlaying && (localLyricsDisplay === 'fullscreen' || lyricsMode === 'fullscreen')) {
            setActiveLyrics(null)
        }
    }, [isPlaying, localLyricsDisplay, lyricsMode, setActiveLyrics])

    const renderLyricsOverlay = (mode: 'audio' | 'overlay' = 'overlay') => {
        if (localLyricsDisplay === 'fullscreen' || lyricsMode === 'fullscreen') return mode === 'audio' ? <div className="h-6 mb-4" /> : null
        if (!currentLyric) return mode === 'audio' ? <div className="h-6 mb-4" /> : null

        const content = (
            <div className="flex flex-col items-center gap-1.5 backdrop-blur-md bg-white/5 dark:bg-black/20 p-2 rounded-xl border border-white/10 shadow-lg">
                <span className="text-[7px] font-black tracking-[0.4em] opacity-50 uppercase text-rose-500">Lyrics • Live</span>
                <motion.p
                    key={currentLyric}
                    initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    className="font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white leading-tight max-w-[95%] text-center px-4"
                    style={{
                        fontSize: Math.max(10, Math.round(16 * scale * 0.8)),
                        textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                >
                    {currentLyric}
                </motion.p>
            </div>
        )

        return mode === 'audio' 
            ? <div className="w-full py-2 z-30 pointer-events-none flex justify-center mb-4">{content}</div>
            : <div className="absolute inset-x-0 bottom-[15%] flex flex-col items-center justify-center z-30 pointer-events-none px-6 text-center">{content}</div>
    }

    const renderHUDMarkings = () => (
        <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-zinc-900/10 dark:border-white/10 m-5 opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-zinc-900/10 dark:border-white/10 m-5 opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    )

    let content = null
    
    if (mediaType === 'audio' && audioUrl) {
        content = <AudioPlayer 
            audioUrl={audioUrl} isPlaying={isPlaying} togglePlay={togglePlay} progress={progress} setProgress={setProgress} scale={scale} 
            audioMetadata={audioMetadata} renderLyricsOverlay={renderLyricsOverlay} isGlobalMuted={isGlobalMuted} 
            audioRef={audioRef} handleTimeUpdate={handleTimeUpdate} setIsPlaying={setIsPlaying}
        />
    } else if (mediaType === 'video' && videoId) {
        content = <VideoPlayer videoId={videoId} isPublic={isPublic} hasInteracted={hasInteracted} isGlobalMuted={isGlobalMuted} renderLyricsOverlay={renderLyricsOverlay} />
    } else if (mediaType === 'music' && trackId) {
        content = <MusicPlayer trackId={trackId} isPublic={isPublic} hasInteracted={hasInteracted} isGlobalMuted={isGlobalMuted} renderLyricsOverlay={renderLyricsOverlay} />
    } else {
        content = (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 text-center">
                <Music className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-3" />
                <span className="font-bold uppercase text-zinc-400 tracking-[0.2em]" style={{ fontSize: Math.max(9, Math.round(11 * scale)) }}>
                    Media Missing
                </span>
            </div>
        )
    }

    return (
        <div 
            ref={ref} 
            className={cn(
                "w-full h-full relative transition-all duration-700 flex items-center justify-center group",
                mediaType !== 'audio' && "overflow-hidden bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[32px] shadow-xl",
                !isPublic && "cursor-pointer",
                mediaType === 'audio' && "bg-transparent",
                mediaType === 'audio' && isPlaying && "scale-[1.02]"
            )}
        >
            {mediaType !== 'audio' && renderHUDMarkings()}
            {content}
            {!isPublic && <div className="absolute inset-0 bg-transparent z-10" />}
        </div>
    )
}
