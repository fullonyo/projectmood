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
import { TextBlockPublic } from "./text-block-public"
import { SocialBlockPublic } from "./social-block-public"
import { WeatherBlockPublic } from "./weather-block-public"
import { MediaBlockPublic } from "./media-block-public"
import { VideoBlockPublic } from "./video-block-public"
import { MusicBlockPublic } from "./music-block-public"

interface BlockRendererProps {
    block: any
    isPublic?: boolean
}

export function BlockRenderer({ block, isPublic = false }: BlockRendererProps) {
    const content = block.content as any

    switch (block.type) {
        case 'text':
            return <TextBlockPublic content={content} />

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
            return <WeatherBlockPublic content={content} />

        case 'media':
            return <MediaBlockPublic content={content} />

        case 'doodle':
            return (
                <img
                    src={content.image}
                    alt="doodle"
                    className="w-48 h-auto dark:invert contrast-125 brightness-110 pointer-events-none drop-shadow-xl"
                />
            )

        case 'social':
            return <SocialBlockPublic content={content} />

        case 'music':
            return <MusicBlockPublic content={content} />

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
