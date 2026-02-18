"use client"

import { useState, useTransition } from "react"
import { searchSpotifyTracks } from "@/actions/spotify"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Music } from "lucide-react"

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
        <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Adicionar Música</h2>
            <div className="flex gap-2">
                <Input
                    placeholder="Busque uma música..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        if (error) setError(null)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className={error ? "border-red-500 ring-1 ring-red-500" : ""}
                />
                <Button size="sm" onClick={handleSearch} isLoading={isLoading}>
                    <Search className="w-4 h-4" />
                </Button>
            </div>

            {error && (
                <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}

            {results.length > 0 && (
                <div className="mt-4 space-y-2 border rounded-2xl p-2 bg-zinc-50 dark:bg-zinc-800">
                    {results.map((track) => (
                        <button
                            key={track.id}
                            onClick={() => handleSelect(track.id)}
                            disabled={isPending}
                            className="w-full flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-xl transition-colors text-left"
                        >
                            <img src={track.albumArt} alt={track.name} className="w-10 h-10 rounded-lg shrink-0" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold truncate">{track.name}</p>
                                <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
                            </div>
                            <Music className="w-4 h-4 ml-auto shrink-0 text-zinc-300" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
