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
import dynamic from "next/dynamic"

// Modularized Public Blocks - Static (Critical for LCP/CLS)
import { TextBlockPublic } from "./text-block-public"
import { PhotoBlockPublic } from "./photo-block-public"
import { QuoteBlockPublic } from "./quote-block-public"
import { TickerBlockPublic } from "./ticker-block-public"
import { SubtitleBlockPublic } from "./subtitle-block-public"
import { FloatingBlockPublic } from "./floating-block-public"
import { CountdownBlockPublic } from "./countdown-block-public"
import { MoodStatusBlockPublic } from "./mood-status-block-public"

// Dynamic Imports (Heavy/Interactive Blocks)
const VideoBlockPublic = dynamic(() => import("./video-block-public").then(mod => mod.VideoBlockPublic), {
    loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
})
const MusicBlockPublic = dynamic(() => import("./music-block-public").then(mod => mod.MusicBlockPublic), {
    loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
})
const GuestbookBlock = dynamic(() => import("./guestbook-block").then(mod => mod.GuestbookBlock), {
    loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
})
const WeatherBlockPublic = dynamic(() => import("./weather-block-public").then(mod => mod.WeatherBlockPublic))
const MediaBlockPublic = dynamic(() => import("./media-block-public").then(mod => mod.MediaBlockPublic))
const SocialBlockPublic = dynamic(() => import("./social-block-public").then(mod => mod.SocialBlockPublic))

import { MoodBlock } from "@/types/database"
import { BlockErrorBoundary } from "./block-error-boundary"

interface BlockRendererProps {
    block: MoodBlock
    isPublic?: boolean
}

export function BlockRenderer({ block, isPublic = false }: BlockRendererProps) {
    return (
        <BlockErrorBoundary blockType={block.type}>
            <BlockRendererInner block={block} isPublic={isPublic} />
        </BlockErrorBoundary>
    );
}

function BlockRendererInner({ block, isPublic = false }: BlockRendererProps) {
    const content = block.content as any

    switch (block.type) {
        case 'text':
            return <TextBlockPublic content={content} />

        case 'gif':
            return (
                <div className="w-full h-full p-1 bg-white/5 dark:bg-zinc-950/50 backdrop-blur-sm rounded-none border border-black/10 dark:border-white/10 shadow-none flex items-center justify-center overflow-hidden">
                    <img src={content.url} alt="gif" className="rounded-none w-full h-full object-cover" />
                </div>
            )

        case 'tape':
            return (
                <div
                    className="w-full h-full shadow-none border border-black/5 backdrop-blur-[2px]"
                    style={{
                        backgroundColor: content.color,
                        backgroundImage: content.pattern === 'dots' ? 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)' : 'none',
                        backgroundSize: '4px 4px',
                        clipPath: 'polygon(2% 0%, 98% 2%, 100% 100%, 0% 98%)'
                    }}
                />
            )

        case 'weather':
            return <WeatherBlockPublic content={content} />

        case 'media':
            return <MediaBlockPublic content={content} isPublic={isPublic} />

        case 'doodle':
            return (
                <img
                    src={content.image}
                    alt="doodle"
                    className="w-full h-full object-contain pointer-events-none drop-shadow-none"
                />
            )

        case 'social':
            return <SocialBlockPublic content={content} isPublic={isPublic} />

        case 'music':
            return <MusicBlockPublic content={content} isPublic={isPublic} />

        case 'video':
            return <VideoBlockPublic content={content} isPublic={isPublic} />

        case 'ticker':
            return <TickerBlockPublic content={content} />

        case 'subtitle':
            return <SubtitleBlockPublic content={content} />

        case 'floating':
            return <FloatingBlockPublic content={content} />

        case 'guestbook':
            return (
                <div className="w-full h-full min-h-0 flex flex-col">
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
