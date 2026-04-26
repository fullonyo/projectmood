"use client"

import { useState, useEffect, useRef } from "react"
import { Music2, Volume2, VolumeX, Pause, Play, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpotifyTrack {
    name: string;
    artist: string;
    albumArt?: string;
    previewUrl?: string;
}

interface NowPlayingSpotifyProps {
    userId: string
}

export function NowPlayingSpotify({ userId }: NowPlayingSpotifyProps) {
    const [track, setTrack] = useState<SpotifyTrack | null>(null)
    const [loading, setLoading] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        const fetchNowPlaying = async () => {
            try {
                const res = await fetch(`/api/spotify/now-playing?userId=${userId}`)
                const data = await res.json()

                if (data.track) {
                    setTrack((prev: SpotifyTrack | null) => {
                        if (prev?.name !== data.track.name) {
                            return data.track
                        }
                        return prev
                    })
                } else {
                    setTrack(null)
                }
            } catch (error) {
                console.error('Spotify fetch error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchNowPlaying()
    }, [userId])

    useEffect(() => {
        if (track?.previewUrl && audioRef.current) {
            audioRef.current.volume = 0.5

            const attemptPlay = async () => {
                try {
                    await audioRef.current?.play()
                    setIsPlaying(true)
                    setIsMuted(false)
                } catch (error) {
                    setIsPlaying(false)
                }
            }

            attemptPlay()
        }
    }, [track])

    const togglePlay = () => {
        if (!audioRef.current) return
        if (isPlaying && !isMuted) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            audioRef.current.muted = false
            setIsMuted(false)
            audioRef.current.play()
            setIsPlaying(true)
        }
    }

    const toggleMute = () => {
        if (!audioRef.current) return
        audioRef.current.muted = !isMuted
        setIsMuted(!isMuted)
    }

    if (loading || !track) return null

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-700">
            {track.previewUrl && (
                <audio
                    ref={audioRef}
                    src={track.previewUrl}
                    loop
                    onEnded={() => setIsPlaying(false)}
                />
            )}

            {/* Main Widget */}
            <div className={cn(
                "bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col min-w-[240px] animate-in slide-in-from-top-4 duration-700 relative group overflow-hidden",
                isMuted && isPlaying ? "border-yellow-500/50" : ""
            )}>
                {/* HUD markings */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white opacity-20 group-hover:opacity-100 transition-opacity" />

                <header className="flex items-center gap-2 opacity-30 px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
                    <h3 className="text-[7px] font-black uppercase tracking-[0.3em] text-black dark:text-white">System.Audio.Stream</h3>
                </header>

                <div className="flex items-center gap-3 p-1 pr-3">
                    {/* Album Art with Controls */}
                    <div className="relative w-12 h-12 rounded-none overflow-hidden flex-shrink-0 cursor-pointer border-r border-zinc-100 dark:border-zinc-900" onClick={togglePlay}>
                        {track.albumArt ? (
                            <div className={`w-full h-full relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
                                <img src={track.albumArt} alt={track.name} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
                            </div>
                        ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                <Music2 className="w-4 h-4" />
                            </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isMuted && isPlaying ? (
                                <VolumeX className="w-4 h-4 text-yellow-500 animate-pulse" />
                            ) : isPlaying ? (
                                <Pause className="w-4 h-4 text-white" />
                            ) : (
                                <Play className="w-4 h-4 text-white" />
                            )}
                        </div>

                        {!isPlaying && !loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Play className="w-4 h-4 text-white/50" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer" onClick={togglePlay}>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[6px] uppercase font-black text-zinc-400 tracking-[0.3em]">
                                {isMuted ? "SIGNAL_MUTED" : "BROADCASTING"}
                            </span>
                            {isPlaying && !isMuted && (
                                <div className="flex gap-[2px] items-end h-[6px]">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-[1px] bg-black dark:bg-white animate-music-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col leading-none overflow-hidden">
                            <span className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap text-black dark:text-white">{track.name}</span>
                            <span className="text-[7px] text-zinc-400 uppercase font-mono tracking-tighter truncate mt-1">
                                BY_{track.artist.replace(/\s+/g, '_')}
                            </span>
                        </div>
                    </div>

                    {track.previewUrl && !isMuted && (
                        <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                            <Volume2 className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                @keyframes music-bar {
                    0%, 100% { height: 2px; }
                    50% { height: 8px; }
                }
                .animate-music-bar {
                    animation: music-bar 0.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}
