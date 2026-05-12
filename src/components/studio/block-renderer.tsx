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

import { 
    MoodBlock, 
    TextContent, 
    PhotoContent, 
    CountdownContent, 
    SocialContent, 
    WeatherContent, 
    ShapeContent, 
    RorschachContent, 
    DoodleContent, 
    TapeContent, 
    UniversalMediaContent,
    GuestbookContent
} from "@/types/database"
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
        const textContent = content as TextContent
        const behavior = textContent.behavior || (
            block.type === 'ticker' ? 'ticker' :
                block.type === 'floating' ? 'floating' :
                    block.type === 'subtitle' ? 'typewriter' :
                        block.type === 'quote' ? 'quote' :
                            (block.type === 'moodStatus' || block.type === 'mood-status') ? 'status' :
                                'static'
        )
        const frame = textContent.frame || (textContent.style === 'simple' ? 'none' : textContent.style as any) || (['ticker', 'subtitle', 'floating'].includes(block.type) ? 'minimal' : 'none')
        
        return (
            <FrameContainer frame={frame}>
                <SmartText
                    text={textContent.text}
                    behavior={behavior as TextBehavior}
                    style={textContent.style as any}
                    textColor={textContent.textColor}
                    fontSize={textContent.fontSize as any}
                    align={textContent.align as any}
                    speed={textContent.speed}
                    direction={textContent.direction as "left" | "right"}
                    cursorType={textContent.cursorType as any}
                    author={textContent.author}
                    showQuotes={textContent.showQuotes}
                    icon={textContent.icon}
                    dialogueStyle={textContent.dialogueStyle as any}
                    dialogueFormat={textContent.dialogueFormat as any}
                    nameStyle={textContent.nameStyle as any}
                    dialogueLines={textContent.dialogueLines}
                    typingRhythm={textContent.typingRhythm as any}
                    revealMode={textContent.revealMode as any}
                />
            </FrameContainer>
        )
    }

    const renderMedia = () => {
        const mediaContent = content as UniversalMediaContent
        const mediaType = mediaContent.mediaType || (block.type === 'music' ? 'music' : 'video')
        const frame = mediaContent.frame || (mediaType === 'music' ? 'minimal' : 'none')
        
        return (
            <FrameContainer frame={frame as any}>
                <SmartMedia
                    mediaType={mediaType as MediaType}
                    videoId={mediaContent.videoId}
                    trackId={mediaContent.trackId}
                    audioUrl={mediaContent.audioUrl}
                    audioMetadata={{
                        name: mediaContent.name,
                        artist: mediaContent.artist
                    }}
                    isPublic={isPublic}
                    hasInteracted={hasInteracted}
                    lyrics={mediaContent.lyrics}
                    lyricsDisplay={mediaContent.lyricsDisplay}
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
                    <FrameContainer frame={(content as PhotoContent).frame as FrameType} caption={(content as PhotoContent).caption}>
                        <SmartPhoto content={{
                            ...(content as PhotoContent),
                            imageUrl: (content as PhotoContent).imageUrl || '',
                            filter: (content as PhotoContent).filter || 'none',
                            frame: (content as PhotoContent).frame || 'none'
                        }} />
                    </FrameContainer>
                )

            case 'video':
            case 'music':
            case 'media':
            case 'audio':
                return renderMedia()

            case 'shape':
                const shapeContent = content as ShapeContent
                return (
                    <SmartShape
                        type={shapeContent.shapeType}
                        color={shapeContent.color}
                        blur={shapeContent.blur}
                        sides={shapeContent.sides}
                        points={shapeContent.points}
                        seed={shapeContent.seed}
                        glowIntensity={shapeContent.glowIntensity}
                        isFloating={shapeContent.isFloating}
                        floatSpeed={shapeContent.floatSpeed}
                        gradient={shapeContent.gradient}
                        gradientType={shapeContent.gradientType as "linear" | "radial"}
                    />
                )

            case 'rorschach':
                const rorschachContent = content as RorschachContent
                return (
                    <SmartRorschach
                        seed={rorschachContent.seed}
                        color={rorschachContent.color}
                        blur={rorschachContent.blur}
                        symmetry={rorschachContent.symmetry}
                        complexity={rorschachContent.complexity}
                    />
                )
                
            case 'gif':
                return (
                    <FrameContainer frame={(content as PhotoContent).frame as FrameType} caption={(content as PhotoContent).caption}>
                        <SmartPhoto content={{
                            ...(content as PhotoContent),
                            imageUrl: (content as PhotoContent).imageUrl || '',
                            filter: (content as PhotoContent).filter || 'none',
                            frame: (content as PhotoContent).frame || 'none'
                        }} />
                    </FrameContainer>
                )

            case 'tape':
                const tapeContent = content as TapeContent
                return (
                    <div
                        className="w-full h-full shadow-none border border-black/5 backdrop-blur-[2px]"
                        style={{
                            backgroundColor: tapeContent.color,
                            backgroundImage: tapeContent.pattern === 'dots' ? `radial-gradient(rgba(0,0,0,0.1) ${Math.max(1, Math.round(1 * scale))}px, transparent ${Math.max(1, Math.round(1 * scale))}px)` : 'none',
                            backgroundSize: `${Math.round(4 * scale)}px ${Math.round(4 * scale)}px`,
                            clipPath: 'polygon(2% 0%, 98% 2%, 100% 100%, 0% 98%)'
                        }}
                    />
                )

            case 'weather':
                const weatherContent = content as WeatherContent
                return <SmartWeather content={{
                    ...weatherContent,
                    vibe: weatherContent.vibe || 'clear',
                    location: weatherContent.location || 'Unknown'
                }} isInsideFrame={Boolean(weatherContent.frame && weatherContent.frame !== 'none')} />

            case 'doodle':
                const doodleContent = content as DoodleContent
                if (!doodleContent.image) return null;
                return (
                    <img
                        src={doodleContent.image}
                        alt="doodle"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain pointer-events-none drop-shadow-none transition-opacity duration-300"
                    />
                )

            case 'social':
                const socialContent = content as SocialContent
                return <SmartSocial content={{
                    ...socialContent,
                    label: socialContent.label || '',
                    style: (socialContent.style as any) || 'minimal'
                }} isPublic={isPublic} isInsideFrame={Boolean(socialContent.frame && socialContent.frame !== 'none')} />

            case 'guestbook':
                return (
                    <div className="w-full h-full min-h-0 flex flex-col">
                        <SmartGuestbook block={block} isPublic={isPublic} />
                    </div>
                )

            case 'countdown':
                const countdownContent = content as CountdownContent
                return <SmartCountdown content={{
                    ...countdownContent,
                    style: countdownContent.style || 'minimal'
                }} />

            default:
                return <div className="p-4 bg-red-500/10 text-red-500 text-[10px] uppercase font-black">Unknown Block Type: {block.type}</div>
        }
    })()

    const opacity = (content as any).opacity ?? 1

    return (
        <div className="w-full h-full" style={{ opacity: opacity as number }}>
            {element}
        </div>
    )
}
