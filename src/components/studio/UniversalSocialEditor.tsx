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
    Image as ImageIcon,
    Globe,
    Sparkles,
    LayoutList,
    Box,
    Ghost,
    Wand2,
    Loader2
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { DiscordIcon, TikTokIcon, SpotifyIcon, TwitchIcon, PinterestIcon, SteamIcon, RobloxIcon, VRChatIcon, RiotGamesIcon, LOLIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useTranslation } from "@/i18n/context"

const PLATFORMS: { id: string; icon: React.ComponentType<any>; label: string; color: string }[] = [
    { id: 'instagram', icon: Instagram, label: 'Instagram', color: '#E4405F' },
    { id: 'twitter', icon: Twitter, label: 'Twitter/X', color: '#000000' },
    { id: 'discord', icon: DiscordIcon, label: 'Discord', color: '#5865F2' },
    { id: 'tiktok', icon: TikTokIcon, label: 'TikTok', color: '#000000' },
    { id: 'steam', icon: SteamIcon, label: 'Steam', color: '#171a21' },
    { id: 'spotify', icon: SpotifyIcon, label: 'Spotify', color: '#1DB954' },
    { id: 'twitch', icon: TwitchIcon, label: 'Twitch', color: '#9146FF' },
    { id: 'pinterest', icon: PinterestIcon, label: 'Pinterest', color: '#E60023' },
    { id: 'github', icon: Github, label: 'GitHub', color: '#333' },
    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: '#0A66C2' },
    { id: 'youtube', icon: Youtube, label: 'YouTube', color: '#FF0000' },
    { id: 'roblox', icon: RobloxIcon, label: 'Roblox', color: '#000000' },
    { id: 'vrchat', icon: VRChatIcon, label: 'VRChat', color: '#000000' },
    { id: 'riot', icon: RiotGamesIcon, label: 'Riot Games', color: '#D32936' },
    { id: 'lol', icon: LOLIcon, label: 'League of Legends', color: '#C89B3C' },
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
    { id: 'aura', label: 'aura' },
    { id: 'native', label: 'native' }
]

import { MoodBlock, SocialContent } from "@/types/database"
import { EditorHeader, EditorSection, GridSelector, EditorActionButton, PillSelector, EditorSwitch, ListSelector } from "./EditorUI"
import { fetchLinkMetadata } from "@/actions/link-metadata"

type TabType = 'connection' | 'esthetics'

