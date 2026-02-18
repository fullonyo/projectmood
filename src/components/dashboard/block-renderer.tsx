"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
    Instagram, Twitter, Github, Linkedin, Youtube,
    Link as LinkIcon, Music, Video
} from "lucide-react"
import {
    DiscordIcon, TikTokIcon, SteamIcon,
    SpotifyIcon, TwitchIcon, PinterestIcon
} from "../icons"

// Modularized Public Blocks
import { TickerBlockPublic } from "./ticker-block-public"
import { SubtitleBlockPublic } from "./subtitle-block-public"
import { FloatingBlockPublic } from "./floating-block-public"
import { QuoteBlockPublic } from "./quote-block-public"
import { PhotoBlockPublic } from "./photo-block-public"
import { MoodStatusBlockPublic } from "./mood-status-block-public"
import { CountdownBlockPublic } from "./countdown-block-public"
import { GuestbookBlock } from "./guestbook-block"

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

interface BlockRendererProps {
    block: any
    isPublic?: boolean
}

export function BlockRenderer({ block, isPublic = false }: BlockRendererProps) {
    const content = block.content as any

    switch (block.type) {
        case 'text':
            return (
                <div
                    className={cn(
                        "p-6 shadow-2xl transition-all duration-300 min-w-[220px] max-w-[450px]",
                        content.style === 'postit' && "bg-[#ffff88] text-zinc-900 rotate-[-1deg] shadow-yellow-900/20 rounded-sm border-b-[20px] border-b-black/5",
                        content.style === 'ripped' && "bg-white text-zinc-900 shadow-zinc-300/80",
                        content.style === 'typewriter' && "bg-transparent border-2 border-dashed border-current rounded-none",
                        content.style === 'simple' && "bg-white/10 dark:bg-zinc-900/10 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl"
                    )}
                    style={{
                        backgroundColor: content.bgColor,
                        clipPath: content.style === 'ripped' ? 'polygon(0% 2%, 98% 0%, 100% 100%, 2% 98%, 0% 50%)' : 'none',
                        textAlign: content.align || 'center'
                    }}
                >
                    <p className={cn(
                        "leading-relaxed transition-all",
                        content.fontSize === 'sm' && "text-base",
                        content.fontSize === 'xl' && "text-3xl font-serif italic",
                        content.fontSize === '3xl' && "text-5xl font-black tracking-tighter font-mono uppercase",
                        content.style === 'typewriter' && "font-mono underline decoration-dotted"
                    )}>
                        {content.text}
                    </p>
                </div>
            )

        case 'gif':
            return (
                <div className="p-1 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/10">
                    <img src={content.url} alt="gif" className="rounded-xl w-48 h-auto" />
                </div>
            )

        case 'tape':
            return (
                <div
                    className="w-32 h-8 shadow-sm backdrop-blur-[2px]"
                    style={{
                        backgroundColor: content.color,
                        backgroundImage: content.pattern === 'dots' ? 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)' : 'none',
                        backgroundSize: '4px 4px',
                        clipPath: 'polygon(2% 0%, 98% 2%, 100% 100%, 0% 98%)'
                    }}
                />
            )

        case 'weather':
            return (
                <div className="p-6 bg-white/10 dark:bg-zinc-900/10 backdrop-blur-3xl border border-white/10 rounded-sm shadow-sm min-w-[180px] text-center space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Current Mood</p>
                    <p className="text-xl font-serif italic">{content.vibe}</p>
                    <div className="h-[1px] w-6 bg-current mx-auto opacity-10" />
                    <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">{content.location}</p>
                </div>
            )

        case 'media':
            return (
                <div className={cn(
                    "p-4 py-8 min-w-[140px] max-w-[200px] shadow-2xl relative transition-transform",
                    content.category === 'book' ? "bg-[#f5f5dc] text-zinc-900 rounded-r-md border-l-[6px] border-zinc-400" : "bg-black text-white rounded-md border-2 border-zinc-800"
                )}>
                    <div className="absolute top-2 left-3 text-[8px] opacity-30 uppercase font-black">
                        {content.category}
                    </div>
                    <p className="text-sm font-black text-center mt-2 leading-tight uppercase font-mono tracking-tighter">
                        {content.title}
                    </p>
                    <div className="mt-6 pt-6 border-t border-zinc-500/10 text-[10px] italic text-center opacity-60">
                        {content.review}
                    </div>
                </div>
            )

        case 'doodle':
            return (
                <img
                    src={content.image}
                    alt="doodle"
                    className="w-48 h-auto dark:invert contrast-125 brightness-110 pointer-events-none"
                />
            )

        case 'social':
            const Icon = ICONS[content.platform] || LinkIcon
            return (
                <div className={cn(
                    "flex items-center gap-3 px-4 py-2.5 transition-all duration-300 shadow-xl min-w-[160px]",
                    content.style === 'tag' && "bg-[#fefefe] dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-[2px] border border-zinc-200 dark:border-zinc-700 border-l-[6px] border-l-black dark:border-l-white font-serif italic",
                    content.style === 'glass' && "bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 text-current hover:bg-white/20",
                    content.style === 'minimal' && "bg-transparent text-current font-black tracking-tighter text-xl",
                    content.style === 'neon' && "bg-black text-green-400 rounded-full border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                )}>
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        content.style === 'minimal' ? "bg-black text-white dark:bg-white dark:text-black shadow-lg" : "bg-zinc-100 dark:bg-zinc-700/50"
                    )}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className={cn(
                        "text-sm font-bold truncate",
                        content.style === 'minimal' && "uppercase tracking-[0.3em] text-[10px]"
                    )}>
                        {content.label}
                    </span>
                </div>
            )

        case 'music':
            return (
                <div className="w-full max-w-[320px] p-2 bg-zinc-950 rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">
                    <iframe
                        src={`https://open.spotify.com/embed/track/${content.trackId}`}
                        width="100%" height="80" frameBorder="0" allow="encrypted-media"
                        className="rounded-2xl pointer-events-none opacity-90"
                    />
                </div>
            )

        case 'video':
            return (
                <div className="w-full max-w-[400px] aspect-video bg-black rounded-3xl shadow-2xl overflow-hidden border border-white/10">
                    <iframe
                        src={`https://www.youtube.com/embed/${content.videoId}?autoplay=${isPublic ? '0' : '1'}&loop=1&playlist=${content.videoId}&controls=1&rel=0`}
                        width="100%" height="100%" frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="opacity-90"
                    />
                </div>
            )

        case 'ticker':
            return <TickerBlockPublic content={content} />

        case 'subtitle':
            return <SubtitleBlockPublic content={content} />

        case 'floating':
            return <FloatingBlockPublic content={content} />

        case 'guestbook':
            return (
                <div className="w-full max-w-[350px] h-full min-h-[400px]">
                    <GuestbookBlock block={block} isPublic={isPublic} />
                </div>
            )

        case 'quote':
            return <QuoteBlockPublic content={content} />

        case 'photo':
            return <PhotoBlockPublic content={content} />

        case 'moodStatus':
            return <MoodStatusBlockPublic content={content} />

        case 'countdown':
            return <CountdownBlockPublic content={content} />

        default:
            return <div className="p-4 bg-red-500/10 text-red-500 text-[10px] uppercase font-black">Unknown Block Type: {block.type}</div>
    }
}
