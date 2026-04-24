"use client"

import { cn } from "@/lib/utils"
import { useViewportScale } from "@/lib/canvas-scale"
import { motion } from "framer-motion"
import {
    DiscordIcon, TikTokIcon, SteamIcon,
    SpotifyIcon, TwitchIcon, PinterestIcon
} from "../icons"

import dynamic from "next/dynamic"

import { FrameContainer, FrameType } from "./FrameContainer"
import { SmartText, TextBehavior } from "./SmartText"
import { SmartMedia, MediaType } from "./SmartMedia"
import { SmartShape } from "./SmartShape"
import { SmartRorschach } from "./SmartRorschach"

import { SmartPhoto } from "./SmartPhoto"
import { SmartCountdown } from "./SmartCountdown"
import { SmartReview } from "./SmartReview"
import { SmartSocial } from "./SmartSocial"
import { SmartWeather } from "./SmartWeather"
import { SmartGuestbook } from "./SmartGuestbook"

import { MoodBlock } from "@/types/database"
import { BlockErrorBoundary } from "./block-error-boundary"

interface BlockRendererProps {
    block: MoodBlock
    isPublic?: boolean
    hasInteracted?: boolean
}

export function BlockRenderer({ block, isPublic = false, hasInteracted = false }: BlockRendererProps) {
    return (
        <BlockErrorBoundary blockType={block.type}>
            <BlockRendererInner block={block} isPublic={isPublic} hasInteracted={hasInteracted} />
        </BlockErrorBoundary>
    );
}

function BlockRendererInner({ block, isPublic = false, hasInteracted = false }: BlockRendererProps) {
    const { content } = block
    const scale = useViewportScale()

    const renderText = () => {
        const behavior = content.behavior || (
            block.type === 'ticker' ? 'ticker' :
                block.type === 'floating' ? 'floating' :
                    block.type === 'subtitle' ? 'typewriter' :
                        block.type === 'quote' ? 'quote' :
                            (block.type === 'moodStatus' || block.type === 'mood-status') ? 'status' :
                                'static'
        )
        const frame = content.frame || (content.style === 'simple' ? 'none' : content.style as any) || (['ticker', 'subtitle', 'floating'].includes(block.type) ? 'minimal' : 'none')
        
        return (
            <FrameContainer frame={frame}>
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
                    dialogueStyle={content.dialogueStyle}
                    dialogueFormat={content.dialogueFormat}
                    nameStyle={content.nameStyle}
                    dialogueLines={content.dialogueLines}
                    typingRhythm={content.typingRhythm}
                    revealMode={content.revealMode}
                />
            </FrameContainer>
        )
    }

    const renderMedia = () => {
        const mediaType = content.mediaType || (block.type === 'music' ? 'music' : 'video')
        const frame = content.frame || (mediaType === 'music' ? 'minimal' : 'none')
        
        return (
            <FrameContainer frame={frame}>
                <SmartMedia
                    mediaType={mediaType as MediaType}
                    videoId={content.videoId}
                    trackId={content.trackId}
                    audioUrl={content.audioUrl}
                    audioMetadata={{
                        name: content.name,
                        artist: content.artist
                    }}
                    isPublic={isPublic}
                    hasInteracted={hasInteracted}
                    lyrics={content.lyrics}
                    lyricsDisplay={content.lyricsDisplay}
                />
            </FrameContainer>
        )
    }

    const element = (() => {
        switch (block.type) {
            case 'text':
            case 'ticker':
            case 'subtitle':
            case 'floating':
            case 'quote':
            case 'moodStatus':
            case 'mood-status':
                return renderText()

            case 'photo':
                return (
                    <FrameContainer frame={content.frame || 'none'} caption={content.caption}>
                        <SmartPhoto content={content} />
                    </FrameContainer>
                )

            case 'video':
            case 'music':
            case 'media':
            case 'audio':
                return renderMedia()

            case 'shape':
                return (
                    <SmartShape
                        type={content.shapeType}
                        color={content.color}
                        blur={content.blur}
                        sides={content.sides}
                        points={content.points}
                        seed={content.seed}
                        glowIntensity={content.glowIntensity}
                        isFloating={content.isFloating}
                        floatSpeed={content.floatSpeed}
                        gradient={content.gradient}
                        gradientType={content.gradientType as any}
                    />
                )

            case 'rorschach':
                return (
                    <SmartRorschach
                        seed={content.seed}
                        color={content.color}
                        blur={content.blur}
                        symmetry={content.symmetry}
                        complexity={content.complexity}
                    />
                )
                
            case 'gif':
                return (
                    <FrameContainer frame={content.frame || 'none'} caption={content.caption}>
                        <SmartPhoto content={content} />
                    </FrameContainer>
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
                return <SmartWeather content={content} isInsideFrame={content.frame && content.frame !== 'none'} />

            case 'doodle':
                if (!content.image) return null;
                return (
                    <img
                        src={content.image}
                        alt="doodle"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain pointer-events-none drop-shadow-none transition-opacity duration-300"
                    />
                )

            case 'social':
                return <SmartSocial content={content} isPublic={isPublic} isInsideFrame={content.frame && content.frame !== 'none'} />

            case 'guestbook':
                return (
                    <div className="w-full h-full min-h-0 flex flex-col">
                        <SmartGuestbook block={block} isPublic={isPublic} />
                    </div>
                )

            case 'countdown':
                return <SmartCountdown content={content} />

            default:
                return <div className="p-4 bg-red-500/10 text-red-500 text-[10px] uppercase font-black">Unknown Block Type: {block.type}</div>
        }
    })()

    const opacity = content.opacity ?? 1

    return (
        <div className="w-full h-full" style={{ opacity }}>
            {element}
        </div>
    )
}
