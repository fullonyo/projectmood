"use client"

import type { ComponentProps } from "react"
import { useViewportScale } from "@/lib/canvas-scale"

import { FrameContainer, FrameType } from "./FrameContainer"
import { SmartText, TextBehavior } from "./SmartText"
import { SmartMedia, MediaType } from "./SmartMedia"
import { SmartShape } from "./SmartShape"
import { SmartRorschach } from "./SmartRorschach"

import { SmartPhoto } from "./SmartPhoto"
import { SmartCountdown } from "./SmartCountdown"
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
    UniversalMediaContent
} from "@/types/database"
import { BlockErrorBoundary } from "./block-error-boundary"

type SmartTextProps = ComponentProps<typeof SmartText>
type SmartTextFontSize = NonNullable<SmartTextProps['fontSize']>
type SmartTextAlign = NonNullable<SmartTextProps['align']>
type SmartTextCursorType = NonNullable<SmartTextProps['cursorType']>
type SmartTextDialogueStyle = NonNullable<SmartTextProps['dialogueStyle']>
type SmartTextDialogueFormat = NonNullable<SmartTextProps['dialogueFormat']>
type SmartTextNameStyle = NonNullable<SmartTextProps['nameStyle']>
type SmartTextTypingRhythm = NonNullable<SmartTextProps['typingRhythm']>
type SmartTextRevealMode = NonNullable<SmartTextProps['revealMode']>
type SmartSocialStyle = ComponentProps<typeof SmartSocial>['content']['style']

const FRAME_TYPES = ['none', 'polaroid', 'polaroid-dark', 'frame', 'minimal', 'round', 'glass', 'border', 'shadow'] as const
const TEXT_FONT_SIZES = ['sm', 'base', 'xl', '3xl'] as const
const TEXT_ALIGNS = ['left', 'center', 'right'] as const
const TEXT_CURSOR_TYPES = ['block', 'bar', 'underline', 'none'] as const
const TEXT_DIALOGUE_STYLES = ['novel', 'script', 'minimal'] as const
const TEXT_DIALOGUE_FORMATS = ['alternating', 'classic'] as const
const TEXT_NAME_STYLES = ['bold', 'italic', 'none'] as const
const TEXT_TYPING_RHYTHMS = ['steady', 'organic'] as const
const TEXT_REVEAL_MODES = ['char', 'word'] as const
const SOCIAL_STYLES = ['tag', 'glass', 'minimal', 'neon', 'pill', 'brutalist', 'ghost', 'clay', 'retro', 'aura'] as const

function isOneOf<T extends readonly string[]>(options: T, value: unknown): value is T[number] {
    return typeof value === 'string' && options.includes(value)
}

function getFrameType(value: unknown, fallback: FrameType = 'none'): FrameType {
    return isOneOf(FRAME_TYPES, value) ? value : fallback
}

function getTextFontSize(value: TextContent['fontSize']): SmartTextFontSize | undefined {
    if (typeof value === 'number') return value
    return isOneOf(TEXT_FONT_SIZES, value) ? value : undefined
}

function getOpacity(content: MoodBlock['content']): number {
    return typeof content.opacity === 'number' ? content.opacity : 1
}

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
        const behavior: TextBehavior = textContent.behavior || (
            block.type === 'ticker' ? 'ticker' :
                block.type === 'floating' ? 'floating' :
                    block.type === 'subtitle' ? 'typewriter' :
                        block.type === 'quote' ? 'quote' :
                            (block.type === 'moodStatus' || block.type === 'mood-status') ? 'status' :
                                'static'
        )
        const fallbackFrame = ['ticker', 'subtitle', 'floating'].includes(block.type) ? 'minimal' : 'none'
        const frame = getFrameType(textContent.frame, textContent.style === 'simple' ? 'none' : getFrameType(textContent.style, fallbackFrame))
        
        return (
            <FrameContainer frame={frame}>
                <SmartText
                    text={textContent.text}
                    behavior={behavior}
                    style={textContent.style}
                    textColor={textContent.textColor}
                    fontSize={getTextFontSize(textContent.fontSize)}
                    align={isOneOf(TEXT_ALIGNS, textContent.align) ? textContent.align as SmartTextAlign : undefined}
                    speed={textContent.speed}
                    direction={textContent.direction}
                    cursorType={isOneOf(TEXT_CURSOR_TYPES, textContent.cursorType) ? textContent.cursorType as SmartTextCursorType : undefined}
                    author={textContent.author}
                    showQuotes={textContent.showQuotes}
                    icon={textContent.icon}
                    dialogueStyle={isOneOf(TEXT_DIALOGUE_STYLES, textContent.dialogueStyle) ? textContent.dialogueStyle as SmartTextDialogueStyle : undefined}
                    dialogueFormat={isOneOf(TEXT_DIALOGUE_FORMATS, textContent.dialogueFormat) ? textContent.dialogueFormat as SmartTextDialogueFormat : undefined}
                    nameStyle={isOneOf(TEXT_NAME_STYLES, textContent.nameStyle) ? textContent.nameStyle as SmartTextNameStyle : undefined}
                    dialogueLines={textContent.dialogueLines}
                    typingRhythm={isOneOf(TEXT_TYPING_RHYTHMS, textContent.typingRhythm) ? textContent.typingRhythm as SmartTextTypingRhythm : undefined}
                    revealMode={isOneOf(TEXT_REVEAL_MODES, textContent.revealMode) ? textContent.revealMode as SmartTextRevealMode : undefined}
                />
            </FrameContainer>
        )
    }

    const renderMedia = () => {
        const mediaContent = content as UniversalMediaContent
        const mediaType = mediaContent.mediaType || (block.type === 'music' ? 'music' : 'video')
        const frame = getFrameType(mediaContent.frame, mediaType === 'music' ? 'minimal' : 'none')
        
        return (
            <FrameContainer frame={frame}>
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
                    <SmartPhoto content={{
                        ...(content as PhotoContent),
                        imageUrl: (content as PhotoContent).imageUrl || '',
                        filter: (content as PhotoContent).filter || 'none',
                        frame: (content as PhotoContent).frame || 'none',
                        ambientTint: !!(content as any).ambientTint
                    }} />
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
                    <SmartPhoto content={{
                        ...(content as PhotoContent),
                        imageUrl: (content as PhotoContent).imageUrl || '',
                        filter: (content as PhotoContent).filter || 'none',
                        frame: (content as PhotoContent).frame || 'none',
                        ambientTint: !!(content as any).ambientTint
                    }} />
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
                    style: isOneOf(SOCIAL_STYLES, socialContent.style) ? socialContent.style as SmartSocialStyle : 'minimal'
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

    const opacity = getOpacity(content)

    return (
        <div className="w-full h-full" style={{ opacity }}>
            {element}
        </div>
    )
}
