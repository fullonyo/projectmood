"use client"

import { useState, useTransition, useEffect } from "react"
import { addMoodBlock, updateMoodBlockLayout } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Instagram,
    Twitter,
    Github,
    Linkedin,
    Youtube,
    Link as LinkIcon,
    Plus,
    Share2
} from "lucide-react"
import { DiscordIcon, TikTokIcon, SpotifyIcon, TwitchIcon, PinterestIcon, SteamIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

const PLATFORMS = [
    { id: 'instagram', icon: Instagram, label: 'Instagram', color: '#E4405F' },
    { id: 'twitter', icon: Twitter, label: 'Twitter/X', color: '#000000' },
    { id: 'discord', icon: DiscordIcon, label: 'Discord', color: '#5865F2' },
    { id: 'tiktok', icon: TikTokIcon, label: 'TikTok', color: '#000000' },
    { id: 'steam', icon: SteamIcon, label: 'Steam', color: '#171a21' },
    { id: 'spotify', icon: SpotifyIcon, label: 'Spotify', color: '#1DB954' },
    { id: 'twitch', icon: TwitchIcon, label: 'Twitch', color: '#9146FF' },
    { id: 'pinterest', icon: PinterestIcon, label: 'Pinterest', color: '#E60023' },
    { id: 'github', icon: Github, label: 'GitHub', color: '#333' },
    { id: 'youtube', icon: Youtube, label: 'YouTube', color: '#FF0000' },
    { id: 'custom', icon: LinkIcon, label: 'Link Personalizado', color: '#666' },
]

const STYLES = [
    { id: 'tag', label: 'Etiqueta' },
    { id: 'glass', label: 'Glass' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'neon', label: 'Neon' }
]

export function SocialLinksEditor({
    block,
    onUpdate,
    highlight
}: {
    block?: any,
    onUpdate?: (id: string, content: any) => void,
    highlight?: boolean
}) {
    const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0])
    const [url, setUrl] = useState("")
    const [label, setLabel] = useState("")
    const [style, setStyle] = useState('tag')
    const [isPending, startTransition] = useTransition()

    // 1. Sync with selected block
    useEffect(() => {
        if (block && block.type === 'social') {
            const platformId = (block.content as any).platform
            const platform = PLATFORMS.find(p => p.id === platformId) || PLATFORMS[0]
            setSelectedPlatform(platform)
            setUrl((block.content as any).url || "")
            setLabel((block.content as any).label || "")
            setStyle((block.content as any).style || 'tag')
        }
    }, [block?.id])

    // 2. Real-time Preview
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const content = {
            platform: selectedPlatform.id,
            url,
            label: label || selectedPlatform.label,
            style
        }

        onUpdate(block.id, content)
    }, [selectedPlatform, url, label, style])

    // 3. Debounced Silent Save
    useEffect(() => {
        if (!block?.id || !url) return

        const timer = setTimeout(async () => {
            const content = {
                platform: selectedPlatform.id,
                url,
                label: label || selectedPlatform.label,
                style
            }
            await updateMoodBlockLayout(block.id, { content })
        }, 800)

        return () => clearTimeout(timer)
    }, [selectedPlatform, url, label, style, block?.id])

    const handleAction = () => {
        if (!url) return

        startTransition(async () => {
            const content = {
                platform: selectedPlatform.id,
                url,
                label: label || selectedPlatform.label,
                style
            }

            if (block?.id) {
                await updateMoodBlockLayout(block.id, { content })
            } else {
                await addMoodBlock('social', content, { x: 300, y: 300 })
                setUrl("")
                setLabel("")
            }
        })
    }
    return (
        <div className={cn(
            "space-y-6 transition-all duration-500 rounded-3xl",
            highlight ? "ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 p-6 -m-6" : ""
        )}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <Share2 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Social Connect</h3>
            </div>

            <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="flex gap-2 overflow-x-auto pb-4 pt-1 -mx-1 px-1 custom-scrollbar snap-x">
                    {PLATFORMS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPlatform(p)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all min-w-[80px] snap-start shrink-0 group",
                                selectedPlatform.id === p.id
                                    ? "border-black dark:border-white bg-white dark:bg-zinc-800 shadow-md scale-[1.05]"
                                    : "border-transparent opacity-50 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                            )}
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6 group-active:scale-90"
                                style={{ backgroundColor: p.color }}
                            >
                                <p.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-500 whitespace-nowrap">
                                {p.label === 'Link Personalizado' ? 'Link' : p.label}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="space-y-2">
                    <Input
                        placeholder="Link (URL)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-10 text-xs bg-white dark:bg-zinc-900 border-none rounded-xl shadow-inner"
                    />
                    <Input
                        placeholder="Nome Exibido (Ex: Meu Insta)"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="h-10 text-xs bg-white dark:bg-zinc-900 border-none rounded-xl shadow-inner"
                    />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {STYLES.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setStyle(s.id)}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase transition-all ${style === s.id
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                <Button
                    onClick={handleAction}
                    disabled={isPending || !url}
                    className="w-full bg-black dark:bg-white text-white dark:text-black rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {block?.id ? 'Atualizar Link' : 'Adicionar ao Mural'}
                </Button>
            </div>
        </div>
    )
}
