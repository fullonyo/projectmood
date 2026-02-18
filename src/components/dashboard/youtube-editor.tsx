"use client"

import { useState, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Youtube, Plus, Video } from "lucide-react"
import { cn } from "@/lib/utils"

export function YoutubeEditor({ highlight }: { highlight?: boolean }) {
    const [url, setUrl] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }

    const handleAddVideo = () => {
        setError(null)
        const videoId = extractYoutubeId(url)
        if (!videoId) {
            setError("Link do YouTube inválido!")
            return
        }

        startTransition(async () => {
            await addMoodBlock('video', { videoId })
            setUrl("")
        })
    }

    return (
        <div className={cn(
            "space-y-6 transition-all duration-500 rounded-3xl",
            highlight ? "ring-2 ring-red-500/30 bg-red-50/50 dark:bg-red-900/10 p-6 -m-6" : ""
        )}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <Youtube className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">YouTube Video</h3>
            </div>

            <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="relative group">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                    <Input
                        placeholder="Cole o link do vídeo..."
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value)
                            if (error) setError(null)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddVideo()}
                        className={cn(
                            "bg-white dark:bg-zinc-900 border-none rounded-xl pl-10 pr-10 text-xs h-11 shadow-inner",
                            error && "ring-1 ring-red-500"
                        )}
                    />
                </div>

                {url && extractYoutubeId(url) && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg animate-in fade-in zoom-in-95 duration-300">
                        <img
                            src={`https://img.youtube.com/vi/${extractYoutubeId(url)}/maxresdefault.jpg`}
                            alt="YouTube Preview"
                            className="w-full h-full object-cover opacity-80"
                            onError={(e) => {
                                // Fallback se o maxres não existir
                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${extractYoutubeId(url)}/0.jpg`
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                                <Youtube className="w-6 h-6 text-white fill-current" />
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    onClick={handleAddVideo}
                    isLoading={isPending}
                    className="w-full bg-black dark:bg-white text-white dark:text-black rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Vídeo
                </Button>
            </div>

            {error && (
                <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
            <p className="text-[10px] text-zinc-500 italic">
                Suporta links: youtu.be, youtube.com/watch ou link de embed.
            </p>
        </div>
    )
}
