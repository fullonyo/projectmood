"use client"

import { cn } from "@/lib/utils"
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

    return (
        <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => !isPublic && e.preventDefault()}
            className={cn(
                "flex items-center justify-center gap-3 px-4 py-2.5 w-full h-full transition-all duration-300 shadow-none border border-black/10 dark:border-white/10 group bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm overflow-hidden",
                !isPublic && "pointer-events-none",
                content.style === 'tag' && "bg-[#fefefe] dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-[2px] border border-zinc-200 dark:border-zinc-700 border-l-[6px] border-l-black dark:border-l-white font-serif italic hover:translate-x-1",
                content.style === 'glass' && "bg-white/10 dark:bg-white/5 rounded-none border border-white/20 text-current hover:bg-white/20 hover:scale-[1.05]",
                content.style === 'minimal' && "bg-white dark:bg-zinc-950 border border-black dark:border-white rounded-none",
                content.style === 'neon' && "bg-black text-green-400 rounded-none border border-green-500/50 hover:bg-zinc-900"
            )}
        >
            <div className={cn(
                "w-8 h-8 rounded-none flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                content.style === 'minimal' ? "bg-black text-white dark:bg-white dark:text-black shadow-none border border-black dark:border-white" : "bg-black/5 dark:bg-white/5"
            )}>
                <Icon className="w-4 h-4" />
            </div>
            <span className={cn(
                "text-sm font-bold truncate",
                content.style === 'minimal' && "uppercase tracking-[0.3em] text-[10px]"
            )}>
                {content.label}
            </span>
        </a>
    )
}
