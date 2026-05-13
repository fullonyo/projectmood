"use client"

import { motion } from "framer-motion"
import { useState, useTransition, useEffect } from "react"
import { searchSpotifyTracks } from "@/actions/spotify"
import { addMoodBlock } from "@/actions/profile"
import { getUploadUrl } from "@/actions/upload"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Search, Music, Youtube, Plus, Video,
    Upload, Maximize2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { FrameType } from "./FrameContainer"
import { MediaType } from "./SmartMedia"
import { getFrameOptions } from "@/lib/editor-constants"
import { EditorHeader, EditorSection, PillSelector, GridSelector, EditorActionButton, ListSelector } from "./EditorUI"

import { MoodBlock, UniversalMediaContent } from "@/types/database"

interface UniversalMediaEditorProps {
    block?: MoodBlock | null
    onUpdate?: (updates: Partial<MoodBlock>) => void
    onAdd?: (content: UniversalMediaContent) => Promise<void>
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

    const content = block?.content as UniversalMediaContent || {}
    const [mediaType, setMediaType] = useState<MediaType>(content.mediaType || (block?.type === 'music' ? 'music' : 'video'))
    const [videoId, setVideoId] = useState(content.videoId || "")
    const [trackId, setTrackId] = useState(content.trackId || "")
    const [audioUrl, setAudioUrl] = useState(content.audioUrl || "")
    const [frame, setFrame] = useState<FrameType>(content.frame as FrameType || (block?.type === 'music' ? 'minimal' : 'none'))

    const [trackName, setTrackName] = useState(content.name || "")
    const [trackArtist, setTrackArtist] = useState(content.artist || "")
    const [trackAlbumArt, setTrackAlbumArt] = useState(content.albumArt || "")
    const [lyrics, setLyrics] = useState(content.lyrics || "")
    const [lyricsDisplay, setLyricsDisplay] = useState<'integrated' | 'fullscreen'>(content.lyricsDisplay || 'integrated')
    const [audioStyle, setAudioStyle] = useState<'classic' | 'aura' | 'dots'>(content.audioStyle || 'classic')

    interface SpotifyTrack {
        id: string;
        name: string;
        artist: string;
        albumArt: string;
    }

