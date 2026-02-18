"use client"

import { useState, useEffect } from "react"
import { Music2 } from "lucide-react"

interface NowPlayingSpotifyProps {
    userId: string
}

export function NowPlayingSpotify({ userId }: NowPlayingSpotifyProps) {
    const [track, setTrack] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNowPlaying = async () => {
            try {
                const res = await fetch(`/api/spotify/now-playing?userId=${userId}`)
                const data = await res.json()

                if (data.isPlaying && data.track) {
                    setTrack(data.track)
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
        const interval = setInterval(fetchNowPlaying, 30000) // Update every 30s

        return () => clearInterval(interval)
    }, [userId])

    if (loading || !track) return null

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl px-4 py-3 shadow-2xl max-w-xs">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        {track.albumArt ? (
                            <img src={track.albumArt} alt={track.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-green-700 flex items-center justify-center">
                                <Music2 className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] uppercase tracking-wider opacity-80 mb-1">
                            🎵 Tocando agora
                        </p>
                        <p className="text-sm font-bold truncate">{track.name}</p>
                        <p className="text-xs opacity-90 truncate">{track.artist}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
