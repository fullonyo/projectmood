"use client"

import { cn } from "@/lib/utils"
import { useViewportScale } from "@/lib/canvas-scale"
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

// Universal Components
import { FrameContainer, FrameType } from "./FrameContainer"
import { SmartText, TextBehavior } from "./SmartText"

// Modularized Public Blocks - Static (Critical for LCP/CLS)
import { PhotoBlockPublic } from "./photo-block-public"
import { CountdownBlockPublic } from "./countdown-block-public"

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
    const scale = useViewportScale()

    // Helper to wrap content in a Frame
    const renderWithFrame = (children: React.ReactNode, frame: FrameType = 'none', caption?: string) => (
        <FrameContainer frame={frame} caption={caption}>
            {children}
        </FrameContainer>
    )

    switch (block.type) {
        case 'text':
        case 'ticker':
        case 'subtitle':
        case 'floating':
        case 'quote':
        case 'moodStatus':
        case 'mood-status':
            const behavior = content.behavior || (
                block.type === 'ticker' ? 'ticker' :
                    block.type === 'floating' ? 'floating' :
                        block.type === 'subtitle' ? 'typewriter' :
                            block.type === 'quote' ? 'quote' :
                                (block.type === 'moodStatus' || block.type === 'mood-status') ? 'status' :
                                    'static'
            )
            return (
                <FrameContainer frame={content.frame || (content.style === 'simple' ? 'none' : content.style as any) || (['ticker', 'subtitle', 'floating'].includes(block.type) ? 'minimal' : 'none')}>
                    <SmartText
                        text={content.text}
                        behavior={behavior as TextBehavior}
                        style={content.style}
                        textColor={content.textColor}
                        fontSize={content.fontSize}
                        align={content.align}
                        speed={content.speed}
                        direction={content.direction}
                        cursorType={content.cursorType}
                        author={content.author}
                        showQuotes={content.showQuotes}
                        icon={content.icon}
                    />
                </FrameContainer>
            )

        case 'photo':
            return (
                <FrameContainer frame={content.frame || 'none'} caption={content.caption}>
                    <PhotoBlockPublic content={content} />
                </FrameContainer>
            )

        case 'video':
            return (
                <FrameContainer frame={content.frame || 'none'} caption={content.caption}>
                    <VideoBlockPublic content={content} isPublic={isPublic} />
                </FrameContainer>
            )

        case 'gif':
            return renderWithFrame(
                <img src={content.url} alt="gif" className="w-full h-full object-cover" />,
                content.frame || 'none',
                content.caption
            )

        case 'tape':
            return (
                <div
                    className="w-full h-full shadow-none border border-black/5 backdrop-blur-[2px]"
                    style={{
                        backgroundColor: content.color,
                        backgroundImage: content.pattern === 'dots' ? `radial-gradient(rgba(0,0,0,0.1) ${Math.max(1, Math.round(1 * scale))}px, transparent ${Math.max(1, Math.round(1 * scale))}px)` : 'none',
                        backgroundSize: `${Math.round(4 * scale)}px ${Math.round(4 * scale)}px`,
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
            return (
                <FrameContainer frame={content.frame || 'none'}>
                    <MusicBlockPublic content={content} isPublic={isPublic} />
                </FrameContainer>
            )

        case 'guestbook':
            return (
                <div className="w-full h-full min-h-0 flex flex-col">
                    <GuestbookBlock block={block} isPublic={isPublic} />
                </div>
            )

        case 'countdown':
            return <CountdownBlockPublic content={content} />

        default:
            return <div className="p-4 bg-red-500/10 text-red-500 text-[10px] uppercase font-black">Unknown Block Type: {block.type}</div>
    }
}
