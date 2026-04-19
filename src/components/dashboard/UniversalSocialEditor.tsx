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
    Share2,
    Activity,
    Image as ImageIcon
} from "lucide-react"
import { Label } from "@/components/ui/label"
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
import { EditorHeader, EditorSection, GridSelector, EditorActionButton, PillSelector, EditorSwitch } from "./EditorUI"

export function UniversalSocialEditor({
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
    }, [selectedPlatform, url, label, subLabel, style, isGrid, showBg, block?.id, onUpdate])

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
            "space-y-12 pb-20",
            highlight ? "p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800" : ""
        )}>
            <EditorHeader 
                title={t('editors.social.title')} 
                subtitle={t('editors.social.subtitle')}
            />

            <EditorSection title="Plataforma">
                <GridSelector
                    options={PLATFORMS.map(p => ({ id: p.id as any, label: p.id === 'custom' ? 'Link' : p.label, icon: p.icon }))}
                    activeId={selectedPlatform.id as any}
                    onChange={(id) => {
                        const p = PLATFORMS.find(platform => platform.id === id)
                        if (p) setSelectedPlatform(p)
                    }}
                    columns={4}
                />
            </EditorSection>

            <EditorSection title="Configurações">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Link / URL</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="https://..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 h-12 text-[11px] font-medium"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Label</Label>
                            <Input
                                placeholder="Texto do botão"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl h-12 text-[11px] font-medium px-4"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Sub-label</Label>
                            <Input
                                placeholder="Texto secundário"
                                value={subLabel}
                                onChange={(e) => setSubLabel(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl h-12 text-[11px] font-medium px-4"
                            />
                        </div>
                    </div>
                </div>
            </EditorSection>

            <EditorSection title="Estética">
                <div className="space-y-6">
                    <EditorSection title="Estilo Visual">
                        <PillSelector
                            variant="scroll"
                            options={STYLES.map(s => ({ id: s.id as any, label: t(`editors.social.styles.${s.id}`) }))}
                            activeId={style as any}
                            onChange={(id) => setStyle(id as any)}
                        />
                    </EditorSection>

                    <div className="grid grid-cols-2 gap-4">
                        <EditorSwitch
                            label="Modo Grade"
                            value={isGrid}
                            onChange={setIsGrid}
                            icon={Share2}
                        />
                        <EditorSwitch
                            label="Sem Fundo"
                            value={!showBg}
                            onChange={(v) => setShowBg(!v)}
                            icon={ImageIcon}
                        />
                    </div>
                </div>
            </EditorSection>

            <EditorActionButton 
                onClick={handleAction} 
                isLoading={isPending} 
                disabled={!url && !block?.id}
                label={block?.id ? t('common.close') : t('editors.social.deploy')}
            />
        </div>
    )
}
