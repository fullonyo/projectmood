"use client"

import { useState, useEffect, useTransition } from "react"
import { searchGifs, getTrendingGifs } from "@/actions/giphy"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function GifPicker({ highlight }: { highlight?: boolean }) {
    const [query, setQuery] = useState("")
    const [gifs, setGifs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAdding, startTransition] = useTransition()

    useEffect(() => {
        const loadTrending = async () => {
            setIsLoading(true)
            const data = await getTrendingGifs()
            setGifs(data)
            setIsLoading(false)
        }
        loadTrending()
    }, [])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return
        setIsLoading(true)
        const data = await searchGifs(query)
        setGifs(data)
        setIsLoading(false)
    }

    const handleAddGif = (gif: any) => {
        startTransition(async () => {
            await addMoodBlock('gif', {
                url: gif.url,
                title: gif.title
            }, { x: Math.random() * 40 + 30, y: Math.random() * 40 + 30 })
        })
    }

    return (
        <div className={cn(
            "space-y-6 transition-all duration-500 rounded-3xl",
            highlight ? "ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 p-6 -m-6" : ""
        )}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <Search className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Gifs & Stickers</h3>
                    <p className="text-[9px] text-zinc-400 uppercase tracking-tighter">Powered by Giphy</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="O que você está sentindo?..."
                    className="pl-10 rounded-2xl bg-white dark:bg-zinc-900 border-none h-11 text-xs focus-visible:ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-inner"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(""); setGifs([]) }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        <Loader2 className={cn("w-3 h-3 text-zinc-300", isLoading && "animate-spin")} />
                    </button>
                )}
            </form>

            <div className="h-[400px] overflow-y-auto custom-scrollbar pr-1 -mr-1">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Buscando Vibes...</p>
                    </div>
                ) : gifs.length > 0 ? (
                    <div className="columns-2 gap-2 space-y-2">
                        {gifs.map((gif) => (
                            <button
                                key={gif.id}
                                onClick={() => handleAddGif(gif)}
                                disabled={isAdding}
                                className="relative w-full rounded-xl overflow-hidden hover:ring-2 ring-black dark:ring-white transition-all group break-inside-avoid shadow-sm"
                            >
                                <img
                                    src={gif.url}
                                    alt={gif.title}
                                    className="w-full h-auto object-contain bg-zinc-100 dark:bg-zinc-800"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                    <div className="bg-white text-black px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                        Adicionar
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-2">
                        <span className="text-xs italic opacity-40">Nenhum gif encontrado</span>
                    </div>
                )}
            </div>
        </div>
    )
}
