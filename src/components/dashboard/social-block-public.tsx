"use client"

import { cn } from "@/lib/utils"
import { useViewportScale } from "@/lib/canvas-scale"
import {
    Instagram, Twitter, Github, Linkedin, Youtube,
    Link as LinkIcon
} from "lucide-react"
import {
    DiscordIcon, TikTokIcon, SteamIcon,
    SpotifyIcon, TwitchIcon, PinterestIcon
} from "../icons"

const ICONS: Record<string, any> = {
    instagram: Instagram,
    twitter: Twitter,
    discord: DiscordIcon,
    tiktok: TikTokIcon,
    steam: SteamIcon,
    spotify: SpotifyIcon,
    twitch: TwitchIcon,
    pinterest: PinterestIcon,
    github: Github,
    linkedin: Linkedin,
    youtube: Youtube,
    custom: LinkIcon
}

const PLATFORM_COLORS: Record<string, string> = {
    instagram: '#E4405F',
    twitter: '#1DA1F2',
    discord: '#5865F2',
    tiktok: '#ffffff',
    steam: '#171a21',
    spotify: '#1DB954',
    twitch: '#9146FF',
    pinterest: '#E60023',
    github: '#ffffff',
    linkedin: '#0A66C2',
    youtube: '#FF0000',
    custom: '#999999'
}

interface SocialBlockPublicProps {
    content: {
        platform: string
        label: string
        subLabel?: string
        url: string
        style: 'tag' | 'glass' | 'minimal' | 'neon' | 'pill' | 'brutalist' | 'ghost' | 'clay' | 'retro' | 'aura'
        isGrid?: boolean
        showBg?: boolean
    }
    isPublic?: boolean
}

