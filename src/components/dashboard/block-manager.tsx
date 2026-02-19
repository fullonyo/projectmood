"use client"

import { useTransition } from "react"
import { deleteMoodBlock } from "@/actions/profile"
import {
    Trash2,
    GripVertical,
    Music,
    Type,
    Image as ImageIcon,
    Video,
    Quote,
    Sparkles,
    Clock,
    Share2,
    Cloud,
    Book,
    Play,
    Pencil,
    MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BlockManagerProps {
    blocks: any[]
}

export function BlockManager({ blocks }: BlockManagerProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = (id: string) => {
        if (!confirm("Tem certeza que deseja remover este bloco?")) return
        startTransition(async () => {
            await deleteMoodBlock(id)
        })
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type className="w-4 h-4" />
            case 'music': return <Music className="w-4 h-4" />
            case 'photo': return <ImageIcon className="w-4 h-4" />
            case 'video': return <Video className="w-4 h-4" />
            case 'quote': return <Quote className="w-4 h-4" />
            case 'moodStatus': return <Sparkles className="w-4 h-4" />
            case 'countdown': return <Clock className="w-4 h-4" />
            case 'social': return <Share2 className="w-4 h-4" />
            case 'weather': return <Cloud className="w-4 h-4" />
            case 'media': return <Book className="w-4 h-4" />
            case 'gif': return <Play className="w-4 h-4" />
            case 'doodle': return <Pencil className="w-4 h-4" />
            case 'guestbook': return <MessageSquare className="w-4 h-4" />
            default: return <GripVertical className="w-4 h-4" />
        }
    }

    const getContentLabel = (block: any) => {
        const type = block.type
        const content = block.content as any

        switch (type) {
            case 'text': return content.text || "Notas"
            case 'music': return "Música do Spotify"
            case 'photo': return "Imagem / Foto"
            case 'video': return "Vídeo do YouTube"
            case 'quote': return content.text || "Citação"
            case 'moodStatus': return `Mood: ${content.status}`
            case 'countdown': return content.title || "Contagem Regressiva"
            case 'social': return `${content.platform} link`
            case 'weather': return `Vibe: ${content.vibe}`
            case 'media': return `${content.category === 'book' ? 'Livro' : 'Filme'}: ${content.title}`
            case 'gif': return "GIF Animado"
            case 'doodle': return "Desenho à mão"
            case 'guestbook': return "Livro de Recados"
            default: return "Bloco de Conteúdo"
        }
    }

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Seu Feed</h2>

            {blocks.length === 0 && (
                <p className="text-xs text-zinc-500 italic">Nenhum bloco ainda...</p>
            )}

            <div className="space-y-2">
                {blocks.map((block) => (
                    <div
                        key={block.id}
                        className={cn(
                            "group flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-none hover:border-black dark:hover:border-white transition-all shadow-none",
                            isPending && "opacity-50"
                        )}
                    >
                        <div className="text-zinc-400 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                        </div>

                        <div className="w-8 h-8 rounded-none bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-500 border border-black/10 dark:border-white/10">
                            {getIcon(block.type)}
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-medium truncate opacity-80">
                                {getContentLabel(block)}
                            </p>
                        </div>

                        <button
                            onClick={() => handleDelete(block.id)}
                            disabled={isPending}
                            className="w-8 h-8 flex items-center justify-center rounded-none text-zinc-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
