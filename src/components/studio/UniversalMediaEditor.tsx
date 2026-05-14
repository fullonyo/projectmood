"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useTransition, useEffect } from "react"
import { searchSpotifyTracks } from "@/actions/spotify"
import { searchYouTubeVideos, getYouTubeVideoInfo, importYouTubePlaylist } from "@/actions/youtube"
import { addMoodBlock } from "@/actions/profile"
import { getUploadUrl } from "@/actions/upload"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Search, Music, Youtube, Plus, Video,
    Upload, Maximize2, Flag, Languages, ListMusic, Trash2, ListPlus, Loader2, PanelBottom
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { SpotifyIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { FrameType } from "./FrameContainer"
import { MediaType } from "./SmartMedia"
import { getFrameOptions } from "@/lib/editor-constants"
import { EditorHeader, EditorSection, PillSelector, GridSelector, EditorActionButton, ListSelector } from "./EditorUI"

import { MoodBlock, UniversalMediaContent, YouTubePlaylistItem } from "@/types/database"

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
    const [videoTitle, setVideoTitle] = useState(content.videoTitle || "")
    const [videoChannel, setVideoChannel] = useState(content.videoChannel || "")
    const [videoThumbnail, setVideoThumbnail] = useState(content.videoThumbnail || "")
    const [trackId, setTrackId] = useState(content.trackId || "")
    const [audioUrl, setAudioUrl] = useState(content.audioUrl || "")
    const [frame, setFrame] = useState<FrameType>('none')

    const [trackName, setTrackName] = useState(content.name || "")
    const [trackArtist, setTrackArtist] = useState(content.artist || "")
    const [trackAlbumArt, setTrackAlbumArt] = useState(content.albumArt || "")
    const [lyrics, setLyrics] = useState(content.lyrics || "")
    const [lyricsDisplay, setLyricsDisplay] = useState<'integrated' | 'fullscreen'>('fullscreen')
    const [audioStyle, setAudioStyle] = useState<'classic' | 'aura' | 'dots'>(content.audioStyle || 'classic')
    const [showLyrics, setShowLyrics] = useState(!!content.lyrics && content.lyrics.trim().length > 0)
    
    // Playlist States
    const [playlistMode, setPlaylistMode] = useState(content.playlistMode || false)
    const [jukeboxMode, setJukeboxMode] = useState(content.jukeboxMode || false)
    const [playlist, setPlaylist] = useState<YouTubePlaylistItem[]>(content.playlist || [])
    const [playlistUrl, setPlaylistUrl] = useState("")

    interface SpotifyTrack {
        id: string;
        name: string;
        artist: string;
        albumArt: string;
    }

    interface YouTubeResult {
        videoId: string;
        title: string;
        channel: string;
        thumbnail: string;
        duration?: string;
    }

    const [urlInput, setUrlInput] = useState("")
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SpotifyTrack[]>([])
    const [ytResults, setYtResults] = useState<YouTubeResult[]>([])
    const [ytQuery, setYtQuery] = useState("")
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



    const handleUniversalYouTubeAction = async () => {
        const query = ytQuery.trim()
        if (!query || query.length < 2) return
        
        setError(null)
        setIsLoading(true)

        // Detecta se é um link (Vídeo ou Playlist)
        const isUrl = query.includes("youtube.com/") || query.includes("youtu.be/")

        if (isUrl) {
            // Tenta importar como playlist ou vídeo único via nossa action robusta
            const results = await importYouTubePlaylist(query)
            if (results && 'error' in results) {
                setError(results.error)
            } else {
                // Se for um link, mostramos como resultados para o usuário decidir o que fazer
                // (Adicionar à fila ou tornar principal)
                setYtResults(results as YouTubeResult[])
                // Limpa o input após colar um link para facilitar o próximo
                setYtQuery("")
            }
        } else {
            // Busca normal por palavra-chave
            const results = await searchYouTubeVideos(query)
            if (results && 'error' in results) {
                setError(results.error)
            } else {
                setYtResults(results as YouTubeResult[])
            }
        }
        setIsLoading(false)
    }

    const handleSelectYouTubeResult = (result: YouTubeResult) => {
        setVideoId(result.videoId)
        setVideoTitle(result.title)
        setVideoChannel(result.channel)
        setVideoThumbnail(result.thumbnail)
        setYtResults([])
        setYtQuery("")
        triggerUpdate({ 
            videoId: result.videoId, 
            videoTitle: result.title, 
            videoChannel: result.channel, 
            videoThumbnail: result.thumbnail 
        })
    }

    const handleAddVideoToPlaylist = (video: any) => {
        const newPlaylist = [...playlist, {
            videoId: video.videoId,
            title: video.title,
            channel: video.channel,
            thumbnail: video.thumbnail
        }]
        setPlaylist(newPlaylist)
        setPlaylistMode(true)
        
        // Auto-seleção: se não tiver vídeo principal, define este como o primeiro
        if (!videoId) {
            setVideoId(video.videoId)
            setVideoTitle(video.title)
            setVideoChannel(video.channel)
            setVideoThumbnail(video.thumbnail)
        }

        triggerUpdate({ 
            playlist: newPlaylist, 
            playlistMode: true,
            // Inclui os dados do vídeo principal caso tenham sido setados agora
            ...(!videoId ? {
                videoId: video.videoId,
                videoTitle: video.title,
                videoChannel: video.channel,
                videoThumbnail: video.thumbnail
            } : {})
        })
        setYtResults([])
        setYtQuery("")
    }

    const handleImportPlaylist = async () => {
        // Agora esta lógica está integrada no handleUniversalYouTubeAction
        handleUniversalYouTubeAction()
    }

    const removeFromPlaylist = (index: number) => {
        const newPlaylist = playlist.filter((_, i) => i !== index)
        setPlaylist(newPlaylist)
        if (newPlaylist.length === 0) {
            setJukeboxMode(false)
            setPlaylistMode(false)
            triggerUpdate({ playlist: newPlaylist, jukeboxMode: false, playlistMode: false })
        } else {
            triggerUpdate({ playlist: newPlaylist })
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

    const triggerUpdate = (updates: Partial<UniversalMediaContent>, blockUpdates: Partial<MoodBlock> = {}) => {
        if (!block?.id || !onUpdate) return

        const currentContent: UniversalMediaContent = {
            mediaType,
            videoId,
            videoTitle,
            videoChannel,
            videoThumbnail,
            trackId,
            audioUrl,
            frame,
            lyrics,
            lyricsDisplay,
            name: trackName,
            artist: trackArtist,
            albumArt: trackAlbumArt,
            audioStyle,
            playlist,
            playlistMode,
            jukeboxMode,
            ...updates
        }

        const typeToSave = ['video', 'music'].includes(block.type) ? 'media' : block.type

        onUpdate({
            type: typeToSave,
            content: currentContent,
            ...blockUpdates
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
            playlist,
            playlistMode,
            jukeboxMode,
            ...(mediaType === 'video' ? {
                videoTitle,
                videoChannel,
                videoThumbnail
            } : {}),
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
                <GridSelector
                    id="media-type"
                    columns={3}
                    variant="ghost"
                    options={[
                        { id: 'video', label: 'YouTube', icon: Youtube, color: '#FF0000' },
                        { id: 'music', label: 'Spotify', icon: SpotifyIcon, color: '#1DB954' },
                        { id: 'audio', label: 'Arquivo Local', icon: Upload, color: '#fb7185' }
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
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                            <Input
                                placeholder="Pesquisar ou colar link do YouTube..."
                                value={ytQuery}
                                onChange={(e) => setYtQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUniversalYouTubeAction()}
                                className="bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-2xl pl-12 h-14 text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-red-500/20 placeholder:text-zinc-400"
                            />
                        </div>
                        
                        <Button
                            onClick={handleUniversalYouTubeAction}
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-red-500/20 transition-all active:scale-95"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                            {isLoading ? 'Processando...' : 'Buscar ou Importar'}
                        </Button>


                        {/* Card de vídeo selecionado (enriquecido) */}
                        {videoId && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-500/5 dark:bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center gap-4 overflow-hidden relative"
                            >
                                <div className="w-20 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-red-500/20">
                                    <img 
                                        src={videoThumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                                        className="w-full h-full object-cover"
                                        alt="Thumbnail"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[8px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Vídeo Selecionado</p>
                                    <p className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase truncate">{videoTitle || `ID: ${videoId}`}</p>
                                    {videoChannel && <p className="text-[9px] text-zinc-500 uppercase truncate">{videoChannel}</p>}
                                </div>
                                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
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

            {mediaType === 'video' && ytResults.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-lg divide-y divide-zinc-50 dark:divide-zinc-800 max-h-72 overflow-y-auto custom-scrollbar">
                    {ytResults.map((result) => (
                        <div
                            key={result.videoId}
                            onClick={() => handleSelectYouTubeResult(result)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-left group cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleSelectYouTubeResult(result)
                                }
                            }}
                        >
                            <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 relative">
                                <img src={result.thumbnail} alt="" className="w-full h-full object-cover" />
                                {result.duration && (
                                    <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[7px] font-bold px-1 rounded">
                                        {result.duration}
                                    </span>
                                )}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase truncate">{result.title}</p>
                                <p className="text-[9px] text-zinc-500 uppercase truncate">{result.channel}</p>
                            </div>
                            <div className="flex items-center gap-2 pr-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleAddVideoToPlaylist(result)
                                    }}
                                    className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-red-500 hover:text-white transition-all shadow-sm group/btn"
                                    title="Adicionar à Playlist"
                                >
                                    <ListPlus className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(videoId || trackId || audioUrl || playlist.length > 0) && (
                <div className="space-y-10">
                    {/* Modular Playlist Section */}
                    {mediaType === 'video' && (
                        <EditorSection title={t('editors.universal_media.playlist_section')}>
                            <div className="flex items-center justify-between gap-3 px-1 mb-4">
                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                    <ListMusic className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                                    <div className="min-w-0">
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                            {t('editors.universal_media.sequential_mode')}
                                        </span>
                                        <p className="mt-1 max-w-[260px] text-[8px] font-medium uppercase leading-relaxed tracking-wide text-zinc-400">
                                            {t('editors.universal_media.sequential_hint')}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={playlistMode}
                                    onCheckedChange={(val) => {
                                        setPlaylistMode(val)
                                        if (!val) setJukeboxMode(false)
                                        triggerUpdate({
                                            playlistMode: val,
                                            ...(!val ? { jukeboxMode: false } : {}),
                                        })
                                    }}
                                    className="scale-75 shrink-0 data-[state=checked]:bg-red-500"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-3 px-1 mb-6">
                                <div
                                    className={cn(
                                        "flex min-w-0 flex-1 items-start gap-3",
                                        playlist.length === 0 && "opacity-45",
                                    )}
                                >
                                    <PanelBottom className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                                    <div className="min-w-0">
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                            {t('editors.universal_media.jukebox_mode')}
                                        </span>
                                        <p className="mt-1 max-w-[280px] text-[8px] font-medium uppercase leading-relaxed tracking-wide text-zinc-400">
                                            {t('editors.universal_media.jukebox_hint')}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    disabled={playlist.length === 0}
                                    checked={jukeboxMode}
                                    onCheckedChange={(val) => {
                                        setJukeboxMode(val)
                                        if (val && !playlistMode) {
                                            setPlaylistMode(true)
                                            triggerUpdate({ jukeboxMode: val, playlistMode: true })
                                        } else {
                                            triggerUpdate({ jukeboxMode: val })
                                        }
                                    }}
                                    className="scale-75 shrink-0 data-[state=checked]:bg-rose-500"
                                />
                            </div>

                            {playlistMode && (
                                <div className="space-y-6">
                                    {playlist.length > 0 && (
                                        <div className="custom-scrollbar max-h-60 space-y-2 overflow-y-auto pr-2">
                                            {playlist.map((item, idx) => (
                                                <motion.div
                                                    layout
                                                    key={`${item.videoId}-${idx}`}
                                                    className="group/item flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-2 shadow-sm transition-all hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                                                >
                                                    <div className="relative h-8 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                                                        <img
                                                            src={
                                                                item.thumbnail ||
                                                                `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`
                                                            }
                                                            className="h-full w-full object-cover"
                                                            alt=""
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover/item:opacity-100">
                                                            <span className="text-[8px] font-black text-white">{idx + 1}</span>
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-[10px] font-bold uppercase text-zinc-900 dark:text-white">
                                                            {item.title}
                                                        </p>
                                                        <p className="truncate text-[8px] uppercase text-zinc-500">{item.channel}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromPlaylist(idx)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 opacity-0 transition-colors hover:text-red-500 group-hover/item:opacity-100 dark:bg-zinc-950"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </EditorSection>
                    )}

                    <EditorSection title="Estética">


                        <div className="flex items-center justify-between px-1 mb-4">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                                Configurações
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400/60">Lyrics</span>
                                <Switch 
                                    checked={showLyrics} 
                                    onCheckedChange={setShowLyrics}
                                    className="scale-75 data-[state=checked]:bg-rose-500"
                                />
                            </div>
                        </div>

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
                                        
                                        const recommendedSizes = {
                                            classic: { width: 320, height: 160 },
                                            aura: { width: 280, height: 280 },
                                            dots: { width: 400, height: 240 }
                                        }

                                        triggerUpdate({ audioStyle: newStyle }, recommendedSizes[newStyle])
                                    }}
                                />
                            </EditorSection>
                        )}
                    </EditorSection>

                    <AnimatePresence>
                        {showLyrics && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="overflow-hidden"
                            >
                                <EditorSection title="Letras (Lyrics)">
                                    <div className="space-y-6">
                                        <textarea
                                            value={lyrics}
                                            onChange={(e) => {
                                                setLyrics(e.target.value)
                                                triggerUpdate({ lyrics: e.target.value })
                                            }}
                                            placeholder="Insira as letras aqui... Ex: [00:15] Minha frase"
                                            className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 text-[12px] font-medium resize-none focus:ring-2 focus:ring-rose-500/10 transition-all custom-scrollbar"
                                        />
                                    </div>
                                </EditorSection>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