export function SocialBlockPublic({ content, isPublic = false }: SocialBlockPublicProps) {
    const Icon = ICONS[content.platform] || LinkIcon
    const scale = useViewportScale()
    const platformColor = PLATFORM_COLORS[content.platform] || '#ffffff'

    return (
        <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => !isPublic && e.preventDefault()}
            className={cn(
                "flex items-center w-full h-full transition-all duration-300 shadow-none overflow-hidden group",
                content.isGrid ? "justify-center" : "justify-start",
                !isPublic && "pointer-events-none",
                content.showBg !== false && [
                    "border border-black/10 dark:border-white/10 bg-white/5 dark:bg-zinc-950/50",
                    content.style !== 'ghost' && "backdrop-blur-sm",
                    // Old Styles
                    content.style === 'tag' && "bg-[#fefefe] dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 border-l-black dark:border-l-white font-serif italic hover:translate-x-1",
                    content.style === 'glass' && "bg-white/10 dark:bg-white/5 rounded-none border border-white/20 text-current hover:bg-white/20 hover:scale-[1.05]",
                    content.style === 'minimal' && "bg-transparent text-current shadow-none hover:opacity-70",
                    content.style === 'neon' && "bg-black text-green-400 rounded-none border border-green-500/50 hover:bg-zinc-900",
                    // New Architectural Styles
                    content.style === 'pill' && "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-black/5 dark:border-white/5 !rounded-full hover:scale-x-[0.98] hover:scale-y-[1.02]",
                    content.style === 'brutalist' && "bg-[#e8fa55] dark:bg-[#c9ff00] text-black border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] !rounded-none hover:translate-y-[4px] hover:translate-x-[4px] hover:shadow-none hover:bg-white",
                    content.style === 'ghost' && "bg-transparent border-transparent text-current shadow-none hover:bg-black/5 dark:hover:bg-white/5 backdrop-blur-sm",
                    content.style === 'clay' && "bg-[#E0E5EC] dark:bg-[#1a1b1e] text-zinc-600 dark:text-zinc-300 border-transparent shadow-[inset_2px_2px_5px_rgba(255,255,255,0.8),inset_-3px_-3px_7px_rgba(0,0,0,0.1),4px_4px_10px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_2px_2px_rgba(255,255,255,0.05),inset_-2px_-2px_4px_rgba(0,0,0,0.3),4px_4px_10px_rgba(0,0,0,0.5)] !rounded-2xl hover:scale-[1.03] hover:-rotate-1",
                    content.style === 'retro' && "bg-[#c0c0c0] text-black border-[3px] border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] !rounded-none hover:border-t-[#808080] hover:border-l-[#808080] hover:border-b-[#ffffff] hover:border-r-[#ffffff] active:bg-[#a0a0a0]",
                    content.style === 'aura' && "text-white border border-white/10 !rounded-xl transition-shadow hover:shadow-[0_0_20px_var(--aura-color)] hover:border-[var(--aura-color)]",
                ],
                content.showBg === false && [
                    "bg-transparent border-transparent text-current",
                    content.style === 'tag' && "font-serif italic hover:translate-x-1",
                    content.style === 'glass' && "hover:scale-[1.05] hover:opacity-80",
                    content.style === 'minimal' && "hover:opacity-70",
                    content.style === 'neon' && "text-green-400 hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]",
                    content.style === 'pill' && "hover:scale-x-[0.98] hover:scale-y-[1.02]",
                    content.style === 'brutalist' && "hover:translate-y-[2px] hover:translate-x-[2px]",
                    content.style === 'ghost' && "hover:opacity-60",
                    content.style === 'clay' && "hover:scale-[1.03] hover:-rotate-1 text-zinc-800 dark:text-zinc-300",
                    content.style === 'retro' && "hover:opacity-70",
                    content.style === 'aura' && "text-white hover:drop-shadow-[0_0_15px_var(--aura-color)]",
                ],

                // Grid specific padding overrides
                content.isGrid && "!p-0 aspect-square"
            )}
            style={{
                gap: content.isGrid ? 0 : Math.round(20 * scale),
                padding: content.isGrid ? `${Math.round(16 * scale)}px` : `${Math.round(8 * scale)}px ${Math.round(16 * scale)}px`,
                borderLeftWidth: content.style === 'tag' && !content.isGrid && content.showBg !== false ? Math.round(6 * scale) : undefined,
                borderRadius: content.style === 'tag' ? Math.round(2 * scale) : undefined,
                // Pass dynamic color for Social Aura hover effect
                '--aura-color': platformColor,
                backgroundColor: content.style === 'aura' && content.showBg !== false ? `color-mix(in srgb, ${platformColor} 5%, #09090b)` : undefined,
            } as React.CSSProperties}
        >
            <div className={cn(
                "flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                content.showBg !== false && [
                    content.style === 'minimal' && "bg-transparent text-current !rounded-none",
                    content.style === 'pill' && "bg-zinc-100 dark:bg-white/10 !rounded-full",
                    content.style === 'ghost' && "bg-transparent",
                    content.style === 'retro' && "bg-transparent",
                    content.style === 'brutalist' && "bg-black text-white !rounded-none",
                    content.style === 'clay' && "bg-transparent",
                    !['minimal', 'pill', 'ghost', 'retro', 'brutalist', 'clay'].includes(content.style) && "bg-black/5 dark:bg-white/5 !rounded-none",
                ],
                content.isGrid && "w-full h-full !bg-transparent"
            )} style={content.isGrid ? {} : { width: Math.round(32 * scale), height: Math.round(32 * scale) }}>
                <Icon style={{
                    width: content.isGrid ? '100%' : Math.round(16 * scale),
                    height: content.isGrid ? '100%' : Math.round(16 * scale),
                    maxWidth: content.isGrid ? Math.round(32 * scale) : undefined,
                    maxHeight: content.isGrid ? Math.round(32 * scale) : undefined
                }} />
            </div>
            {!content.isGrid && (
                <div className="flex flex-col min-w-0" style={{ gap: Math.round(2 * scale) }}>
                    <span className={cn(
                        "font-bold truncate leading-none",
                        content.style === 'minimal' && "uppercase tracking-[0.3em]",
                        content.style === 'retro' && "font-mono uppercase tracking-tighter"
                    )} style={{ fontSize: content.style === 'minimal' ? Math.round(10 * scale) : Math.round(14 * scale) }}>
                        {content.label}
                    </span>
                    {content.subLabel && (
                        <span className={cn(
                            "truncate opacity-60 leading-none",
                            content.style === 'minimal' && "uppercase tracking-widest",
                            content.style === 'retro' && "font-mono"
                        )} style={{ fontSize: Math.round(10 * scale) }}>
                            {content.subLabel}
                        </span>
                    )}
                </div>
            )}
        </a>
    )
}
