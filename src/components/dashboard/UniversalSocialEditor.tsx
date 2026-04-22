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
    Ghost
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { DiscordIcon, TikTokIcon, SpotifyIcon, TwitchIcon, PinterestIcon, SteamIcon, RobloxIcon, VRChatIcon, RiotGamesIcon, LOLIcon } from "@/components/icons"
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
    { id: 'aura', label: 'aura' }
]

import { MoodBlock, SocialContent } from "@/types/database"
import { EditorHeader, EditorSection, GridSelector, EditorActionButton, PillSelector, EditorSwitch, ListSelector } from "./EditorUI"

type TabType = 'connection' | 'esthetics'

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

    // 2. Real-time Preview
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const isGrid = layoutMode === 'bento'
        const showBg = layoutMode !== 'floating'

        const updates = {
            platform: selectedPlatform.id,
            url,
            label: label || selectedPlatform.label,
            subLabel,
            style,
            isGrid,
            showBg
        }

        // Deep check to prevent infinite loops
        const currentContent = block.content as any || {}
        const hasChanged = Object.entries(updates).some(([key, value]) => {
            return currentContent[key] !== value
        })

        if (hasChanged) {
            onUpdate(block.id, { content: updates })
        }
    }, [selectedPlatform, url, label, subLabel, style, layoutMode, block?.id, onUpdate, block?.content])

    const handleAction = () => {
        if (!url && !label && !block?.id) return

        startTransition(async () => {
            const isGrid = layoutMode === 'bento'
            const showBg = layoutMode !== 'floating'

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
                            options={PLATFORMS.map(p => ({ id: p.id as any, label: p.label, icon: p.icon, color: p.color }))}
                            activeId={selectedPlatform.id as any}
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
                                    {selectedPlatform.id === 'discord' ? 'Link de Convite (Opcional)' : (t('editors.social.link_protocol') || 'Link / URL')}
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center transition-all group-focus-within:scale-110 group-focus-within:text-blue-500">
                                        <LinkIcon className="w-4 h-4" />
                                    </div>
                                    <Input
                                        placeholder={selectedPlatform.id === 'discord' ? 'https://discord.gg/...' : (t('editors.social.link_placeholder') || 'https://...')}
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none rounded-2xl pl-16 h-14 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 px-1">
                                        {selectedPlatform.id === 'discord' ? 'Username' : (t('editors.social.visual_alias') || 'Label')}
                                    </Label>
                                    <Input
                                        placeholder={selectedPlatform.id === 'discord' ? 'ex: login.jsx' : (t('editors.social.alias_placeholder') || 'Texto do botão')}
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
                            onChange={(id) => setLayoutMode(id as any)}
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
                            activeId={style as any}
                            onChange={(id) => setStyle(id as any)}
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
