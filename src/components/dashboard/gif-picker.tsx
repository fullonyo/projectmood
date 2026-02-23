"use client"

import { useState, useEffect, useTransition } from "react"
import { searchGifs, getTrendingGifs } from "@/actions/giphy"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

import { MoodBlock } from "@/types/database"

export function GifPicker({ highlight }: { highlight?: boolean }) {
    const { t } = useTranslation()
    const [query, setQuery] = useState("")
    const [gifs, setGifs] = useState<{ id: string, url: string, title: string }[]>([])
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
            "space-y-6 transition-all duration-500",
            highlight ? "border-2 border-black dark:border-white p-6 -m-6 bg-zinc-50 dark:bg-zinc-900/50" : ""
        )}>
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <Search className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.gif.title')}</h3>
                    <p className="text-[7px] text-zinc-400 uppercase tracking-[0.2em] opacity-50">{t('editors.gif.powered_by')}</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="relative group border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-zinc-100 dark:border-zinc-900 pr-3 mr-3">
                    <Search className="w-3.5 h-3.5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                </div>
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('editors.gif.search_placeholder')}
                    className="pl-14 rounded-none bg-transparent border-none h-11 text-[10px] font-mono uppercase tracking-tight focus-visible:ring-0"
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
                    <div className="flex flex-col items-center justify-center h-48 gap-4 border border-dashed border-zinc-200 dark:border-zinc-800">
                        <div className="w-12 h-0.5 bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black dark:bg-white animate-slide-infinite" />
                        </div>
                        <p className="text-[8px] uppercase font-black tracking-[0.3em] text-zinc-400">{t('editors.gif.searching')}</p>
                    </div>
                ) : gifs.length > 0 ? (
                    <div className="columns-2 gap-3 space-y-3">
                        {gifs.map((gif) => (
                            <button
                                key={gif.id}
                                onClick={() => handleAddGif(gif)}
                                disabled={isAdding}
                                className="relative w-full rounded-none overflow-hidden border border-zinc-100 dark:border-zinc-900 hover:border-black dark:hover:border-white transition-all group break-inside-avoid bg-white dark:bg-zinc-950"
                            >
                                <img
                                    src={gif.url}
                                    alt={gif.title}
                                    className="w-full h-auto object-contain bg-zinc-50 dark:bg-zinc-900/50 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black text-white text-[7px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-full group-hover:translate-y-0 transition-all">
                                    {t('editors.gif.deploy')}
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <span className="text-xs italic opacity-40">{t('editors.gif.not_found')}</span>
                )}
            </div>
        </div>
    )
}
