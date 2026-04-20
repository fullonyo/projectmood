"use client"

import { useState, useTransition, useEffect } from "react"
import { searchSpotifyTracks } from "@/actions/spotify"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Search, Music, Youtube, Plus, Video,
    Upload
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { FrameType } from "./FrameContainer"
import { MediaType } from "./SmartMedia"
import { MoodBlock } from "@/types/database"
import { getFrameOptions } from "@/lib/editor-constants"
import { EditorHeader, EditorSection, PillSelector, GridSelector, EditorActionButton } from "./EditorUI"

interface UniversalMediaEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (type: string, content: any) => Promise<void>
    onClose?: () => void
}

const FRAMES = getFrameOptions(['none', 'polaroid', 'glass', 'minimal'])

export function UniversalMediaEditor({
    block,
    onUpdate,
    onAdd,
    onClose
}: UniversalMediaEditorProps) {
    const { t } = useTranslation()
    const [isPending, startTransition] = useTransition()

    const content = block?.content || {}
    const [mediaType, setMediaType] = useState<MediaType>(content.mediaType || (block?.type === 'music' ? 'music' : 'video'))
    const [videoId, setVideoId] = useState(content.videoId || "")
    const [trackId, setTrackId] = useState(content.trackId || "")
    const [audioUrl, setAudioUrl] = useState(content.audioUrl || "")
    const [frame, setFrame] = useState<FrameType>(content.frame || (block?.type === 'music' ? 'minimal' : 'none'))

    const [trackName, setTrackName] = useState(content.name || "")
    const [trackArtist, setTrackArtist] = useState(content.artist || "")
    const [trackAlbumArt, setTrackAlbumArt] = useState(content.albumArt || "")
    const [lyrics, setLyrics] = useState(content.lyrics || "")
    const [lyricsDisplay, setLyricsDisplay] = useState<'integrated' | 'fullscreen'>(content.lyricsDisplay || 'integrated')

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

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) {
            setError(t('editors.universal_media.error_size'))
            return
        }

        if (!['audio/mpeg', 'audio/wav', 'audio/mp3'].includes(file.type)) {
            setError(t('editors.universal_media.error_type'))
            return
        }

        setError(null)
        setIsLoading(true)

        const reader = new FileReader()
        reader.onload = (event) => {
            const base64 = event.target?.result as string
            setAudioUrl(base64)
            setTrackName(file.name.replace(/\.[^/.]+$/, ""))
            setIsLoading(false)
        }
        reader.readAsDataURL(file)
    }

    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const updates = {
            mediaType,
            videoId,
            trackId,
            audioUrl,
            frame,
            lyrics,
            lyricsDisplay,
            ...((mediaType === 'music' || mediaType === 'audio') ? {
                name: trackName,
                artist: trackArtist,
                albumArt: trackAlbumArt
            } : {})
        }

        const typeToSave = ['video', 'music'].includes(block.type) ? 'media' : block.type

        onUpdate(block.id, {
            type: typeToSave,
            content: updates
        })
    }, [mediaType, videoId, trackId, audioUrl, frame, trackName, trackArtist, trackAlbumArt, lyrics, lyricsDisplay, block?.id, onUpdate, block?.type])

    const handleSave = () => {
        const finalContent = {
            mediaType,
            videoId,
            trackId,
            audioUrl,
            frame,
            lyrics,
            lyricsDisplay,
            ...((mediaType === 'music' || mediaType === 'audio') ? {
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
            } else {
                await addMoodBlock('media', finalContent, { x: 40, y: 40 })
                if (onClose) onClose()
            }
        })
    }

    return (
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={t('editors.universal_media.title')} 
                subtitle={t('editors.universal_media.subtitle')}
            />

            <EditorSection title="Tipo de Mídia">
                <PillSelector
                    options={[
                        { id: 'video', label: t('editors.universal_media.video_tab'), icon: Youtube },
                        { id: 'music', label: t('editors.universal_media.music_tab'), icon: Music },
                        { id: 'audio', label: t('editors.universal_media.audio_tab'), icon: Upload },
                    ]}
                    activeId={mediaType as string}
                    onChange={(id) => { setMediaType(id as MediaType); setError(null); }}
                />
            </EditorSection>

            <EditorSection title="Fonte de Dados">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                    {mediaType === 'video' ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input
                                    placeholder={t('editors.universal_media.youtube_placeholder')}
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 h-12 text-[11px] font-medium"
                                />
                            </div>
                            <Button
                                onClick={handleAddYoutube}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold uppercase tracking-widest text-[9px] transition-all"
                            >
                                {t('editors.universal_media.youtube_btn')}
                            </Button>
                        </div>
                    ) : mediaType === 'music' ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input
                                    placeholder={t('editors.universal_media.spotify_placeholder')}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 h-12 text-[11px] font-medium"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                isLoading={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold uppercase tracking-widest text-[9px] transition-all"
                            >
                                {t('editors.universal_media.spotify_btn')}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Label
                                htmlFor="audio-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer bg-zinc-50 dark:bg-zinc-800 group"
                            >
                                <Upload className="w-6 h-6 mb-2 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t('editors.universal_media.audio_placeholder')}</span>
                                <Input
                                    id="audio-upload"
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={handleAudioUpload}
                                />
                            </Label>
                        </div>
                    )}
                    {error && <p className="mt-4 text-[9px] text-red-500 font-bold uppercase tracking-widest text-center">{error}</p>}
                </div>
            </EditorSection>

            {mediaType === 'music' && results.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-lg divide-y divide-zinc-50 dark:divide-zinc-800 max-h-60 overflow-y-auto custom-scrollbar">
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
                            className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
                        >
                            <img src={track.albumArt} alt="" className="w-10 h-10 rounded-lg shadow-sm" />
                            <div className="overflow-hidden flex-1">
                                <p className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase truncate">{track.name}</p>
                                <p className="text-[9px] text-zinc-500 uppercase truncate">{track.artist}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {(videoId || trackId || audioUrl) && (
                <div className="space-y-10">
                    <EditorSection title="Estética">
                        <EditorSection title="Moldura">
                            <PillSelector
                                variant="scroll"
                                options={FRAMES.map(f => ({ id: f.id as string, label: f.label }))}
                                activeId={frame as string}
                                onChange={(id) => setFrame(id as any)}
                            />
                        </EditorSection>
                    </EditorSection>

                    <EditorSection title="Legendas (Letras)">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Modo de Exibição</span>
                                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                                    <button
                                        onClick={() => setLyricsDisplay('integrated')}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all",
                                            lyricsDisplay === 'integrated' ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm" : "text-zinc-400"
                                        )}
                                    >
                                        Integrado
                                    </button>
                                    <button
                                        onClick={() => setLyricsDisplay('fullscreen')}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all",
                                            lyricsDisplay === 'fullscreen' ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm" : "text-zinc-400"
                                        )}
                                    >
                                        Full
                                    </button>
                                </div>
                            </div>
                            <textarea
                                value={lyrics}
                                onChange={(e) => setLyrics(e.target.value)}
                                placeholder="Insira as letras aqui..."
                                className="w-full h-32 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 text-[11px] font-medium resize-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </EditorSection>

                    <EditorActionButton 
                        onClick={handleSave} 
                        isLoading={isPending} 
                        label={block?.id ? t('editors.universal_media.update_btn') : t('editors.universal_media.deploy_btn')}
                    />
                </div>
            )}
        </div>
    )
}
