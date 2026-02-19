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
            "space-y-6 transition-all duration-500",
            highlight ? "border-2 border-black dark:border-white p-6 -m-6 bg-zinc-50 dark:bg-zinc-900/50" : ""
        )}>
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <Youtube className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Video_Stream_Protocol</h3>
            </div>

            <div className="space-y-4 p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-zinc-100 dark:border-zinc-900 pr-3 mr-3">
                        <Video className="w-3.5 h-3.5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                    </div>
                    <Input
                        placeholder="LINK_PROTOCOL // Input video source..."
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value)
                            if (error) setError(null)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddVideo()}
                        className={cn(
                            "bg-transparent border-none rounded-none pl-14 pr-5 text-[10px] font-mono h-12 uppercase tracking-tight focus-visible:ring-0",
                            error && "border-b border-red-500"
                        )}
                    />
                </div>

                {url && extractYoutubeId(url) && (
                    <div className="relative aspect-video border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-black animate-in fade-in zoom-in-95 duration-300 group/preview">
                        <img
                            src={`https://img.youtube.com/vi/${extractYoutubeId(url)}/maxresdefault.jpg`}
                            alt="YouTube Preview"
                            className="w-full h-full object-cover grayscale opacity-40 group-hover/preview:grayscale-0 group-hover/preview:opacity-60 transition-all duration-700"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${extractYoutubeId(url)}/0.jpg`
                            }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                            <div className="px-3 py-1 border border-white/20 bg-black/40 backdrop-blur-sm mb-2">
                                <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white">Visual_Link_Established</span>
                            </div>
                            <Youtube className="w-8 h-8 text-white/40 group-hover/preview:text-white transition-colors" />
                        </div>
                        {/* Technical scanline overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
                    </div>
                )}

                <Button
                    onClick={handleAddVideo}
                    isLoading={isPending}
                    className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-14 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all border border-black dark:border-white shadow-none"
                >
                    Link_Visual_Node
                </Button>
            </div>

            <div className="px-1 flex flex-col gap-2">
                {error && (
                    <p className="text-[8px] text-red-500 font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                        ERROR_PROTOCOL // {error}
                    </p>
                )}
                <div className="flex items-center gap-2 opacity-30">
                    <div className="w-1 h-1 bg-zinc-500 animate-pulse" />
                    <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                        Endpoint supported: youtu.be, youtube.com/watch, embed_src
                    </p>
                </div>
            </div>
        </div>
    )
}
