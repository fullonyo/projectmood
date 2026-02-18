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
    Plus
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
            "space-y-6 transition-all duration-500 rounded-2xl",
            highlight ? "ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 p-4 -m-4" : ""
        )}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 px-1">Social Connect</h2>

            <div className="space-y-4 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <div className="grid grid-cols-6 gap-2">
                    {PLATFORMS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPlatform(p)}
                            className={`p-2 rounded-xl flex items-center justify-center transition-all ${selectedPlatform.id === p.id
                                ? 'bg-black text-white dark:bg-white dark:text-black scale-110 shadow-lg'
                                : 'bg-white dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 border border-zinc-100 dark:border-zinc-700'
                                }`}
                        >
                            <p.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                <div className="space-y-2">
                    <Input
                        placeholder="Link (URL)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-10 text-xs bg-white dark:bg-zinc-900 border-none rounded-xl"
                    />
                    <Input
                        placeholder="Nome Exibido (Ex: Meu Insta)"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="h-10 text-xs bg-white dark:bg-zinc-900 border-none rounded-xl"
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
                    className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:scale-[1.02] transition-transform h-10 border-none"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {block?.id ? 'Atualizar Link' : 'Adicionar ao Mural'}
                </Button>
            </div>
        </div>
    )
}