    const [urlInput, setUrlInput] = useState("")
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SpotifyTrack[]>([])
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
        if (tracks && 'error' in tracks) {
            setError(tracks.error as string)
        } else {
            setResults(tracks as SpotifyTrack[])
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
            triggerUpdate({ videoId: id, mediaType: 'video' })
        } else {
            setError(t('editors.youtube.error'))
        }
    }

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        try {
            const res = await getUploadUrl(file.type, "audio")
            if (res.error || !res.uploadUrl || !res.publicUrl) {
                throw new Error(res.error || "Erro ao obter URL de upload")
            }

            const uploadResponse = await fetch(res.uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            })

            if (!uploadResponse.ok) {
                throw new Error("Falha no upload de áudio para o R2")
            }

            const name = file.name.replace(/\.[^/.]+$/, "")
            setAudioUrl(res.publicUrl)
            setTrackName(name)
            setIsLoading(false)
            triggerUpdate({ audioUrl: res.publicUrl, name })
        } catch (error) {
            console.error(error)
            setError("Erro ao fazer upload do áudio")
            setIsLoading(false)
        }
    }

    const triggerUpdate = (updates: Partial<UniversalMediaContent>) => {
        if (!block?.id || !onUpdate) return

        const currentContent: UniversalMediaContent = {
            mediaType,
            videoId,
            trackId,
            audioUrl,
            frame,
            lyrics,
            lyricsDisplay,
            name: trackName,
            artist: trackArtist,
            albumArt: trackAlbumArt,
            audioStyle,
            ...updates
        }

        const typeToSave = ['video', 'music'].includes(block.type) ? 'media' : block.type

        onUpdate({
            type: typeToSave,
            content: currentContent
        })
    }

    const handleSave = () => {
        const finalContent: UniversalMediaContent = {
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
                albumArt: trackAlbumArt,
                audioStyle
            } : {})
        }

        startTransition(async () => {
            if (block?.id) {
                if (onClose) onClose()
            } else if (onAdd) {
                await onAdd(finalContent)
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
                <ListSelector
                    id="media-type"
                    options={[
                        { id: 'video', label: t('editors.universal_media.video_tab') },
                        { id: 'music', label: t('editors.universal_media.music_tab') },
                        { id: 'audio', label: t('editors.universal_media.audio_tab') },
                    ]}
                    activeId={mediaType}
                    onChange={(id) => { 
                        setMediaType(id as MediaType); 
                        setError(null);
                        triggerUpdate({ mediaType: id as MediaType });
                    }}
                />
            </EditorSection>

            <EditorSection title="Fonte de Dados">
                {mediaType === 'video' ? (
                    <div className="space-y-4">
                        <div className="relative group">
                            <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder={t('editors.universal_media.youtube_placeholder')}
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-2xl pl-12 h-14 text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-blue-500/20 placeholder:text-zinc-400"
                            />
                        </div>
                        <Button
                            onClick={handleAddYoutube}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            {t('editors.universal_media.youtube_btn')}
                        </Button>

                        {videoId && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-zinc-900 rounded-2xl border border-white/5 flex items-center gap-4 overflow-hidden relative group"
                            >
                                <div className="w-20 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-white/10">
                                    <img 
                                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                                        className="w-full h-full object-cover opacity-80"
                                        alt="Thumbnail"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">Vídeo Selecionado</p>
                                    <p className="text-[10px] font-bold text-white uppercase truncate">ID: {videoId}</p>
                                </div>
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            </motion.div>
                        )}
                    </div>
                ) : mediaType === 'music' ? (
                    <div className="space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder={t('editors.universal_media.spotify_placeholder')}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-2xl pl-12 h-14 text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-blue-500/20 placeholder:text-zinc-400"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            isLoading={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            {t('editors.universal_media.spotify_btn')}
                        </Button>

                        {trackId && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-4 overflow-hidden relative"
                            >
                                {trackAlbumArt && (
                                    <img src={trackAlbumArt} className="w-12 h-12 rounded-xl shadow-sm border border-emerald-500/20" alt="Album" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Música Selecionada</p>
                                    <p className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase truncate">{trackName}</p>
                                    <p className="text-[9px] text-zinc-500 uppercase truncate">{trackArtist}</p>
                                </div>
                                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Label
                            htmlFor="audio-upload"
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer group relative overflow-hidden",
                                audioUrl 
                                    ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5" 
                                    : "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-blue-500 hover:bg-blue-50/50"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border",
                                audioUrl 
                                    ? "bg-emerald-500 text-white border-emerald-400" 
                                    : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700"
                            )}>
                                {audioUrl ? <Plus className="w-5 h-5 rotate-45" /> : <Upload className="w-5 h-5 text-zinc-400 group-hover:text-blue-600 transition-colors" />}
                            </div>

                            <div className="text-center px-6">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em] block mb-1",
                                    audioUrl ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"
                                )}>
                                    {audioUrl ? 'Áudio Carregado' : t('editors.universal_media.audio_placeholder')}
                                </span>
                                {audioUrl && (
                                    <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase truncate max-w-[200px] block mx-auto">
                                        {trackName || 'Arquivo de áudio'}
                                    </span>
                                )}
                            </div>

                            <Input
                                id="audio-upload"
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                onChange={handleAudioUpload}
                            />

                            {audioUrl && (
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                        </Label>
                    </div>
                )}
                {error && <p className="mt-4 text-[9px] text-red-500 font-bold uppercase tracking-widest text-center animate-bounce">{error}</p>}
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
                                triggerUpdate({ 
                                    trackId: track.id, 
                                    name: track.name, 
                                    artist: track.artist, 
                                    albumArt: track.albumArt 
                                })
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
                            <ListSelector
                                id="frame-type"
                                options={FRAMES.map(f => ({ id: f.id as string, label: f.label }))}
                                activeId={frame as string}
                                onChange={(id) => {
                                    const newFrame = id as FrameType
                                    setFrame(newFrame)
                                    triggerUpdate({ frame: newFrame })
                                }}
                            />
                        </EditorSection>

                        {mediaType === 'audio' && (
                            <EditorSection title="Estilo do Player">
                                <ListSelector
                                    id="audio-style"
                                    options={[
                                        { id: 'classic', label: 'Classic' },
                                        { id: 'aura', label: 'Neural Aura' },
                                        { id: 'dots', label: 'Neural Dots' }
                                    ]}
                                    activeId={audioStyle}
                                    onChange={(id) => {
                                        const newStyle = id as 'classic' | 'aura' | 'dots'
                                        setAudioStyle(newStyle)
                                        triggerUpdate({ audioStyle: newStyle })
                                    }}
                                />
                            </EditorSection>
                        )}
                    </EditorSection>

                    <EditorSection title="Letras (Lyrics)">
                        <div className="space-y-6">
                            <EditorSection title="Exibição">
                                <ListSelector
                                    id="lyrics-mode"
                                    options={[
                                        { id: 'integrated', label: 'Integrado' },
                                        { id: 'fullscreen', label: 'Tela Cheia' }
                                    ]}
                                    activeId={lyricsDisplay}
                                    onChange={(id) => {
                                        const newMode = id as 'integrated' | 'fullscreen'
                                        setLyricsDisplay(newMode)
                                        triggerUpdate({ lyricsDisplay: newMode })
                                    }}
                                />
                            </EditorSection>

                            <textarea
                                value={lyrics}
                                onChange={(e) => {
                                    setLyrics(e.target.value)
                                    triggerUpdate({ lyrics: e.target.value })
                                }}
                                placeholder="Insira as letras aqui..."
                                className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 text-[12px] font-medium resize-none focus:ring-2 focus:ring-blue-500/10 transition-all custom-scrollbar"
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
