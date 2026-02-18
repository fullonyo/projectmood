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
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Gifs & Stickers</h3>
            </div>

            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Giphy..."
                    className="pl-10 rounded-2xl bg-white dark:bg-zinc-900 border-none h-11 text-xs focus-visible:ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-inner"
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
