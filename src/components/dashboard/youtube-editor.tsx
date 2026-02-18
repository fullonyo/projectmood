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

            <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="relative">
                    <Input
                        placeholder="Cole o link do vídeo..."
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value)
                            if (error) setError(null)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddVideo()}
                        className={cn(
                            "bg-white dark:bg-zinc-900 border-none rounded-xl pr-10 text-xs h-10 shadow-inner",
                            error && "ring-1 ring-red-500"
                        )}
                    />
                    <Video className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>

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
