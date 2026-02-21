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

interface SocialBlockPublicProps {
    content: {
        platform: string
        label: string
        url: string
        style: 'tag' | 'glass' | 'minimal' | 'neon'
    }
    isPublic?: boolean
}

export function SocialBlockPublic({ content, isPublic = false }: SocialBlockPublicProps) {
    const Icon = ICONS[content.platform] || LinkIcon
    const scale = useViewportScale()

    return (
        <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => !isPublic && e.preventDefault()}
            className={cn(
                "flex items-center justify-center w-full h-full transition-all duration-300 shadow-none border border-black/10 dark:border-white/10 group bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm overflow-hidden",
                !isPublic && "pointer-events-none",
                content.style === 'tag' && "bg-[#fefefe] dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 border-l-black dark:border-l-white font-serif italic hover:translate-x-1",
                content.style === 'glass' && "bg-white/10 dark:bg-white/5 rounded-none border border-white/20 text-current hover:bg-white/20 hover:scale-[1.05]",
                content.style === 'minimal' && "bg-white dark:bg-zinc-950 border border-black dark:border-white rounded-none",
                content.style === 'neon' && "bg-black text-green-400 rounded-none border border-green-500/50 hover:bg-zinc-900"
            )}
            style={{
                gap: Math.round(12 * scale),
                padding: `${Math.round(10 * scale)}px ${Math.round(16 * scale)}px`,
                borderLeftWidth: content.style === 'tag' ? Math.round(6 * scale) : undefined,
                borderRadius: content.style === 'tag' ? Math.round(2 * scale) : undefined
            }}
        >
            <div className={cn(
                "rounded-none flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                content.style === 'minimal' ? "bg-black text-white dark:bg-white dark:text-black shadow-none border border-black dark:border-white" : "bg-black/5 dark:bg-white/5"
            )} style={{ width: Math.round(32 * scale), height: Math.round(32 * scale) }}>
                <Icon style={{ width: Math.round(16 * scale), height: Math.round(16 * scale) }} />
            </div>
            <span className={cn(
                "font-bold truncate",
                content.style === 'minimal' && "uppercase tracking-[0.3em]"
            )} style={{ fontSize: content.style === 'minimal' ? Math.round(10 * scale) : Math.round(14 * scale) }}>
                {content.label}
            </span>
        </a>
    )
}
