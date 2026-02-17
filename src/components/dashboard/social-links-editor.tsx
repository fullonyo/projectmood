"use client"

import { useState, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Instagram,
    Twitter,
    Github,
    Linkedin,
    Youtube,
    MessageSquare,
    Link as LinkIcon,
    Plus
} from "lucide-react"
import { DiscordIcon, TikTokIcon, SpotifyIcon, TwitchIcon, PinterestIcon } from "@/components/icons"

const PLATFORMS = [
    { id: 'instagram', icon: Instagram, label: 'Instagram', color: '#E4405F' },
    { id: 'twitter', icon: Twitter, label: 'Twitter/X', color: '#000000' },
    { id: 'discord', icon: DiscordIcon, label: 'Discord', color: '#5865F2' },
    { id: 'tiktok', icon: TikTokIcon, label: 'TikTok', color: '#000000' },
    { id: 'spotify', icon: SpotifyIcon, label: 'Spotify', color: '#1DB954' },
    { id: 'twitch', icon: TwitchIcon, label: 'Twitch', color: '#9146FF' },
    { id: 'pinterest', icon: PinterestIcon, label: 'Pinterest', color: '#E60023' },
    { id: 'github', icon: Github, label: 'GitHub', color: '#333' },
    { id: 'youtube', icon: Youtube, label: 'YouTube', color: '#FF0000' },
    { id: 'custom', icon: LinkIcon, label: 'Link Personalizado', color: '#666' },
]

const STYLES = [
    { id: 'tag', label: 'Etiqueta de Papel' },
    { id: 'glass', label: 'Vidro (Glass)' },
    { id: 'minimal', label: 'Minimalista' },
    { id: 'neon', label: 'Neon Glow' }
]

export function SocialLinksEditor() {
    const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0])
    const [url, setUrl] = useState("")
    const [label, setLabel] = useState("")
    const [style, setStyle] = useState('tag')
    const [isPending, startTransition] = useTransition()

    const handleAdd = () => {
        if (!url) return

        startTransition(async () => {
            await addMoodBlock('social', {
                platform: selectedPlatform.id,
                url,
                label: label || selectedPlatform.label,
                style
            }, { x: 300, y: 300 })

            setUrl("")
            setLabel("")
        })
    }

    return (
        <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Social Connect</h2>

            <div className="space-y-4 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <div className="grid grid-cols-6 gap-2">
                    {PLATFORMS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPlatform(p)}
                            className={`p-2 rounded-xl flex items-center justify-center transition-all ${selectedPlatform.id === p.id
                                ? 'bg-black text-white dark:bg-white dark:text-black scale-110'
                                : 'bg-white dark:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
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
                        className="h-9 text-xs bg-white dark:bg-zinc-900 border-none rounded-lg"
                    />
                    <Input
                        placeholder="Texto (Opcional)"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="h-9 text-xs bg-white dark:bg-zinc-900 border-none rounded-lg"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {STYLES.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setStyle(s.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${style === s.id
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                <Button
                    onClick={handleAdd}
                    disabled={isPending || !url}
                    className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:scale-[1.02] transition-transform h-10"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Link
                </Button>
            </div>
        </div>
    )
}
