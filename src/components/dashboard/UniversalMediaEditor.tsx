"use client"

import { useState, useTransition, useEffect } from "react"
import { searchSpotifyTracks } from "@/actions/spotify"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Search, Music, Youtube, Plus, Video,
    Monitor, Layout, Layers, Box, Maximize, PlayCircle, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { FrameType, FrameContainer } from "./FrameContainer"
import { SmartMedia, MediaType } from "./SmartMedia"

import { MoodBlock, MoodBlockContent } from "@/types/database"

interface UniversalMediaEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (type: string, content: any) => Promise<void>
    onClose?: () => void
}

const FRAMES: { id: FrameType; label: string; icon: any }[] = [
    { id: 'none', label: 'Nenhum', icon: Maximize },
    { id: 'polaroid', label: 'Polaroid', icon: Layout },
    { id: 'glass', label: 'Glass', icon: Layers },
    { id: 'minimal', label: 'Minimal', icon: Box },
]

export function UniversalMediaEditor({
    block,
    onUpdate,
    onAdd,
    onClose
}: UniversalMediaEditorProps) {
    const { t } = useTranslation()
    const [isPending, startTransition] = useTransition()

    // State for existing or new block
    const content = block?.content || {}
    const [mediaType, setMediaType] = useState<MediaType>(content.mediaType || (block?.type === 'music' ? 'music' : 'video'))
    const [videoId, setVideoId] = useState(content.videoId || "")
    const [trackId, setTrackId] = useState(content.trackId || "")
    const [frame, setFrame] = useState<FrameType>(content.frame || (block?.type === 'music' ? 'minimal' : 'none'))
    const [textColor, setTextColor] = useState(content.textColor || "#000000")

    // Hardening: Metadata states
    const [trackName, setTrackName] = useState(content.name || "")
    const [trackArtist, setTrackArtist] = useState(content.artist || "")
    const [trackAlbumArt, setTrackAlbumArt] = useState(content.albumArt || "")

    // Input states
    const [urlInput, setUrlInput] = useState("")
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }

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

    const handleAddYoutube = () => {
        const id = extractYoutubeId(urlInput)
        if (id) {
            setVideoId(id)
            setMediaType('video')
            setUrlInput("")
            setError(null)
        } else {
            setError(t('editors.youtube.error'))
        }
    }

    // Auto-update preview
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const updates = {
            mediaType,
            videoId,
            trackId,
            frame,
            textColor,
            // Preserve other metadata for music if exists
            ...(mediaType === 'music' ? {
                name: trackName,
                artist: trackArtist,
                albumArt: trackAlbumArt
            } : {})
        }

        // Ghost Migration: Silently migrate legacy types to 'media'
        const typeToSave = ['video', 'music'].includes(block.type) ? 'media' : block.type

        onUpdate(block.id, {
            type: typeToSave,
            content: updates
        })
    }, [mediaType, videoId, trackId, frame, textColor, trackName, trackArtist, trackAlbumArt])

    const handleSave = () => {
        const finalContent = {
            mediaType,
            videoId,
            trackId,
            frame,
            textColor,
            // Preserve/Add metadata
            ...(mediaType === 'music' ? {
                name: trackName,
                artist: trackArtist,
                albumArt: trackAlbumArt
            } : {})
        }

        startTransition(async () => {
            if (block?.id) {
                if (onClose) onClose()
            } else if (onAdd) {
                await onAdd('media', finalContent)
                if (onClose) onClose()
            }
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* Header */}
            <header className="flex items-center gap-2 opacity-30 px-1 mb-2">
                <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
                <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('editors.universal_media.title')}</h3>
            </header>

            {/* Type Selector */}
            <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setMediaType('video')}
                    className={cn(
                        "flex items-center justify-center gap-3 py-4 transition-all uppercase tracking-widest text-[9px] font-black relative group",
                        mediaType === 'video'
                            ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    )}
                >
                    {mediaType === 'video' && (
                        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                    )}
                    <Youtube className="w-3.5 h-3.5" />
                    {t('editors.universal_media.video_tab')}
                </button>
                <button
                    onClick={() => setMediaType('music')}
                    className={cn(
                        "flex items-center justify-center gap-3 py-4 transition-all uppercase tracking-widest text-[9px] font-black relative group",
                        mediaType === 'music'
                            ? "bg-white dark:bg-zinc-950 text-black dark:text-white"
                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    )}
                >
                    {mediaType === 'music' && (
                        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                    )}
                    <Music className="w-3.5 h-3.5" />
                    {t('editors.universal_media.music_tab')}
                </button>
            </div>

            {/* Input Section */}
            <div className="space-y-4 p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    {mediaType === 'video' ? <Youtube size={64} /> : <Music size={64} />}
                </div>

                {mediaType === 'video' ? (
                    <div className="space-y-4 relative z-10">
                        <div className="relative">
                            <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                            <Input
                                placeholder={t('editors.universal_media.youtube_placeholder')}
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-900 border-none rounded-none pl-12 h-12 text-[10px] font-mono"
                            />
                        </div>
                        <Button
                            onClick={handleAddYoutube}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white rounded-none h-12 font-black uppercase tracking-[0.3em] text-[9px] border border-zinc-100 dark:border-zinc-800 transition-all relative group"
                        >
                            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black dark:border-white" />
                            {t('editors.universal_media.youtube_btn')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 relative z-10">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                            <Input
                                placeholder={t('editors.universal_media.spotify_placeholder')}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="bg-zinc-50 dark:bg-zinc-900 border-none rounded-none pl-12 h-12 text-[10px] font-mono"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            isLoading={isLoading}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white rounded-none h-12 font-black uppercase tracking-[0.3em] text-[9px] border border-zinc-100 dark:border-zinc-800 transition-all relative group"
                        >
                            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black dark:border-white" />
                            {t('editors.universal_media.spotify_btn')}
                        </Button>
                    </div>
                )}

                {error && <p className="text-[8px] text-red-500 font-black uppercase tracking-widest">{error}</p>}
            </div>

            {/* Spotify Results */}
            {mediaType === 'music' && results.length > 0 && (
                <div className="space-y-0 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900 custom-scrollbar animate-in fade-in slide-in-from-top-2">
                    {results.map((track) => (
                        <button
                            key={track.id}
                            onClick={() => {
                                setTrackId(track.id)
                                setTrackName(track.name)
                                setTrackArtist(track.artist)
                                setTrackAlbumArt(track.albumArt)
                                setResults([])
                                setQuery("")
                            }}
                            className="w-full flex items-center gap-4 p-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-left"
                        >
                            <img src={track.albumArt} alt="" className="w-8 h-8 grayscale" />
                            <div className="overflow-hidden flex-1">
                                <p className="text-[9px] font-black uppercase truncate">{track.name}</p>
                                <p className="text-[7px] opacity-60 uppercase truncate">{track.artist}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Visual Customization (Shared) */}
            {(videoId || trackId) && (
                <div className="space-y-6 animate-in fade-in duration-700">
                    {/* Frame Selector */}
                    <div className="space-y-4">
                        <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                            <Layers className="w-3 h-3" />
                            {t('editors.universal_media.aesthetic_label')}
                        </Label>
                        <div className="grid grid-cols-4 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800">
                            {FRAMES.map((f) => {
                                const Icon = f.icon
                                return (
                                    <button
                                        key={f.id}
                                        onClick={() => setFrame(f.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center py-4 gap-2 transition-all relative group",
                                            frame === f.id
                                                ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xl"
                                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                        )}
                                    >
                                        {frame === f.id && (
                                            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
                                        )}
                                        <Icon className={cn("w-3.5 h-3.5 transition-transform", frame === f.id && "scale-110")} />
                                        <span className="text-[6px] font-black uppercase tracking-tighter">{f.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Final Action */}
                    <Button
                        onClick={handleSave}
                        className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-16 font-black uppercase tracking-[0.4em] text-[10px] transition-all border border-black dark:border-white relative group"
                    >
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-30 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-30 group-hover:opacity-100 transition-opacity" />
                        {block?.id ? t('editors.universal_media.update_btn') : t('editors.universal_media.deploy_btn')}
                    </Button>
                </div>
            )}
        </div>
    )
}
