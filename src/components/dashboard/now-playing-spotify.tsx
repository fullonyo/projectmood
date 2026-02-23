"use client"

import { useState, useEffect, useRef } from "react"
import { Music2, Volume2, VolumeX, Pause, Play } from "lucide-react"

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
            <div className={`bg-black dark:bg-zinc-950 text-white rounded-none pr-4 pl-1 py-1 shadow-none border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 overflow-hidden max-w-[300px] transition-all group ${isMuted && isPlaying ? 'ring-1 ring-white/20' : ''}`}>

                {/* Album Art with Controls */}
                <div className="relative w-10 h-10 rounded-none overflow-hidden flex-shrink-0 cursor-pointer border-r border-zinc-200 dark:border-zinc-800" onClick={togglePlay}>
                    {track.albumArt ? (
                        <div className={`w-full h-full relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
                            <img src={track.albumArt} alt={track.name} className="w-full h-full object-cover opacity-80" />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                            <Music2 className="w-4 h-4" />
                        </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity">
                        {isMuted && isPlaying ? (
                            <VolumeX className="w-4 h-4 text-yellow-400 animate-pulse" />
                        ) : isPlaying ? (
                            <Pause className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer" onClick={togglePlay}>
                    <div className="flex items-center gap-2">
                        <span className="text-[7px] uppercase font-black text-zinc-400 tracking-[0.4em]">
                            {isMuted ? "TAP_TO_UNMUTE" : "AUDIO_STREAM"}
                        </span>
                        {isPlaying && !isMuted && (
                            <div className="flex gap-[2px] items-end h-[8px]">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-[1px] bg-white animate-music-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-baseline gap-1 overflow-hidden">
                        <span className="text-[11px] font-black uppercase tracking-tighter whitespace-nowrap">{track.name}</span>
                        <span className="text-[9px] opacity-40 uppercase italic whitespace-nowrap">// {track.artist}</span>
                    </div>
                </div>

                {track.previewUrl && !isMuted && (
                    <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="p-1.5 hover:bg-white/10 rounded-none transition-colors border border-transparent hover:border-zinc-800">
                        <Volume2 className="w-3 h-3 opacity-70" />
                    </button>
                )}
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
