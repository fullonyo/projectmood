"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useStudioBlock } from "@/hooks/use-studio-block"

import { Music, VolumeX, Play, Pause } from "lucide-react"
import { useState, useRef, useEffect, useMemo } from "react"
import { useAudio } from "./audio-context"
import { useLyrics } from "./lyrics-context"

export type MediaType = 'video' | 'music' | 'audio' | 'media'

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
    audioStyle?: 'classic' | 'aura'
}

interface LyricLine {
    time: number
    text: string
}

const AudioPlayer = ({ 
    audioUrl, isPlaying, togglePlay, progress, setProgress, scale = 1, audioMetadata, 
    renderLyricsOverlay, isGlobalMuted, audioRef, handleTimeUpdate, currentTime, setCurrentTime, setIsPlaying
}: {
    audioUrl: string;
    isPlaying: boolean;
    togglePlay: (e: React.MouseEvent) => void;
    progress: number;
    setProgress: (p: number) => void;
    scale?: number;
    audioMetadata?: { name?: string; artist?: string };
    renderLyricsOverlay: (mode?: 'audio' | 'overlay') => React.ReactNode;
    isGlobalMuted: boolean;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    handleTimeUpdate: () => void;
    currentTime: number;
    setCurrentTime: (time: number) => void;
    setIsPlaying: (p: boolean) => void;
}) => {
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

    // SEEKING LOGIC
    const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (audioRef.current && audioRef.current.duration) {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percentage = Math.max(0, Math.min(1, x / rect.width))
            const seekTime = percentage * audioRef.current.duration
            audioRef.current.currentTime = seekTime
            setCurrentTime(seekTime)
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
        <div className="w-full h-full flex flex-col justify-center p-[8%] pointer-events-auto group/audio relative overflow-hidden" onClick={togglePlay}>
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                loop
            />

            <div className="flex flex-col w-full min-h-0" style={{ gap: `${Math.max(4, Math.round(12 * scale))}px` }}>
                
                {/* Header: Play Button + Typography */}
                <div className="flex items-center min-w-0" style={{ gap: `${Math.max(8, Math.round(12 * scale))}px` }}>
                    <button 
                        onClick={togglePlay}
                        className="shrink-0 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
                        style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
                    >
                        {isPlaying ? <Pause className="fill-current" style={{ width: `${Math.round(buttonSize/2.5)}px`, height: `${Math.round(buttonSize/2.5)}px` }} /> : <Play className="fill-current ml-1" style={{ width: `${Math.round(buttonSize/2.5)}px`, height: `${Math.round(buttonSize/2.5)}px` }} />}
                    </button>

                    <div className="flex flex-col justify-center min-w-0 overflow-hidden">
                        <h3 className="font-bold text-zinc-900 dark:text-white tracking-tight truncate leading-tight" style={{ fontSize: `${titleSize}px` }}>
                            {audioMetadata?.name || "Untitled Track"}
                        </h3>
                        {audioMetadata?.artist && scale > 0.6 && (
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium tracking-wide truncate opacity-80 uppercase" style={{ fontSize: `${artistSize}px`, marginTop: `${Math.round(1 * scale)}px` }}>
                                {audioMetadata.artist}
                            </p>
                        )}
                    </div>
                </div>

                {/* Waveform Row - Responsive Gap and Flex */}
                <div className="flex items-center w-full min-h-0" style={{ gap: `${Math.max(8, Math.round(12 * scale))}px` }}>
                    <div 
                        className="flex-1 flex items-center justify-between relative overflow-hidden cursor-pointer group/scrub min-w-0" 
                        onClick={handleScrub}
                        style={{ height: `${Math.max(16, Math.round(20 * scale))}px` }}
                    >
                        {/* We use a subset of bars if space is tight to prevent overflow */}
                        {staticHeights.map((h, i) => {
                            const barProgress = (i / 36) * 100;
                            const isActive = barProgress <= progress;

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "transition-all duration-300 rounded-full shrink-0 origin-bottom",
                                        isActive 
                                            ? "bg-gradient-to-t from-rose-500 to-rose-400 dark:from-rose-400 dark:to-rose-300" 
                                            : "bg-zinc-200/80 dark:bg-zinc-800/80",
                                        isPlaying && isActive && "animate-waveform",
                                        // Dynamic bar hiding based on scale to prevent overflow
                                        i > Math.floor(36 * Math.max(0.3, scale)) && "hidden"
                                    )}
                                    style={{
                                        width: `${Math.max(2, barWidth)}px`,
                                        height: `100%`,
                                        transform: `scaleY(${isPlaying ? (h/100) * 0.45 : isActive ? 0.25 : 0.15})`,
                                        willChange: 'transform',
                                        animationDelay: `${i * 0.04}s`,
                                        animationDuration: `${0.6 + (i % 3) * 0.2}s`,
                                        marginRight: i === staticHeights.length - 1 ? 0 : '1px'
                                    }}
                                />
                            )
                        })}
                    </div>

                    {scale > 0.5 && (
                        <div className="shrink-0 text-right tabular-nums font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-tighter" style={{ fontSize: `${Math.max(9, Math.round(11 * scale))}px` }}>
                            {formatTime(currentTime)}
                        </div>
                    )}
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

