"use client"

// YouTube IFrame API TypeScript Declarations
declare global {
    interface Window {
        YT: typeof YT
        onYouTubeIframeAPIReady?: () => void
    }
    namespace YT {
        enum PlayerState {
            UNSTARTED = -1,
            ENDED = 0,
            PLAYING = 1,
            PAUSED = 2,
            BUFFERING = 3,
            CUED = 5
        }
        interface PlayerEvent {
            target: Player
        }
        interface OnStateChangeEvent {
            data: number
            target: Player
        }
        class Player {
            constructor(element: HTMLDivElement | string, options: {
                videoId: string
                width?: string | number
                height?: string | number
                playerVars?: Record<string, number | string>
                events?: {
                    onReady?: (event: PlayerEvent) => void
                    onStateChange?: (event: OnStateChangeEvent) => void
                    onError?: (event: { data: number }) => void
                }
            })
            getCurrentTime(): number
            getDuration(): number
            playVideo(): void
            pauseVideo(): void
            mute(): void
            unMute(): void
            destroy(): void
        }
    }
}

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import { useStudioBlock } from "@/hooks/use-studio-block"

import { Music, VolumeX, Play, Pause } from "lucide-react"
import { useState, useRef, useEffect, useLayoutEffect, useMemo, useId } from "react"
import { useAudio } from "./audio-context"
import { useLyrics } from "./lyrics-context"
import type { YouTubePlaylistItem } from "@/types/database"

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
    audioStyle?: 'classic' | 'aura' | 'dots'
    playlistMode?: boolean
    playlist?: YouTubePlaylistItem[]
    /** Lista visível no bloco para escolher faixa (requer fila com itens). */
    jukeboxMode?: boolean
}

interface LyricLine {
    time: number
    text: string
}

const AudioPlayer = ({ 
    audioUrl, isPlaying, togglePlay, progress, setProgress, scale = 1, audioMetadata, 
    isGlobalMuted, audioRef, handleTimeUpdate, currentTime, setCurrentTime, setIsPlaying
}: {
    audioUrl: string;
    isPlaying: boolean;
    togglePlay: (e: React.MouseEvent) => void;
    progress: number;
    setProgress: (p: number) => void;
    scale?: number;
    audioMetadata?: { name?: string; artist?: string };
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
                src={audioUrl} crossOrigin="anonymous"
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
    const motionIntensity = useMotionValue(0)
    const smoothIntensity = useSpring(motionIntensity, { stiffness: 300, damping: 20 })
    
    // Derived values for animations - these update directly in the DOM
    const orbScale = useTransform(smoothIntensity, [0, 1], [1, 1.15])
    const glowIntensity = useTransform(smoothIntensity, [0, 1], [0.2, 0.6])
    const glowSpread = useTransform(smoothIntensity, [0, 1], [20, 80])
    const meshOpacity = useTransform(smoothIntensity, [0, 1], [0.3, 1])
    const meshScale = useTransform(smoothIntensity, [0, 1], [1, 1.2])
    const boxShadowTransform = useTransform(smoothIntensity, v => 
        `0 0 ${20 + v * 60}px rgba(244,63,94,${0.2 + v * 0.4})`
    )

    const analyserRef = useRef<AnalyserNode | null>(null)
    const audioCtxRef = useRef<AudioContext | null>(null)
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
    const animationFrameRef = useRef<number | undefined>(undefined)

    // Audio Analysis Engine
    useEffect(() => {
        if (!audioRef.current || !isPlaying) {
            motionIntensity.set(0)
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
            return
        }

        const setupAudioContext = () => {
            if (!audioRef.current) return
            try {
                if (!audioCtxRef.current) {
                    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext)
                    audioCtxRef.current = new AudioContextClass()
                }

                const audioCtx = audioCtxRef.current
                
                if (!sourceRef.current) {
                    const audioEl = audioRef.current
                    sourceRef.current = audioCtx.createMediaElementSource(audioEl)
                    analyserRef.current = audioCtx.createAnalyser()
                    analyserRef.current.fftSize = 256
                    sourceRef.current.connect(analyserRef.current)
                    analyserRef.current.connect(audioCtx.destination)
                }

                if (audioCtx.state === 'suspended') {
                    audioCtx.resume()
                }
            } catch (e) {
                console.warn("Audio Context failed", e)
            }
        }

        setupAudioContext()

        const dataArray = new Uint8Array(analyserRef.current?.frequencyBinCount || 0)
        const analyze = () => {
            if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray)
                // Get average of low frequencies (Bass) for the pulse
                const lowFreqs = dataArray.slice(0, 10)
                const average = lowFreqs.reduce((a, b) => a + b, 0) / lowFreqs.length
                motionIntensity.set(average / 255) // Updates Motion Value directly (No Re-render)
            }
            animationFrameRef.current = requestAnimationFrame(analyze)
        }

        analyze()

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        }
    }, [isPlaying, audioRef])

    return (
        <div className="w-full h-full flex flex-col items-center justify-center pointer-events-auto p-4 group/aura relative" onClick={togglePlay}>
            <audio
                ref={audioRef}
                src={audioUrl} crossOrigin="anonymous"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                loop
            />

            {/* Neural Orb Container */}
            <motion.div className="relative flex items-center justify-center" style={{ width: orbSize, height: orbSize, scale: orbScale }}>
                
                {/* Orbital Progress Ring */}
                <svg className="absolute inset-0 -rotate-90 z-20 pointer-events-none" width={orbSize} height={orbSize}>
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
                            : "50%"
                    }}
                    transition={{
                        borderRadius: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className={cn(
                        "relative flex items-center justify-center overflow-hidden transition-all duration-500 shadow-2xl",
                        "bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/10"
                    )}
                    style={{ 
                        width: orbSize - 20, 
                        height: orbSize - 20,
                        boxShadow: boxShadowTransform
                    }}
                >
                    {/* Animated Mesh Background (Inside Orb) */}
                    <AnimatePresence>
                        {isPlaying && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                style={{ 
                                    opacity: meshOpacity,
                                    scale: meshScale
                                }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gradient-to-tr from-rose-500/40 via-fuchsia-500/20 to-blue-500/40"
                            />
                        )}
                    </AnimatePresence>

                    {/* Play/Pause Central Icon */}
                    <div className="relative z-10 text-zinc-900 dark:text-white opacity-0 group-hover/aura:opacity-100 transition-opacity duration-300">
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </div>
                </motion.div>
                </motion.div>

            <div 
                className="flex flex-col items-center text-center max-w-[140%] overflow-visible pointer-events-none z-10"
                style={{ marginTop: Math.round(24 * scale) }}
            >
                <motion.h3 
                    className="font-black text-zinc-900 dark:text-white uppercase tracking-[0.3em] leading-none mb-2"
                    style={{ fontSize: Math.max(10, Math.round(14 * scale)) }}
                >
                    {audioMetadata?.name || "Unknown Audio"}
                </motion.h3>
            </div>

        </div>
    )
}

