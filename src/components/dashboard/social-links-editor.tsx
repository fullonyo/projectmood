"use client"

import { useState, useTransition, useEffect } from "react"
import { addMoodBlock } from "@/actions/profile"
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
import { toast } from "sonner"
import { useTranslation } from "@/i18n/context"

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
    { id: 'custom', icon: LinkIcon, label: 'custom_link', color: '#666' },
]

const STYLES = [
    { id: 'tag', label: 'tag' },
    { id: 'glass', label: 'glass' },
    { id: 'minimal', label: 'minimal' },
    { id: 'neon', label: 'neon' },
    { id: 'pill', label: 'pill' },
    { id: 'brutalist', label: 'brutalist' },
    { id: 'ghost', label: 'ghost' },
    { id: 'clay', label: 'clay' },
    { id: 'retro', label: 'retro' },
    { id: 'aura', label: 'aura' }
]

import { MoodBlock, SocialContent } from "@/types/database"

export function SocialLinksEditor({
    block,
    onUpdate,
    onAdd,
    onClose,
    highlight
}: {
    block?: MoodBlock | null,
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void,
    onAdd?: (content: SocialContent) => Promise<void>,
    onClose?: () => void,
    highlight?: boolean
}) {
    const { t } = useTranslation()
    const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0])
    const [url, setUrl] = useState("")
    const [label, setLabel] = useState("")
    const [style, setStyle] = useState('tag')
    const [subLabel, setSubLabel] = useState("")
    const [isGrid, setIsGrid] = useState(false)
    const [showBg, setShowBg] = useState(true)
    const [isPending, startTransition] = useTransition()

    // 1. Sync with selected block
    useEffect(() => {
        if (block && block.type === 'social') {
            const content = block.content as SocialContent
            const platformId = content.platform
            const platform = PLATFORMS.find(p => p.id === platformId) || PLATFORMS[0]
            setSelectedPlatform(platform)
            setUrl(content.url || "")
            setLabel(content.label || "")
            setSubLabel(content.subLabel || "")
            setStyle(content.style || 'tag')
            setIsGrid(!!content.isGrid)
            setShowBg(content.showBg !== false)
        }
    }, [block?.id])

    // 2. Real-time Preview
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const content = {
            platform: selectedPlatform.id,
            url,
            label: label || selectedPlatform.label,
            subLabel,
            style,
            isGrid,
            showBg
        }

        onUpdate(block.id, { content })
    }, [selectedPlatform, url, label, subLabel, style, isGrid, showBg])



    const handleAction = () => {
        if (!url && !block?.id) return

        startTransition(async () => {
            const content = {
                platform: selectedPlatform.id,
                url,
                label: label || selectedPlatform.label,
                subLabel,
                style,
                isGrid,
                showBg
            }

            if (block?.id) {
                if (onClose) onClose()
            } else if (onAdd) {
                await onAdd(content)
                setUrl("")
                setLabel("")
                setSubLabel("")
            } else {
                // Dimensões dinâmicas: se isGrid, cria um cubinho, se não, cria um botão retangular esticado para caber o texto
                const initialWidth = isGrid ? 50 : 150
                const initialHeight = isGrid ? 50 : 45

                const res = await addMoodBlock('social', content, {
                    x: 50, y: 50,
                    width: initialWidth,
                    height: initialHeight
                })

                if (res.error) {
                    toast.error(res.error)
                } else {
                    setUrl("")
                    setLabel("")
                    setSubLabel("")
                }
            }
        })
    }
    return (
        <div className={cn(
            "space-y-6 transition-all duration-500",
            highlight ? "border-2 border-black dark:border-white p-6 -m-6 bg-zinc-50 dark:bg-zinc-900/50" : ""
        )}>
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <Share2 className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.social.title')}</h3>
            </div>

            <div className="space-y-6 border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950">
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 text-center">{t('editors.social.nodes')}</p>
                    <div className="grid grid-cols-4 border border-zinc-200 dark:border-zinc-800">
                        {PLATFORMS.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPlatform(p)}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-4 border-r border-b border-zinc-200 dark:border-zinc-800 transition-all",
                                    selectedPlatform.id === p.id
                                        ? "bg-black text-white dark:bg-white dark:text-black"
                                        : "bg-white dark:bg-zinc-950 opacity-60 hover:opacity-100"
                                )}
                            >
                                <p.icon className="w-4 h-4" />
                                <span className="text-[7px] font-black uppercase tracking-tighter truncate w-full text-center">
                                    {p.id === 'custom' ? 'LINK' : p.id.toUpperCase()}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div className="space-y-3">
                        <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">{t('editors.social.link_protocol')}</p>
                        <Input
                            placeholder={t('editors.social.link_placeholder')}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none text-[10px] font-mono h-11 uppercase tracking-tight focus-visible:ring-0"
                        />
                    </div>
                    <div className="space-y-3">
                        <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">{t('editors.social.visual_alias')}</p>
                        <Input
                            placeholder={t('editors.social.alias_placeholder')}
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none text-[10px] uppercase font-mono h-11 focus-visible:ring-0"
                        />
                    </div>
                    <div className="space-y-3">
                        <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">{t('editors.social.sub_label')}</p>
                        <Input
                            placeholder={t('editors.social.sub_label_placeholder')}
                            value={subLabel}
                            onChange={(e) => setSubLabel(e.target.value)}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none text-[10px] font-mono h-11 focus-visible:ring-0"
                        />
                    </div>
                </div>

                <div className="p-5 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-6">
                    <div className="space-y-3">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em]">{t('editors.social.style_manifesto')}</p>
                        <div className="grid grid-cols-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            {STYLES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStyle(s.id)}
                                    className={cn(
                                        "h-10 text-[8px] font-black uppercase tracking-widest transition-all border-r border-b last:border-r-0 border-zinc-100 dark:border-zinc-900",
                                        style === s.id
                                            ? "bg-black text-white dark:bg-white dark:text-black"
                                            : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                    )}
                                >
                                    {t(`editors.social.styles.${s.id}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-0">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold">{t('editors.social.layout_bento')}</p>
                                <p className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest">{t('editors.social.layout_bento_desc')}</p>
                            </div>
                            <button
                                onClick={() => setIsGrid(!isGrid)}
                                className={cn(
                                    "w-10 h-5 transition-colors relative",
                                    isGrid ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-3 h-3 bg-white dark:bg-black transition-all",
                                    isGrid ? "left-6" : "left-1"
                                )} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-t-0 border-zinc-200 dark:border-zinc-800">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold">{t('editors.social.layout_borderless')}</p>
                                <p className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest leading-relaxed max-w-[200px]">{t('editors.social.layout_borderless_desc')}</p>
                            </div>
                            <button
                                onClick={() => setShowBg(!showBg)}
                                className={cn(
                                    "w-10 h-5 transition-colors relative",
                                    !showBg ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-3 h-3 bg-white dark:bg-black transition-all",
                                    !showBg ? "left-6" : "left-1"
                                )} />
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={handleAction}
                        disabled={isPending || (!url && !block?.id)}
                        className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-12 font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all"
                    >
                        {isPending ? t('common.loading') : (block?.id ? t('common.close') : t('editors.social.deploy'))}
                    </Button>
                </div>
            </div>
        </div>
    )
}
