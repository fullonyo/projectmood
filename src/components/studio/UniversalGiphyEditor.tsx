"use client"

import { useState, useEffect, useTransition } from "react"
import { searchGifs, getTrendingGifs } from "@/actions/giphy"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Activity, Sparkles, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { EditorHeader, EditorSection } from "./EditorUI"
import { MoodBlock } from "@/types/database"

interface GiphyEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (content: any) => Promise<void>
    onClose?: () => void
}

export function UniversalGiphyEditor({ block, onUpdate, onAdd, onClose }: GiphyEditorProps) {
    const { t } = useTranslation()
    const [query, setQuery] = useState("")
    const [gifs, setGifs] = useState<{ id: string, url: string, title: string }[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAdding, startTransition] = useTransition()

    useEffect(() => {
        const loadTrending = async () => {
            setIsLoading(true)
            try {
                const data = await getTrendingGifs()
                setGifs(data)
            } catch (err) {
                console.error("Giphy error:", err)
            } finally {
                setIsLoading(false)
            }
        }
        loadTrending()
    }, [])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return
        setIsLoading(true)
        try {
            const data = await searchGifs(query)
            setGifs(data)
        } catch (err) {
            console.error("Giphy search error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

    const handleAddGif = (gif: any) => {
        if (addedIds.has(gif.id)) return
        
        startTransition(async () => {
            if (onAdd) {
                await onAdd({
                    imageUrl: gif.url,
                    alt: gif.title,
                    isGif: true
                })
                
                // Feedback visual de sucesso
                setAddedIds(prev => new Set(prev).add(gif.id))
                setTimeout(() => {
                    setAddedIds(prev => {
                        const next = new Set(prev)
                        next.delete(gif.id)
                        return next
                    })
                }, 2000)
            }
        })
    }

    return (
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={t('editors.gif.title') || "Giphy Explorer"}
                subtitle={t('editors.gif.subtitle') || "GIFs Animados & Reações"}
                onClose={onClose}
            />

            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <EditorSection title="Buscar no Giphy">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center transition-all group-focus-within:scale-110 group-focus-within:text-blue-500 border border-zinc-100 dark:border-zinc-700">
                            <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-blue-500" />
                        </div>
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('editors.gif.search_placeholder') || "O que você está sentindo?"}
                            className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none rounded-2xl pl-16 h-14 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-blue-500/20 placeholder:text-zinc-400"
                        />
                        {isLoading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                            </div>
                        )}
                    </form>
                </EditorSection>

                <div className="h-[500px] overflow-y-auto custom-scrollbar pr-1 -mr-1">
                    {gifs.length > 0 ? (
                        <div className="columns-2 gap-3 space-y-3">
                            {gifs.map((gif) => {
                                const isAdded = addedIds.has(gif.id)
                                return (
                                    <button
                                        key={gif.id}
                                        onClick={() => handleAddGif(gif)}
                                        disabled={isAdding || isAdded}
                                        className={cn(
                                            "relative w-full rounded-2xl overflow-hidden border transition-all group break-inside-avoid bg-white dark:bg-zinc-950",
                                            isAdded 
                                                ? "border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[0.98]" 
                                                : "border-zinc-100 dark:border-zinc-800 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
                                        )}
                                    >
                                        <img
                                            src={gif.url}
                                            alt={gif.title}
                                            className={cn(
                                                "w-full h-auto object-contain transition-all duration-500",
                                                !isAdded && "group-hover:scale-105"
                                            )}
                                            loading="lazy"
                                        />
                                        
                                        <div className={cn(
                                            "absolute inset-0 transition-opacity duration-300",
                                            isAdded ? "bg-emerald-500/10 opacity-100" : "bg-blue-600/10 opacity-0 group-hover:opacity-100"
                                        )} />
                                        
                                        <div className={cn(
                                            "absolute bottom-2 left-2 right-2 p-3 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
                                            isAdded 
                                                ? "bg-emerald-500 opacity-100 translate-y-0" 
                                                : "bg-black/80 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                                        )}>
                                            {isAdded ? (
                                                <>
                                                    <Sparkles className="w-3 h-3" />
                                                    Adicionado
                                                </>
                                            ) : "Injetar"}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    ) : !isLoading && (
                        <div className="flex flex-col items-center justify-center h-48 opacity-40">
                            <Activity className="w-8 h-8 mb-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Nenhum GIF encontrado</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