export function UniversalSocialEditor({
    block,
    onUpdate,
    onAdd,
    onClose,
    highlight
}: {
    block?: MoodBlock | null,
    onUpdate?: (updates: Partial<MoodBlock>) => void,
    onAdd?: (content: SocialContent) => Promise<void>,
    onClose?: () => void,
    highlight?: boolean
}) {
    const { t } = useTranslation()
    const content = block?.content as SocialContent | undefined
    const initialPlatform = PLATFORMS.find(p => p.id === content?.platform) || PLATFORMS[0]
    
    let initialLayout: 'classic' | 'bento' | 'floating' = 'classic'
    if (content?.isGrid && content?.showBg !== false) initialLayout = 'bento'
    if (content?.showBg === false) initialLayout = 'floating'

    const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform)
    const [url, setUrl] = useState(content?.url || "")
    const [label, setLabel] = useState(content?.label || "")
    const [style, setStyle] = useState(content?.style || 'tag')
    const [subLabel, setSubLabel] = useState(content?.subLabel || "")
    const [layoutMode, setLayoutMode] = useState<'classic' | 'bento' | 'floating'>(initialLayout)
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState<TabType>('connection')
    const [isFetchingMeta, setIsFetchingMeta] = useState(false)

    const handleAutoFetch = async () => {
        if (!url) return
        setIsFetchingMeta(true)
        
        try {
            let detectedPlatform = selectedPlatform.id
            let newLabel = label
            
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
            const hostname = urlObj.hostname.toLowerCase()
            const pathname = urlObj.pathname
            
            if (hostname.includes('instagram.com')) detectedPlatform = 'instagram'
            else if (hostname.includes('twitter.com') || hostname.includes('x.com')) detectedPlatform = 'twitter'
            else if (hostname.includes('discord.gg') || hostname.includes('discord.com')) detectedPlatform = 'discord'
            else if (hostname.includes('tiktok.com')) detectedPlatform = 'tiktok'
            else if (hostname.includes('steamcommunity.com') || hostname.includes('store.steampowered.com')) detectedPlatform = 'steam'
            else if (hostname.includes('spotify.com')) detectedPlatform = 'spotify'
            else if (hostname.includes('twitch.tv')) detectedPlatform = 'twitch'
            else if (hostname.includes('pinterest.com')) detectedPlatform = 'pinterest'
            else if (hostname.includes('github.com')) detectedPlatform = 'github'
            else if (hostname.includes('linkedin.com')) detectedPlatform = 'linkedin'
            else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) detectedPlatform = 'youtube'
            else if (hostname.includes('roblox.com')) detectedPlatform = 'roblox'
            else detectedPlatform = 'custom'
            
            const p = PLATFORMS.find(platform => platform.id === detectedPlatform)
            if (p) setSelectedPlatform(p)
            
            if (!newLabel) {
                const pathParts = pathname.split('/').filter(Boolean)
                if (detectedPlatform === 'instagram' && pathParts[0]) newLabel = `@${pathParts[0]}`
                else if (detectedPlatform === 'twitter' && pathParts[0]) newLabel = `@${pathParts[0]}`
                else if (detectedPlatform === 'github' && pathParts[0]) newLabel = pathParts[0]
                else if (detectedPlatform === 'twitch' && pathParts[0]) newLabel = pathParts[0]
                else if (detectedPlatform === 'discord' && hostname.includes('discord.gg') && pathParts[0]) newLabel = 'Join Server'
                else {
                    const res = await fetchLinkMetadata(url.startsWith('http') ? url : `https://${url}`)
                    if (res.success && res.title) {
                        newLabel = res.title
                    }
                }
                if (newLabel) setLabel(newLabel)
            }
            
            toast.success("Dados extraídos com sucesso!")
        } catch(e) {
            toast.error("URL inválida ou erro na busca")
        } finally {
            setIsFetchingMeta(false)
        }
    }

    // URL formatter helper
    const formatUrl = (rawUrl: string) => {
        if (!rawUrl) return rawUrl
        // Ignore if it already has a protocol, or if it's a mailto/tel link
        if (/^(https?:\/\/|mailto:|tel:)/i.test(rawUrl.trim())) {
            return rawUrl.trim()
        }
        return `https://${rawUrl.trim()}`
    }

    // 2. Real-time Preview
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const isGrid = layoutMode === 'bento'
        const showBg = layoutMode !== 'floating'

        const updates = {
            platform: selectedPlatform.id,
            url: formatUrl(url),
            label: label || selectedPlatform.label,
            subLabel,
            style,
            isGrid,
            showBg
        }

        // Deep check to prevent infinite loops
        const currentContent = block.content as SocialContent || {}
        const hasChanged = Object.entries(updates).some(([key, value]) => {
            return (currentContent as unknown as Record<string, unknown>)[key] !== value
        })

        if (hasChanged) {
            onUpdate({ content: updates as SocialContent })
        }
    }, [selectedPlatform, url, label, subLabel, style, layoutMode, block?.id, onUpdate, block?.content])

    const handleAction = () => {
        if (!url && !label && !block?.id) return

        startTransition(async () => {
            const isGrid = layoutMode === 'bento'
            const showBg = layoutMode !== 'floating'

            const content = {
                platform: selectedPlatform.id,
                url: formatUrl(url),
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
                if (onClose) onClose()
            } else {
                const initialWidth = layoutMode === 'bento' ? 50 : 150
                const initialHeight = layoutMode === 'bento' ? 50 : 45

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
    const getPlatformLabels = (platformId: string) => {
        switch (platformId) {
            case 'discord':
                return {
                    urlLabel: 'Link do Servidor (Opcional)',
                    urlPlaceholder: 'https://discord.gg/...',
                    textLabel: 'Discord Tag / Username',
                    textPlaceholder: 'ex: maikon#1234'
                }
            case 'riot':
            case 'lol':
                return {
                    urlLabel: 'Link (Opcional - Deixe Vazio)',
                    urlPlaceholder: 'Deixe vazio para botão de copiar...',
                    textLabel: 'Riot ID (Nome#Tag)',
                    textPlaceholder: 'ex: Faker#KR1'
                }
            case 'steam':
                return {
                    urlLabel: 'URL do Perfil (Opcional)',
                    urlPlaceholder: 'https://steamcommunity.com/id/...',
                    textLabel: 'Steam ID ou Nickname',
                    textPlaceholder: 'ex: 123456789'
                }
            case 'vrchat':
            case 'roblox':
                return {
                    urlLabel: 'URL do Perfil (Opcional)',
                    urlPlaceholder: 'Deixe vazio para botão de copiar...',
                    textLabel: 'Username',
                    textPlaceholder: 'ex: Jogador123'
                }
            case 'instagram':
            case 'twitter':
            case 'tiktok':
                return {
                    urlLabel: 'URL do Perfil',
                    urlPlaceholder: 'https://...',
                    textLabel: 'Username (@)',
                    textPlaceholder: 'ex: @username'
                }
            case 'custom':
                return {
                    urlLabel: 'Link Externo',
                    urlPlaceholder: 'https://...',
                    textLabel: 'Texto do Botão',
                    textPlaceholder: 'ex: Meu Portfólio'
                }
            default:
                return {
                    urlLabel: 'Link / URL',
                    urlPlaceholder: 'https://...',
                    textLabel: 'Nome / Label',
                    textPlaceholder: 'ex: Meu Canal'
                }
        }
    }

    const platformUI = getPlatformLabels(selectedPlatform.id)

    return (
        <div className={cn(
            "space-y-12 pb-20",
            highlight ? "p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800" : ""
        )}>
            <EditorHeader 
                title={block ? t('editors.social.edit_title') || "Editar Link" : t('editors.social.add_title')} 
                subtitle={t('editors.social.subtitle')}
                onClose={onClose}
            />

            <PillSelector
                options={[
                    { id: 'connection', label: "Conexão", icon: Globe },
                    { id: 'esthetics', label: "Estética", icon: Sparkles },
                ]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as TabType)}
                variant="ghost"
            />

            {activeTab === 'connection' ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title={t('editors.social.nodes') || "Plataforma"}>
                        <GridSelector
                            options={PLATFORMS.map(p => ({ id: p.id, label: p.label, icon: p.icon, color: p.color }))}
                            activeId={selectedPlatform.id}
                            onChange={(id) => {
                                const p = PLATFORMS.find(platform => platform.id === id)
                                if (p) setSelectedPlatform(p)
                            }}
                            columns={5}
                            variant="ghost"
                            id="social-platforms"
                        />
                    </EditorSection>

                    <EditorSection title="Configurações do Link">
                        <div className="space-y-6 px-1">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 px-1">
                                    {platformUI.urlLabel}
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center transition-all group-focus-within:scale-110 group-focus-within:text-blue-500">
                                        <LinkIcon className="w-4 h-4" />
                                    </div>
                                    <Input
                                        placeholder={platformUI.urlPlaceholder}
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none rounded-2xl pl-16 pr-12 h-14 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-blue-500/20"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleAutoFetch}
                                        disabled={!url || isFetchingMeta}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 transition-colors text-zinc-400 hover:text-blue-500"
                                        title="Preencher automaticamente"
                                    >
                                        {isFetchingMeta ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 px-1">
                                        {platformUI.textLabel}
                                    </Label>
                                    <Input
                                        placeholder={platformUI.textPlaceholder}
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                        className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none rounded-2xl h-14 text-[13px] font-medium px-4 focus-visible:ring-1 focus-visible:ring-blue-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 px-1">{t('editors.social.sub_label') || 'Sub-label'}</Label>
                                    <Input
                                        placeholder={t('editors.social.sub_label_placeholder') || 'Secundário'}
                                        value={subLabel}
                                        onChange={(e) => setSubLabel(e.target.value)}
                                        className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none rounded-2xl h-14 text-[13px] font-medium px-4 focus-visible:ring-1 focus-visible:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </EditorSection>
                </div>
            ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <EditorSection title="Modo de Exibição (Layout)">
                        <GridSelector
                            options={[
                                { id: 'classic', label: 'Lista Clássica', icon: LayoutList },
                                { id: 'bento', label: t('editors.social.layout_bento') || 'Bento Box', icon: Box },
                                { id: 'floating', label: t('editors.social.layout_borderless') || 'Flutuante', icon: Ghost }
                            ]}
                            activeId={layoutMode}
                            onChange={(id) => setLayoutMode(id as 'classic' | 'bento' | 'floating')}
                            columns={3}
                            variant="ghost"
                            id="social-layouts"
                        />
                    </EditorSection>

                    <EditorSection title={t('editors.social.style_manifesto') || "Estilo do Botão"}>
                        <ListSelector
                            options={STYLES.map(s => ({ 
                                id: s.id as any, 
                                label: t(`editors.social.styles.${s.id}`) || s.label 
                            }))}
                            activeId={style}
                            onChange={(id) => setStyle(id as string)}
                        />
                    </EditorSection>
                </div>
            )}

            <EditorActionButton 
                onClick={handleAction} 
                isLoading={isPending} 
                disabled={!url && !label && !block?.id}
                label={block?.id ? t('common.close') : t('editors.social.deploy')}
            />
        </div>
    )
}
