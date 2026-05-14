"use server"

import type { YouTubePlaylistItem } from "@/types/database"

// ─────────────────────────────────────────────────────────────
// YouTube Data API v3 — Server Action
// Espelha o padrão do spotify.ts para consistência do ecossistema
// ─────────────────────────────────────────────────────────────

interface YouTubeAPISnippet {
    title: string
    channelTitle: string
    thumbnails: {
        medium?: { url: string }
        high?: { url: string }
        default?: { url: string }
    }
}

interface YouTubeAPISearchItem {
    id: { videoId: string }
    snippet: YouTubeAPISnippet
}

interface YouTubeAPIVideoItem {
    id: string
    snippet: YouTubeAPISnippet
    contentDetails?: { duration: string }
}

/** Item de `playlistItems.list` (Data API v3). */
interface YouTubeAPIPlaylistItem {
    snippet: {
        title: string
        channelTitle: string
        resourceId: { videoId: string }
        thumbnails: {
            medium?: { url: string }
            default?: { url: string }
            high?: { url: string }
        }
    }
}

/**
 * Converte duração ISO 8601 do YouTube (PT4M13S) para formato legível (4:13)
 */
function parseDuration(iso: string): string {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return "0:00"

    const hours = parseInt(match[1] || "0")
    const minutes = parseInt(match[2] || "0")
    const seconds = parseInt(match[3] || "0")

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}`
}

/**
 * Busca vídeos no YouTube por texto.
 * Retorna até 5 resultados com título, canal e thumbnail.
 * 
 * Custo de quota: 100 units (search) + 1 unit (videos.list) = ~101 units por busca
 * Limite diário: 10.000 units = ~99 buscas/dia (suficiente para uso moderado)
 */
export async function searchYouTubeVideos(query: string): Promise<YouTubePlaylistItem[] | { error: string }> {
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
        return { error: "Configuração do YouTube incompleta. Adicione YOUTUBE_API_KEY ao .env" }
    }

    if (!query || query.trim().length < 2) {
        return { error: "Digite pelo menos 2 caracteres para buscar" }
    }

    try {
        // Etapa 1: Buscar vídeos por texto
        const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search")
        searchUrl.searchParams.set("part", "snippet")
        searchUrl.searchParams.set("q", query.trim())
        searchUrl.searchParams.set("type", "video")
        searchUrl.searchParams.set("maxResults", "5")
        searchUrl.searchParams.set("videoEmbeddable", "true")
        searchUrl.searchParams.set("key", apiKey)

        const searchResponse = await fetch(searchUrl.toString(), { next: { revalidate: 300 } })

        if (!searchResponse.ok) {
            const errorData = await searchResponse.json().catch(() => null)
            const reason = errorData?.error?.message || searchResponse.statusText
            console.error("[YouTube API] Search failed:", reason)

            if (searchResponse.status === 403) {
                return { error: "Quota da API do YouTube excedida. Tente novamente amanhã." }
            }
            return { error: `Erro na busca do YouTube: ${reason}` }
        }

        const searchData = await searchResponse.json()
        const items: YouTubeAPISearchItem[] = searchData.items || []

        if (items.length === 0) {
            return []
        }

        // Etapa 2: Buscar duração dos vídeos (batch request)
        const videoIds = items.map(item => item.id.videoId).join(",")
        const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos")
        detailsUrl.searchParams.set("part", "contentDetails,snippet")
        detailsUrl.searchParams.set("id", videoIds)
        detailsUrl.searchParams.set("key", apiKey)

        const detailsResponse = await fetch(detailsUrl.toString(), { next: { revalidate: 300 } })
        const detailsData = detailsResponse.ok ? await detailsResponse.json() : null
        const detailItems: YouTubeAPIVideoItem[] = detailsData?.items || []

        // Mapear duração por ID para enriquecer resultados
        const durationMap = new Map<string, string>()
        for (const item of detailItems) {
            if (item.contentDetails?.duration) {
                durationMap.set(item.id, parseDuration(item.contentDetails.duration))
            }
        }

        // Montar resultado final
        return items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium?.url 
                || item.snippet.thumbnails.high?.url 
                || item.snippet.thumbnails.default?.url 
                || `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
            duration: durationMap.get(item.id.videoId)
        }))

    } catch (error) {
        console.error("[YouTube API] Unexpected error:", error)
        return { error: "Erro inesperado ao buscar no YouTube. Verifique sua conexão." }
    }
}