const AuraPlayer = ({ 
    audioUrl, isPlaying, togglePlay, progress, scale = 1, audioMetadata, 
    audioRef, handleTimeUpdate, setIsPlaying
}: {
    audioUrl: string;
    isPlaying: boolean;
    togglePlay: (e: React.MouseEvent) => void;
    progress: number;
    scale?: number;
    audioMetadata?: { name?: string; artist?: string };
    audioRef: React.RefObject<HTMLAudioElement | null>;
    handleTimeUpdate: () => void;
    setIsPlaying: (p: boolean) => void;
}) => {
    const orbSize = Math.max(80, Math.round(120 * scale))
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 pointer-events-auto group/aura relative" onClick={togglePlay}>
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                loop
            />

            {/* Neural Orb Container */}
            <div className="relative flex items-center justify-center" style={{ width: orbSize, height: orbSize }}>
                
                {/* Orbital Progress Ring */}
                <svg className="absolute inset-0 -rotate-90" width={orbSize} height={orbSize}>
                    <circle
                        cx={orbSize / 2}
                        cy={orbSize / 2}
                        r={(orbSize / 2) - 4}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-zinc-100 dark:text-zinc-800 opacity-20"
                    />
                    <motion.circle
                        cx={orbSize / 2}
                        cy={orbSize / 2}
                        r={(orbSize / 2) - 4}
                        fill="none"
                        stroke="url(#auraGradient)"
                        strokeWidth="3"
                        strokeDasharray={Math.PI * (orbSize - 8)}
                        initial={{ strokeDashoffset: Math.PI * (orbSize - 8) }}
                        animate={{ strokeDashoffset: Math.PI * (orbSize - 8) * (1 - progress / 100) }}
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                    />
                    <defs>
                        <linearGradient id="auraGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#fb7185" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* The Fluid Orb */}
                <motion.div
                    animate={{
                        borderRadius: isPlaying 
                            ? ["42% 58% 70% 30% / 45% 45% 55% 55%", "50% 50% 33% 67% / 55% 27% 73% 45%", "42% 58% 70% 30% / 45% 45% 55% 55%"]
                            : "50%",
                        scale: isPlaying ? [1, 1.05, 1] : 1
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={cn(
                        "relative flex items-center justify-center overflow-hidden transition-all duration-500 shadow-2xl",
                        "bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/10"
                    )}
                    style={{ 
                        width: orbSize - 20, 
                        height: orbSize - 20,
                        boxShadow: isPlaying ? '0 0 40px rgba(244,63,94,0.2)' : 'none'
                    }}
                >
                    {/* Animated Mesh Background (Inside Orb) */}
                    <AnimatePresence>
                        {isPlaying && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 via-fuchsia-500/10 to-blue-500/20 animate-pulse"
                            />
                        )}
                    </AnimatePresence>

                    {/* Play/Pause Central Icon */}
                    <div className="relative z-10 text-zinc-900 dark:text-white opacity-0 group-hover/aura:opacity-100 transition-opacity duration-300">
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </div>
                </motion.div>
            </div>

            {/* Metadata Floating Overlay */}
            <div className="mt-6 flex flex-col items-center text-center max-w-[140%] overflow-visible pointer-events-none">
                <motion.h3 
                    className="font-black text-zinc-900 dark:text-white uppercase tracking-[0.3em] leading-none mb-2"
                    style={{ fontSize: Math.max(10, Math.round(14 * scale)) }}
                >
                    {audioMetadata?.name || "Neural Aura"}
                </motion.h3>
                <p 
                    className="font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] opacity-60"
                    style={{ fontSize: Math.max(8, Math.round(9 * scale)) }}
                >
                    {audioMetadata?.artist || "Atmospheric Sound"}
                </p>
            </div>
        </div>
    )
}

