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

    const handleSelect = (track: any) => {
        startTransition(async () => {
            // Save full metadata for the aesthetic card
            await addMoodBlock('music', {
                trackId: track.id,
                name: track.name,
                artist: track.artist,
                albumArt: track.albumArt,
                previewUrl: track.previewUrl,
                spotifyUrl: track.spotifyUrl
            })
            setResults([])
            setQuery("")
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <Music className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Audio_Node_Source</h3>
            </div>
            <div className="space-y-4 p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-zinc-100 dark:border-zinc-900 pr-3 mr-3">
                        <Search className="w-3.5 h-3.5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                    </div>
                    <Input
                        placeholder="SEARCH_PROTOCOL // Query audio database..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            if (error) setError(null)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className={cn(
                            "bg-transparent border-none rounded-none pl-14 pr-5 text-[10px] font-mono h-12 uppercase tracking-tight focus-visible:ring-0",
                            error && "border-b border-red-500"
                        )}
                    />
                </div>

                <Button
                    onClick={handleSearch}
                    isLoading={isLoading}
                    className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-14 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all border border-black dark:border-white shadow-none"
                >
                    Manifest_Search
                </Button>
            </div>

            {error && (
                <p className="text-[8px] text-red-500 font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1 px-1">
                    SEARCH_ERROR // {error}
                </p>
            )}

            {results.length > 0 && (
                <div className="mt-4 space-y-0 border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950 max-h-72 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500 divide-y divide-zinc-100 dark:divide-zinc-900">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-900">
                        <p className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-400">Audio_Registry_Results</p>
                    </div>
                    {results.map((track) => (
                        <button
                            key={track.id}
                            onClick={() => handleSelect(track)}
                            disabled={isPending}
                            className="w-full flex items-center gap-4 p-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-left group relative"
                        >
                            <img src={track.albumArt} alt={track.name} className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 grayscale group-hover:grayscale-0 transition-all duration-500" />
                            <div className="overflow-hidden flex-1">
                                <p className="text-[9px] font-black uppercase truncate leading-none mb-1 text-black dark:text-white group-hover:text-current">{track.name}</p>
                                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-widest truncate group-hover:text-current opacity-60">Source // {track.artist}</p>
                            </div>
                            <div className="flex items-center justify-center w-6 h-6 border border-current opacity-0 group-hover:opacity-100 transition-all">
                                <Plus className="w-3 h-3" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