/**
 * Busca metadados de um vídeo específico pelo ID.
 * Útil para enriquecer vídeos adicionados por URL.
 */
export async function getYouTubeVideoInfo(videoId: string): Promise<YouTubePlaylistItem | { error: string }> {
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
        return { error: "Configuração do YouTube incompleta. Adicione YOUTUBE_API_KEY ao .env" }
    }

    if (!videoId || videoId.length !== 11) {
        return { error: "ID de vídeo inválido" }
    }

    try {
        const url = new URL("https://www.googleapis.com/youtube/v3/videos")
        url.searchParams.set("part", "snippet,contentDetails")
        url.searchParams.set("id", videoId)
        url.searchParams.set("key", apiKey)

        const response = await fetch(url.toString(), { next: { revalidate: 600 } })

        if (!response.ok) {
            return { error: "Não foi possível obter informações do vídeo" }
        }

        const data = await response.json()
        const item: YouTubeAPIVideoItem | undefined = data.items?.[0]

        if (!item) {
            return { error: "Vídeo não encontrado" }
        }

        return {
            videoId: item.id,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium?.url 
                || item.snippet.thumbnails.high?.url 
                || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            duration: item.contentDetails?.duration 
                ? parseDuration(item.contentDetails.duration) 
                : undefined
        }
    } catch (error) {
        console.error("[YouTube API] Video info error:", error)
        return { error: "Erro ao buscar informações do vídeo" }
    }
}
/**
 * Extrai o ID da playlist de uma URL do YouTube de forma robusta.
 */
function extractPlaylistId(url: string): string | null {
    // Tenta pegar o parâmetro 'list' de qualquer URL
    const match = url.match(/[&?]list=([^&?#]+)/);
    if (match && match[1]) return match[1];
    
    // Se não for uma URL, assume que é o próprio ID (se tiver cara de ID de playlist)
    if (url.length > 10 && !url.includes("/") && !url.includes(".")) return url;
    
    return null;
}

/**
 * Importa vídeos de uma playlist do YouTube OU um vídeo único para a fila.
 */
export async function importYouTubePlaylist(urlOrId: string): Promise<YouTubePlaylistItem[] | { error: string }> {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) return { error: "YOUTUBE_API_KEY não configurada" }

    const trimmedInput = urlOrId.trim()
    const playlistId = extractPlaylistId(trimmedInput)
    
    // Se achou um ID de playlist válido (e não é Mix)
    if (playlistId && !playlistId.startsWith("RD")) {
        try {
            console.log(`[YouTube API] Importando playlist: ${playlistId}`)
            const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems")
            url.searchParams.set("part", "snippet")
            url.searchParams.set("playlistId", playlistId)
            url.searchParams.set("maxResults", "20")
            url.searchParams.set("key", apiKey)

            const response = await fetch(url.toString(), { next: { revalidate: 3600 } })

            if (response.ok) {
                const data = await response.json()
                const items = data.items || []
                if (items.length > 0) {
                    return (items as YouTubeAPIPlaylistItem[])
                        .map((item): YouTubePlaylistItem | null => {
                            const id = item.snippet?.resourceId?.videoId
                            if (!id) return null
                            return {
                                videoId: id,
                                title: item.snippet.title,
                                channel: item.snippet.channelTitle,
                                thumbnail:
                                    item.snippet.thumbnails?.medium?.url
                                    || item.snippet.thumbnails?.default?.url
                                    || item.snippet.thumbnails?.high?.url
                                    || `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
                            }
                        })
                        .filter((x): x is YouTubePlaylistItem => x !== null)
                }
            }
        } catch (e) {
            console.error("[YouTube API] Playlist fetch error, falling back to video check", e)
        }
    }

    // Fallback: Tenta tratar como um vídeo único
    const videoId = trimmedInput.includes("v=") 
        ? trimmedInput.split("v=")[1]?.split("&")[0] 
        : trimmedInput.includes("youtu.be/") 
            ? trimmedInput.split("youtu.be/")[1]?.split("?")[0]
            : trimmedInput.length === 11 ? trimmedInput : null

    if (videoId) {
        console.log(`[YouTube API] Tratando como vídeo único: ${videoId}`)
        const info = await getYouTubeVideoInfo(videoId)
        if (info && !("error" in info)) {
            return [info]
        }
    }

    return { error: "Não foi possível encontrar uma playlist ou vídeo válido neste link. Verifique se ele é público." }
}