const VideoPlayer = ({ videoId, isPublic, hasInteracted, isGlobalMuted, renderLyricsOverlay }: {
    videoId: string;
    isPublic: boolean;
    hasInteracted: boolean;
    isGlobalMuted: boolean;
    renderLyricsOverlay: () => React.ReactNode;
}) => {
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

const MusicPlayer = ({ trackId, isPublic, hasInteracted, isGlobalMuted, renderLyricsOverlay }: {
    trackId: string;
    isPublic: boolean;
    hasInteracted: boolean;
    isGlobalMuted: boolean;
    renderLyricsOverlay: () => React.ReactNode;
}) => {
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
    lyricsDisplay: localLyricsDisplay,
    audioStyle = 'classic'
}: SmartMediaProps) {
    const { ref, fluidScale } = useStudioBlock()
    const { isGlobalMuted, globalVolume, lyricsMode } = useAudio()
    const { setActiveLyrics } = useLyrics()
    const scale = manualScale ?? fluidScale

    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
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
                audioRef.current.play().catch(e => console.log("Playback blocked", e))
            }
        }
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime
            const duration = audioRef.current.duration || 1
            setCurrentTime(current)
            setProgress((current / duration) * 100)

            if (parsedLyrics.current.length > 0) {
                // Otimização P0: Busca reversa sem clonagem de array para performance máxima
                let activeLine = null;
                for (let i = parsedLyrics.current.length - 1; i >= 0; i--) {
                    if (current >= parsedLyrics.current[i].time) {
                        activeLine = parsedLyrics.current[i];
                        break;
                    }
                }

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
        if (localLyricsDisplay === 'fullscreen' || lyricsMode === 'fullscreen') return mode === 'audio' ? <div style={{ height: Math.round(24 * scale), marginBottom: Math.round(16 * scale) }} /> : null
        if (!currentLyric) return mode === 'audio' ? <div style={{ height: Math.round(24 * scale), marginBottom: Math.round(16 * scale) }} /> : null

        const content = (
            <div 
                className="flex flex-col items-center backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-xl border border-white/10 shadow-lg overflow-hidden"
                style={{
                    padding: Math.round(8 * scale),
                    gap: Math.round(6 * scale)
                }}
            >
                <span className="font-black tracking-[0.4em] opacity-50 uppercase text-rose-500" style={{ fontSize: Math.max(6, Math.round(7 * scale)) }}>Lyrics • Live</span>
                <motion.p
                    key={currentLyric}
                    initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    className="font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white leading-tight max-w-[95%] text-center px-4"
                    style={{
                        fontSize: Math.max(10, Math.round(18 * scale)),
                        textShadow: `0 ${Math.round(4 * scale)}px ${Math.round(12 * scale)}px rgba(0,0,0,0.3)`
                    }}
                >
                    {currentLyric}
                </motion.p>
            </div>
        )

        return mode === 'audio' 
            ? <div className="w-full z-30 pointer-events-none flex justify-center" style={{ padding: `${Math.round(8 * scale)}px 0`, marginBottom: Math.round(16 * scale) }}>{content}</div>
            : <div className="absolute inset-x-0 bottom-[15%] flex flex-col items-center justify-center z-30 pointer-events-none px-6 text-center">{content}</div>
    }

    const renderHUDMarkings = () => (
        <div className="absolute inset-0 pointer-events-none z-20">
            <div 
                className="absolute top-0 right-0 border-t-2 border-r-2 border-zinc-900/10 dark:border-white/10 opacity-40 group-hover:opacity-100 transition-opacity duration-500" 
                style={{ 
                    width: Math.round(24 * scale), 
                    height: Math.round(24 * scale),
                    margin: Math.round(20 * scale) 
                }} 
            />
            <div 
                className="absolute bottom-0 left-0 border-b-2 border-l-2 border-zinc-900/10 dark:border-white/10 opacity-40 group-hover:opacity-100 transition-opacity duration-500" 
                style={{ 
                    width: Math.round(24 * scale), 
                    height: Math.round(24 * scale),
                    margin: Math.round(20 * scale) 
                }} 
            />
        </div>
    )

    let content = null
    
    if (mediaType === 'audio' && audioUrl) {
        content = audioStyle === 'aura' ? (
            <AuraPlayer 
                audioUrl={audioUrl} isPlaying={isPlaying} togglePlay={togglePlay} progress={progress} scale={scale} 
                audioMetadata={audioMetadata} audioRef={audioRef} handleTimeUpdate={handleTimeUpdate} setIsPlaying={setIsPlaying}
            />
        ) : (
            <AudioPlayer 
                audioUrl={audioUrl} isPlaying={isPlaying} togglePlay={togglePlay} progress={progress} setProgress={setProgress} scale={scale} 
                audioMetadata={audioMetadata} renderLyricsOverlay={renderLyricsOverlay} isGlobalMuted={isGlobalMuted} 
                audioRef={audioRef} handleTimeUpdate={handleTimeUpdate} currentTime={currentTime} setCurrentTime={setCurrentTime} setIsPlaying={setIsPlaying}
            />
        )
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
                mediaType === 'audio' && audioStyle === 'classic' && isPlaying && "scale-[1.02]",
                mediaType === 'audio' && audioStyle === 'aura' && "overflow-visible"
            )}
        >
            {mediaType !== 'audio' && renderHUDMarkings()}
            {content}
            {!isPublic && <div className="absolute inset-0 bg-transparent z-10" />}
        </div>
    )
}
