"use client"

import { useState, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Youtube, Plus, Video } from "lucide-react"
import { cn } from "@/lib/utils"

export function YoutubeEditor({ highlight }: { highlight?: boolean }) {
    const [url, setUrl] = useState("")
    const [isPending, startTransition] = useTransition()

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }

    const handleAddVideo = () => {
        const videoId = extractYoutubeId(url)
        if (!videoId) {
            alert("URL do YouTube inválida! Tente colar o link direto do vídeo.")
            return
        }

        startTransition(async () => {
            await addMoodBlock('video', { videoId })
            setUrl("")
        })
    }

    return (
        <div className={cn(
            "space-y-4 transition-all duration-500 rounded-2xl",
            highlight ? "ring-2 ring-red-500/30 bg-red-50/50 dark:bg-red-900/10 p-4 -m-4" : ""
        )}>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Youtube className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">YouTube Video</h2>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        placeholder="Cole o link do vídeo..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddVideo()}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 pr-10"
                    />
                    <Video className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
                <Button
                    size="sm"
                    onClick={handleAddVideo}
                    isLoading={isPending}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-4"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <p className="text-[10px] text-zinc-500 italic">
                Suporta links: youtu.be, youtube.com/watch ou link de embed.
            </p>
        </div>
    )
}
