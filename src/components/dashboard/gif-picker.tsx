"use client"

import { useState, useEffect, useTransition } from "react"
import { searchGifs, getTrendingGifs } from "@/actions/giphy"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"

export function GifPicker() {
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
            }, { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 })
        })
    }

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Gifs & Stickers</h2>

            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Giphy..."
                    className="pl-10 rounded-full bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-1 ring-zinc-300 dark:ring-zinc-700"
                />
            </form>

            <div className="grid grid-cols-2 gap-2 h-64 overflow-y-auto custom-scrollbar pr-1">
                {isLoading ? (
                    <div className="col-span-2 flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                    </div>
                ) : gifs.length > 0 ? (
                    gifs.map((gif) => (
                        <button
                            key={gif.id}
                            onClick={() => handleAddGif(gif)}
                            disabled={isAdding}
                            className="relative aspect-square rounded-xl overflow-hidden hover:ring-2 ring-black dark:ring-white transition-all group"
                        >
                            <img src={gif.url} alt={gif.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[10px] font-bold text-white uppercase">Add</span>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center h-32 text-zinc-500 gap-2">
                        <span className="text-xs">Nenhum gif encontrado</span>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-[10px] uppercase font-bold hover:underline"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
