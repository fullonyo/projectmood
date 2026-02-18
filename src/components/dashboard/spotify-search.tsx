"use client"

import { useState, useTransition } from "react"
import { searchSpotifyTracks } from "@/actions/spotify"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Music, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function SpotifySearch() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleSearch = async () => {
        if (!query) return
        setError(null)
        setIsLoading(true)
        const tracks = await searchSpotifyTracks(query)
        if ('error' in tracks) {
            setError(tracks.error as string)
        } else {
            setResults(tracks)
        }
        setIsLoading(false)
    }

    const handleSelect = (trackId: string) => {
        startTransition(async () => {
            await addMoodBlock('music', { trackId })
            setResults([])
            setQuery("")
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <Music className="w-4 h-4 text-[#1DB954]" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Spotify Music</h3>
            </div>
            <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="relative">
                    <Input
                        placeholder="Busque uma música ou artista..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            if (error) setError(null)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className={cn(
                            "bg-white dark:bg-zinc-900 border-none rounded-xl pr-10 text-xs h-10 shadow-inner",
                            error && "ring-1 ring-red-500"
                        )}
                    />
                    <Music className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>

                <Button
                    onClick={handleSearch}
                    isLoading={isLoading}
                    className="w-full bg-black dark:bg-white text-white dark:text-black rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-lg"
                >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Música
                </Button>
            </div>

            {error && (
                <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}

            {results.length > 0 && (
                <div className="mt-4 space-y-2 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-3 bg-white dark:bg-zinc-900 shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
                    {results.map((track) => (
                        <button
                            key={track.id}
                            onClick={() => handleSelect(track.id)}
                            disabled={isPending}
                            className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-all text-left group"
                        >
                            <img src={track.albumArt} alt={track.name} className="w-10 h-10 rounded-xl shrink-0 shadow-sm transition-transform group-hover:scale-105" />
                            <div className="overflow-hidden">
                                <p className="text-[11px] font-black uppercase truncate leading-tight">{track.name}</p>
                                <p className="text-[9px] text-zinc-500 uppercase tracking-tighter truncate">{track.artist}</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-4 h-4 text-zinc-400" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