const PulseFieldPlayer = ({ 
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
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const audioIntensityRef = useRef(0)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const audioCtxRef = useRef<AudioContext | null>(null)
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
    const audioFrameRef = useRef<number | undefined>(undefined)
    const drawFrameRef = useRef<number | undefined>(undefined)
    const dotsRef = useRef<{x: number, y: number, vx: number, vy: number, size: number, color: string}[]>([])

    // Audio Analysis Engine
    useEffect(() => {
        if (!audioRef.current || !isPlaying) {
            audioIntensityRef.current = 0
            if (audioFrameRef.current) cancelAnimationFrame(audioFrameRef.current)
            return
        }

        const setupAudioContext = () => {
            if (!audioRef.current) return
            try {
                if (!audioCtxRef.current) {
                    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext)
                    audioCtxRef.current = new AudioContextClass()
                }
                const audioCtx = audioCtxRef.current
                if (!sourceRef.current) {
                    sourceRef.current = audioCtx.createMediaElementSource(audioRef.current)
                    analyserRef.current = audioCtx.createAnalyser()
                    analyserRef.current.fftSize = 256
                    sourceRef.current.connect(analyserRef.current)
                    analyserRef.current.connect(audioCtx.destination)
                }
                if (audioCtx.state === 'suspended') audioCtx.resume()
            } catch (e) { console.warn(e) }
        }

        setupAudioContext()

        const dataArray = new Uint8Array(analyserRef.current?.frequencyBinCount || 0)
        const analyze = () => {
            if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray)
                const lowFreqs = dataArray.slice(0, 10)
                const average = lowFreqs.reduce((a, b) => a + b, 0) / lowFreqs.length
                audioIntensityRef.current = average / 255
            }
            audioFrameRef.current = requestAnimationFrame(analyze)
        }
        analyze()

        return () => {
            if (audioFrameRef.current) cancelAnimationFrame(audioFrameRef.current)
        }
    }, [isPlaying, audioRef])

    // Canvas Rendering Engine
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        const padding = 300 // Huge padding to guarantee floating freedom
        
        const resize = () => {
            if (!canvas.parentElement) return
            const rect = canvas.parentElement.getBoundingClientRect()
            
            canvas.width = (rect.width + padding * 2) * dpr
            canvas.height = (rect.height + padding * 2) * dpr
            ctx.scale(dpr, dpr)
            
            // Build particles swarm near the center if empty
            const targetCount = 180 // Fixed density
            if (dotsRef.current.length === 0) {
                const dots = []
                const centerX = (rect.width + padding * 2) / 2
                const centerY = (rect.height + padding * 2) / 2
                
                for(let i = 0; i < targetCount; i++) {
                    // Spawn particles near the center, not scattered across the huge padding
                    const radius = Math.random() * (rect.width / 2)
                    const angle = Math.random() * Math.PI * 2
                    
                    dots.push({ 
                        x: centerX + Math.cos(angle) * radius, 
                        y: centerY + Math.sin(angle) * radius, 
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        size: Math.random() * 2 + 1,
                        color: Math.random() > 0.5 ? '#f43f5e' : '#fb7185'
                    })
                }
                dotsRef.current = dots
            }
        }

        resize()
        
        // Listen to element physical dimension changes (not just window)
        let resizeObserver: ResizeObserver | null = null
        if (canvas.parentElement) {
            resizeObserver = new ResizeObserver(() => resize())
            resizeObserver.observe(canvas.parentElement)
        }

        let frame = 0
        const draw = () => {
            frame++
            const w = canvas.width / dpr
            const h = canvas.height / dpr
            
            // Subtle clear to maintain trails
            // Using clearRect then a light fill to avoid black background on transparent mural
            ctx.clearRect(0, 0, w, h)
            
            const intensity = audioIntensityRef.current
            const dots = dotsRef.current
            const centerX = w / 2
            const centerY = h / 2
            
            for(const dot of dots) {
                const dx = centerX - dot.x
                const dy = centerY - dot.y
                const dist = Math.sqrt(dx * dx + dy * dy) || 1
                
                // Normal vectors
                const nx = dx / dist
                const ny = dy / dist
                
                // 1. Constant Attraction to center (Gravity)
                const gravity = 0.03
                dot.vx += nx * gravity
                dot.vy += ny * gravity
                
                // 2. Orbital Force (Tangential)
                const orbitSpeed = 0.8 * scale
                dot.vx += ny * orbitSpeed * 0.05
                dot.vy -= nx * orbitSpeed * 0.05
                
                // 3. Audio Outward Push (Explosion on Bass)
                // Force WEAKENS as they get closer to the edge to prevent escaping
                const maxRadius = Math.max(w, h) / 2
                const edgeFactor = Math.max(0, 1 - (dist / maxRadius))
                const pushForce = intensity * 4.0 * edgeFactor
                dot.vx -= nx * pushForce
                dot.vy -= ny * pushForce
                
                // 4. Subtle jitter only on high intensity
                if (intensity > 0.6) {
                    dot.vx += (Math.random() - 0.5) * intensity * 0.8
                    dot.vy += (Math.random() - 0.5) * intensity * 0.8
                }
                
                // 5. Speed Limit (Terminal Velocity)
                const maxSpeed = 12 * scale
                const speed = Math.sqrt(dot.vx * dot.vx + dot.vy * dot.vy)
                if (speed > maxSpeed) {
                    dot.vx = (dot.vx / speed) * maxSpeed
                    dot.vy = (dot.vy / speed) * maxSpeed
                }
                
                // Friction (Damping)
                dot.vx *= 0.90
                dot.vy *= 0.90
                
                dot.x += dot.vx
                dot.y += dot.vy
                
                // Render
                const r = (dot.size * scale) * (0.8 + intensity * 2.0)
                ctx.shadowBlur = intensity * 15
                ctx.shadowColor = dot.color
                ctx.fillStyle = dot.color
                ctx.beginPath()
                ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2)
                ctx.fill()
                
                // Strong Boundary Containment - Strictly inside visible canvas
                if (dot.x < 0) { dot.x = 0; dot.vx *= -0.5; }
                if (dot.x > w) { dot.x = w; dot.vx *= -0.5; }
                if (dot.y < 0) { dot.y = 0; dot.vy *= -0.5; }
                if (dot.y > h) { dot.y = h; dot.vy *= -0.5; }
                
                // Progressive Gravity (Attraction increases exponentially with distance)
                const safeZone = maxRadius * 0.4
                if (dist > safeZone) {
                    const pull = Math.pow((dist - safeZone) * 0.02, 1.5)
                    dot.vx += nx * pull
                    dot.vy += ny * pull
                }
            }

            drawFrameRef.current = requestAnimationFrame(draw)
        }
        draw()

        return () => {
            if (resizeObserver) resizeObserver.disconnect()
            if (drawFrameRef.current) cancelAnimationFrame(drawFrameRef.current)
        }
    }, [scale])

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 pointer-events-auto group/dots relative overflow-visible" onClick={togglePlay}>
            <audio
                ref={audioRef}
                src={audioUrl}
                crossOrigin="anonymous"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                loop
            />
            
            <canvas 
                ref={canvasRef} 
                className="absolute pointer-events-none overflow-visible" 
                style={{ 
                    left: -300,
                    top: -300,
                    width: 'calc(100% + 600px)',
                    height: 'calc(100% + 600px)',
                }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center gap-6">
                <motion.div
                    animate={{ 
                        scale: isPlaying ? [1, 1.15, 1] : 1,
                        rotate: isPlaying ? [0, 5, -5, 0] : 0
                    }}
                    transition={{ 
                        scale: { duration: 0.2 },
                        rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="w-20 h-20 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl relative group-hover/dots:scale-110 transition-transform duration-500"
                >
                    <div className="absolute inset-0 bg-rose-500/10 rounded-[2rem] blur-2xl opacity-0 group-hover/dots:opacity-100 transition-opacity" />
                    {isPlaying ? <Pause className="w-8 h-8 text-white fill-current" /> : <Play className="w-8 h-8 text-white fill-current translate-x-1" />}
                </motion.div>

                <div 
                    className="text-center"
                    style={{ marginTop: Math.round(16 * scale) }}
                >
                    <h3 
                        className="font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] max-w-[240px] truncate"
                        style={{ fontSize: Math.max(9, Math.round(12 * scale)) }}
                    >
                        {audioMetadata?.name || 'Unknown Audio'}
                    </h3>
                </div>
            </div>
        </div>
    )
}

const VideoPlayer = ({ 
    videoId,
    isPublic,
    hasInteracted,
    isGlobalMuted,
    onTimeUpdate,
    onPlayStateChange,
    playlistMode,
    playlist,
    jukeboxMode = false,
}: {
    videoId: string;
    isPublic: boolean;
    hasInteracted: boolean;
    isGlobalMuted: boolean;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    onPlayStateChange?: (isPlaying: boolean) => void;
    playlistMode?: boolean;
    playlist?: YouTubePlaylistItem[];
    jukeboxMode?: boolean;
}) => {
    const rawId = useId()
    const ytContainerId = useMemo(() => `yt-player-${rawId.replace(/:/g, "")}`, [rawId])
    const playerRef = useRef<YT.Player | null>(null)
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const apiReadyRef = useRef(false)
    // Refs para leitura nos callbacks do player (closures estáticas)
    const hasInteractedRef = useRef(hasInteracted)
    const isGlobalMutedRef = useRef(isGlobalMuted)
    const isPublicRef = useRef(isPublic)
    const [apiReady, setApiReady] = useState(false)
    const [apiFailed, setApiFailed] = useState(false)
    const [isVideoPlaying, setIsVideoPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const playlistKey = useMemo(
        () => (playlist?.map((p) => p.videoId).join("|") ?? ""),
        [playlist],
    )
    const [currentIndex, setCurrentIndex] = useState(() => {
        if (!playlistMode || !playlist?.length) return 0
        const i = videoId ? playlist.findIndex((p) => p.videoId === videoId) : -1
        return i >= 0 ? i : 0
    })

    const playlistSyncKeyRef = useRef<string | null>(null)
    useLayoutEffect(() => {
        const syncKey = `${playlistMode ? 1 : 0}|${playlistKey}|${videoId ?? ""}`
        if (playlistSyncKeyRef.current === syncKey) return
        playlistSyncKeyRef.current = syncKey

        if (!playlistMode || !playlist?.length) {
            setCurrentIndex(0)
            return
        }
        const i = videoId ? playlist.findIndex((p) => p.videoId === videoId) : -1
        setCurrentIndex((prev) => {
            if (i >= 0) return i
            return Math.min(prev, Math.max(0, playlist.length - 1))
        })
    }, [videoId, playlistMode, playlistKey, playlist])

    const playlistRef = useRef(playlist)
    const playlistModeRef = useRef(playlistMode)
    const currentIndexRef = useRef(currentIndex)
    /** Evita recriar o iframe a cada troca de faixa; sincroniza só com loadVideoById. */
    const lastLoadedVideoIdRef = useRef<string | null>(null)

    // Refs espelho — atualizados sincronamente a cada render.
    hasInteractedRef.current = hasInteracted
    isGlobalMutedRef.current = isGlobalMuted
    isPublicRef.current = isPublic
    playlistRef.current = playlist
    playlistModeRef.current = playlistMode
    currentIndexRef.current = currentIndex

    const markReady = () => {
        apiReadyRef.current = true
        setApiReady(true)
    }

    // Carrega o script da YouTube IFrame API (uma única vez globalmente)
    useEffect(() => {
        if (window.YT && window.YT.Player) { markReady(); return }

        if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const check = setInterval(() => {
                if (window.YT && window.YT.Player) { markReady(); clearInterval(check) }
            }, 100)
            const timeout = setTimeout(() => {
                clearInterval(check)
                if (!apiReadyRef.current) setApiFailed(true)
            }, 8000)
            return () => { clearInterval(check); clearTimeout(timeout) }
        }

        const prev = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => { prev?.(); markReady() }

        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        script.async = true
        script.onerror = () => setApiFailed(true)
        document.head.appendChild(script)

        const timeout = setTimeout(() => { if (!apiReadyRef.current) setApiFailed(true) }, 8000)
        return () => clearTimeout(timeout)
    }, [])

    // Criar / recriar o player quando a API está pronta
    // IMPORTANTE: passa o ID string (não o ref) para o YT.Player.
    // A API substitui o elemento-alvo por um <iframe> no DOM.
    // Usar ID string evita que o React perca a referência ao nó externo
    // e cause o erro "removeChild: node is not a child" no unmount.
    useEffect(() => {
        if (!apiReady || apiFailed) return
        const target = document.getElementById(ytContainerId)
        if (!target) return

        if (playerRef.current) {
            try { playerRef.current.destroy() } catch {}
            playerRef.current = null
        }

        const muteParam = (hasInteracted && !isGlobalMuted) ? 0 : 1
        const autoplayParam = isPublic ? 1 : 0

        const resolvedStartIndex =
            playlistMode && playlist && playlist.length > 0
                ? (() => {
                      const j = videoId ? playlist.findIndex((p) => p.videoId === videoId) : -1
                      return j >= 0 ? j : 0
                  })()
                : 0

        const initialVideoId =
            playlistMode && playlist && playlist.length > 0
                ? playlist[resolvedStartIndex]?.videoId || playlist[0].videoId
                : videoId

        lastLoadedVideoIdRef.current = initialVideoId

        // Modo fila: nunca enviar `playlist: ""` — o iframe trata como playlist inválida e
        // mostra "vídeo não disponível". Trocas de faixa ficam a cargo de loadVideoById.
        const playerVars: Record<string, number | string> = {
            autoplay: autoplayParam,
            mute: muteParam,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            disablekb: 1,
            iv_load_policy: 3,
        }
        if (playlistMode) {
            playerVars.loop = 0
        } else {
            playerVars.loop = 1
            playerVars.playlist = initialVideoId
        }

        playerRef.current = new window.YT.Player(ytContainerId, {
            videoId: initialVideoId,
            width: '100%',
            height: '100%',
            playerVars,
            events: {
                onReady: (event: YT.PlayerEvent) => {
                    lastLoadedVideoIdRef.current = initialVideoId
                    // Sincronização forçada de volume/mute no nascimento do player
                    if (isGlobalMutedRef.current) {
                        event.target.mute()
                    } else if (hasInteractedRef.current) {
                        event.target.unMute()
                        // No estúdio ou público, se já interagiu, tentamos dar play
                        event.target.playVideo()
                    }
                },
                onError: (event: { data: number }) => {
                    // Não avançar automaticamente: erros 101/150 (embed) ou indisponível em sequência
                    // recriavam o player + loadVideoById e geravam loop visível ("vídeo indisponível").
                    console.warn("[YouTube Player] Erro no player:", event.data)
                },
                onStateChange: (event: YT.OnStateChangeEvent) => {
                    const playing = event.data === window.YT.PlayerState.PLAYING
                    const paused = event.data === window.YT.PlayerState.PAUSED
                    const ended = event.data === window.YT.PlayerState.ENDED

                    setIsVideoPlaying(playing)
                    onPlayStateChange?.(playing)

                    if (playing) {
                        // Garantia extra de áudio ao iniciar o play
                        if (!isGlobalMutedRef.current && hasInteractedRef.current) {
                            event.target.unMute()
                            if ((event.target as any).setVolume) {
                                (event.target as any).setVolume(100) // Volume máximo do player, controlado pelo sistema
                            }
                        }

                        if (pollingRef.current) clearInterval(pollingRef.current)
                        pollingRef.current = setInterval(() => {
                            if (playerRef.current?.getCurrentTime && playerRef.current?.getDuration) {
                                const currentTime = playerRef.current.getCurrentTime()
                                const duration = playerRef.current.getDuration() || 1
                                setProgress((currentTime / duration) * 100)
                                onTimeUpdate?.(currentTime, duration)
                            }
                        }, 250)
                    }

                    if (paused) {
                        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
                    }

                    if (ended) {
                        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
                        
                        if (playlistModeRef.current && playlistRef.current && playlistRef.current.length > 1) {
                            const nextIndex = (currentIndexRef.current + 1) % playlistRef.current.length
                            const nextVideo = playlistRef.current[nextIndex]
                            
                            if (nextVideo && nextVideo.videoId) {
                                setCurrentIndex(nextIndex)
                            }
                        }
                    }
                }
            }
        })

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
            lastLoadedVideoIdRef.current = null
            if (playerRef.current) {
                try { playerRef.current.destroy() } catch {}
                playerRef.current = null
            }
        }
    }, [apiReady, apiFailed, videoId, playlistMode, playlistKey, ytContainerId])

    // Troca de vídeo sem destruir o iframe (índice da fila, fim da faixa, etc.)
    useEffect(() => {
        if (!apiReady || apiFailed || !playerRef.current) return

        const targetId =
            playlistMode && playlist && playlist.length > 0
                ? playlist[currentIndex]?.videoId
                : videoId

        if (!targetId || lastLoadedVideoIdRef.current === targetId) return

        try {
            const p = playerRef.current as unknown as { loadVideoById?: (id: string) => void }
            p.loadVideoById?.(targetId)
            lastLoadedVideoIdRef.current = targetId
        } catch {
            /* API ainda não pronta */
        }
    }, [apiReady, apiFailed, currentIndex, videoId, playlistMode, playlistKey, playlist])

    // Mute global
    useEffect(() => {
        if (!playerRef.current) return
        try {
            if (isGlobalMuted) { playerRef.current.mute() } 
            else { playerRef.current.unMute() }
        } catch {}
    }, [isGlobalMuted])

    // Interação do overlay global → play sem mute
    useEffect(() => {
        if (!playerRef.current || !isPublic || !hasInteracted) return
        try {
            if (isGlobalMuted) { playerRef.current.mute() }
            else { playerRef.current.unMute(); playerRef.current.playVideo() }
        } catch {}
    }, [hasInteracted, isPublic, isGlobalMuted])

    const togglePlay = () => {
        if (!playerRef.current) return
        try {
            if (isVideoPlaying) { playerRef.current.pauseVideo() }
            else { playerRef.current.playVideo() }
        } catch {}
    }

    const hasJukeboxQueue =
        !!jukeboxMode && !!playlistMode && !!playlist?.length

    const selectPlaylistIndex = (idx: number) => {
        if (!playlist?.length || idx < 0 || idx >= playlist.length) return
        if (idx === currentIndex) return
        setCurrentIndex(idx)
    }

    // Fallback: se a API falhar, renderiza iframe simples (zero downtime)
    if (apiFailed) {
        const muteParam = (hasInteracted && !isGlobalMuted) ? '0' : '1'
        const autoplayParam = isPublic ? `&autoplay=1&mute=${muteParam}` : ''
        return (
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}&controls=1&rel=0${autoplayParam}`}
                width="100%" height="100%" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
            />
        )
    }

    return (
        <div
            className={cn(
                "w-full h-full min-h-0 flex flex-col",
                hasJukeboxQueue ? "gap-1.5" : "relative",
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={cn(
                    "relative min-w-0 w-full group/video",
                    hasJukeboxQueue ? "flex-1 min-h-[52%]" : "h-full",
                )}
            >
                {/* Player YouTube — div alvo do IFrame API (substitui este elemento por <iframe>) */}
                <div id={ytContainerId} className="w-full h-full min-h-0" />

                {/* Overlay de controles — aparece só no hover */}
                <div
                    className={cn(
                        "absolute inset-0 pointer-events-none transition-opacity duration-300",
                        isHovered ? "opacity-100" : "opacity-0",
                    )}
                >
                    {/* Gradiente sutil na base */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent rounded-b-[32px]" />

                    {/* Botão play/pause central */}
                    <button
                        type="button"
                        onClick={togglePlay}
                        className="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-110 hover:bg-white/20 active:scale-95"
                    >
                        {isVideoPlaying ? (
                            <Pause className="w-5 h-5 text-white fill-white" />
                        ) : (
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        )}
                    </button>

                    {/* Barra de progresso na base */}
                    <div className="pointer-events-auto absolute bottom-3 left-4 right-4">
                        <div className="w-full h-0.5 rounded-full bg-white/20 overflow-hidden">
                            <div
                                className="h-full bg-white/70 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Watermark YouTube (obrigatório pelos ToS) */}
                    <div className="pointer-events-none absolute bottom-5 right-4 opacity-60">
                        <svg viewBox="0 0 90 20" className="h-3 fill-white">
                            <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000" />
                            <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white" />
                            <path d="M34.6024 13.0036L31.3945 1.41846H34.1932L35.3174 6.6701C35.6043 7.96361 35.8136 9.06662 35.95 9.97913H36.0323C36.1264 9.32532 36.3381 8.22937 36.665 6.68892L37.8291 1.41846H40.6278L37.3799 13.0036V18.561H34.6001V13.0036H34.6024Z" />
                        </svg>
                    </div>
                </div>
            </div>

            {hasJukeboxQueue && playlist && (
                <div
                    role="listbox"
                    aria-label="Fila do jukebox"
                    className={cn(
                        "custom-scrollbar pointer-events-auto min-h-0 shrink-0 flex-[0_1_42%] max-h-[42%] overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-2xl border border-zinc-200/25 bg-zinc-100/90 py-1.5 pl-1.5 pr-1 -mr-0.5 backdrop-blur-md dark:border-zinc-700/40 dark:bg-zinc-950/90",
                    )}
                >
                    <div className="flex flex-col gap-1">
                        {playlist.map((item, idx) => {
                            const active = idx === currentIndex
                            const thumb =
                                item.thumbnail ||
                                `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`
                            return (
                                <button
                                    key={`${item.videoId}-${idx}`}
                                    type="button"
                                    role="option"
                                    aria-selected={active}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        selectPlaylistIndex(idx)
                                    }}
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-xl px-1.5 py-1.5 text-left transition-colors",
                                        active
                                            ? "bg-rose-500/25 ring-1 ring-rose-400/80"
                                            : "bg-white/5 hover:bg-white/10",
                                    )}
                                >
                                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                                        <img
                                            src={thumb}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                        {active && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                                                <Play className="h-3.5 w-3.5 fill-white text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={cn(
                                                "truncate text-[10px] font-bold uppercase tracking-tight",
                                                active ? "text-white" : "text-zinc-200",
                                            )}
                                        >
                                            {item.title || `Vídeo ${idx + 1}`}
                                        </p>
                                        {item.channel && (
                                            <p className="truncate text-[8px] font-medium uppercase tracking-wider text-zinc-400">
                                                {item.channel}
                                            </p>
                                        )}
                                    </div>
                                    <span className="shrink-0 tabular-nums text-[9px] font-black text-zinc-500">
                                        {idx + 1}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

const MusicPlayer = ({ trackId, isPublic, hasInteracted, isGlobalMuted }: {
    trackId: string;
    isPublic: boolean;
    hasInteracted: boolean;
    isGlobalMuted: boolean;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<any>(null);

    useEffect(() => {
        if (isGlobalMuted || !containerRef.current) return;

        let controller: any = null;

        const initSpotify = (IFrameAPI: any) => {
            if (!containerRef.current) return;
            
            // Clean up old container child if any
            containerRef.current.innerHTML = '';
            const div = document.createElement('div');
            containerRef.current.appendChild(div);

            const options = {
                uri: `spotify:track:${trackId}`,
                width: '100%',
                height: '100%',
                theme: '0'
            };

            const callback = (EmbedController: any) => {
                controller = EmbedController;
                controllerRef.current = EmbedController;
                
                EmbedController.addListener('ready', () => {
                    if (hasInteracted && !isGlobalMuted) {
                        EmbedController.play();
                    }
                });
            };

            IFrameAPI.createController(div, options, callback);
        };

        if ((window as any).SpotifyIframeApi) {
            initSpotify((window as any).SpotifyIframeApi);
        } else {
            if (!(window as any)._spotifyReadyCallbacks) {
                (window as any)._spotifyReadyCallbacks = [];
                (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
                    (window as any).SpotifyIframeApi = IFrameAPI;
                    (window as any)._spotifyReadyCallbacks?.forEach((cb: any) => cb(IFrameAPI));
                };
                const script = document.createElement('script');
                script.src = "https://open.spotify.com/embed/iframe-api/v1";
                script.async = true;
                document.body.appendChild(script);
            }
            (window as any)._spotifyReadyCallbacks.push(initSpotify);
        }

        return () => {
            if (controller) {
                controller.destroy();
                controllerRef.current = null;
            }
        };
    }, [trackId, isGlobalMuted]);

    useEffect(() => {
        if (controllerRef.current) {
            if (hasInteracted && !isGlobalMuted) {
                controllerRef.current.play();
            } else {
                controllerRef.current.pause();
            }
        }
    }, [hasInteracted, isGlobalMuted]);

    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col">
            {isGlobalMuted ? (
                <div className="w-full h-full bg-zinc-100/10 dark:bg-zinc-900/10 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-500">
                    <VolumeX className="w-6 h-6 text-zinc-400" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Audio Suspended</span>
                </div>
            ) : (
                <div 
                    ref={containerRef} 
                    className="w-full h-full flex-1 transition-all duration-1000 grayscale-[0.2] hover:grayscale-0 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 [&>iframe]:rounded-none" 
                />
            )}
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
    audioStyle = 'classic',
    playlistMode = false,
    playlist = [],
    jukeboxMode = false,
}: SmartMediaProps) {
    const { ref, fluidScale } = useStudioBlock()
    const { isGlobalMuted, globalVolume } = useAudio()
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

    // Sincronizador Universal de Lyrics — funciona para Audio e Video
    const syncLyrics = (current: number) => {
        if (parsedLyrics.current.length === 0) return

        let activeLine = null
        for (let i = parsedLyrics.current.length - 1; i >= 0; i--) {
            if (current >= parsedLyrics.current[i].time) {
                activeLine = parsedLyrics.current[i]
                break
            }
        }

        if (activeLine && activeLine.text !== currentLyric) {
            setCurrentLyric(activeLine.text)
            setActiveLyrics(activeLine.text)
        }
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime
            const duration = audioRef.current.duration || 1
            setCurrentTime(current)
            setProgress((current / duration) * 100)
            syncLyrics(current)
        }
    }

    // Callback para o VideoPlayer via YouTube IFrame API
    const handleVideoTimeUpdate = (current: number, duration: number) => {
        setCurrentTime(current)
        setProgress((current / duration) * 100)
        syncLyrics(current)
    }

    const handleVideoPlayState = (playing: boolean) => {
        setIsPlaying(playing)
    }

    useEffect(() => {
        return () => {
            setActiveLyrics(null)
        }
    }, [setActiveLyrics])

    useEffect(() => {
        if (!isPlaying) {
            setActiveLyrics(null)
        }
    }, [isPlaying, setActiveLyrics])


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
        if (audioStyle === 'dots') {
            content = (
                <PulseFieldPlayer 
                    audioUrl={audioUrl} isPlaying={isPlaying} togglePlay={togglePlay} progress={progress} scale={scale} 
                    audioMetadata={audioMetadata} audioRef={audioRef} handleTimeUpdate={handleTimeUpdate} setIsPlaying={setIsPlaying}
                />
            )
        } else if (audioStyle === 'aura') {
            content = (
                <AuraPlayer 
                    audioUrl={audioUrl} isPlaying={isPlaying} togglePlay={togglePlay} progress={progress} scale={scale} 
                    audioMetadata={audioMetadata} audioRef={audioRef} handleTimeUpdate={handleTimeUpdate} setIsPlaying={setIsPlaying}
                />
            )
        } else {
            content = (
                <AudioPlayer 
                    audioUrl={audioUrl} isPlaying={isPlaying} togglePlay={togglePlay} progress={progress} setProgress={setProgress} scale={scale} 
                    audioMetadata={audioMetadata} isGlobalMuted={isGlobalMuted} 
                    audioRef={audioRef} handleTimeUpdate={handleTimeUpdate} currentTime={currentTime} setCurrentTime={setCurrentTime} setIsPlaying={setIsPlaying}
                />
            )
        }
    } else if (mediaType === 'video' && (videoId || (playlistMode && playlist && playlist.length > 0))) {
        content = (
            <VideoPlayer 
                videoId={videoId || playlist?.[0]?.videoId} 
                isPublic={isPublic} 
                hasInteracted={hasInteracted} 
                isGlobalMuted={isGlobalMuted}
                onTimeUpdate={handleVideoTimeUpdate}
                onPlayStateChange={handleVideoPlayState}
                playlistMode={playlistMode}
                playlist={playlist}
                jukeboxMode={jukeboxMode}
            />
        )
    } else if (mediaType === 'music' && trackId) {
        content = <MusicPlayer trackId={trackId} isPublic={isPublic} hasInteracted={hasInteracted} isGlobalMuted={isGlobalMuted} />
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

    const jukeboxActive =
        mediaType === "video" &&
        !!jukeboxMode &&
        !!playlistMode &&
        Array.isArray(playlist) &&
        playlist.length > 0

    return (
        <div 
            ref={ref} 
            className={cn(
                "w-full h-full relative transition-all duration-700 flex min-h-0 group",
                jukeboxActive ? "items-stretch justify-stretch" : "items-center justify-center",
                mediaType === 'video' && "overflow-hidden bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[32px] shadow-xl",
                !isPublic && "cursor-pointer",
                (mediaType === 'audio' || mediaType === 'music') && "bg-transparent",
                mediaType === 'audio' && audioStyle === 'classic' && isPlaying && "scale-[1.02]",
                mediaType === 'audio' && (audioStyle === 'aura' || audioStyle === 'dots') && "overflow-visible"
            )}
        >
            {mediaType === 'video' && renderHUDMarkings()}
            {jukeboxActive ? (
                <div className="flex min-h-0 w-full flex-1 flex-col">{content}</div>
            ) : (
                content
            )}
            {!isPublic && <div className="absolute inset-0 bg-transparent z-10" />}
        </div>
    )
}
