"use client"

import { PhotoBlockContent } from "@/lib/validations"
import { useViewportScale } from "@/lib/canvas-scale"

import Image from "next/image"

interface PhotoBlockPublicProps {
    content: PhotoBlockContent
}

export function PhotoBlockPublic({ content }: PhotoBlockPublicProps) {
    const {
        imageUrl,
        alt = '',
        filter = 'none',
        frame = 'none',
        caption
    } = content
    const scale = useViewportScale()

    const getFilterClass = () => {
        switch (filter) {
            case 'vintage':
                return 'sepia(50%) contrast(110%)'
            case 'bw':
                return 'grayscale(100%)'
            case 'warm':
                return 'saturate(130%) hue-rotate(-10deg)'
            case 'cool':
                return 'saturate(110%) hue-rotate(10deg)'
            default:
                return 'none'
        }
    }

    const getFrameClass = () => {
        switch (frame) {
            case 'polaroid':
                return 'bg-white border border-zinc-200 shadow-none'
            case 'polaroid-dark':
                return 'bg-zinc-900 border border-zinc-800 shadow-none'
            case 'frame':
                return 'border-white shadow-none'
            case 'minimal':
                return 'shadow-none border border-zinc-100 dark:border-zinc-900'
            case 'round':
                return 'border border-black dark:border-white shadow-none'
            default:
                return ''
        }
    }

    const getFrameStyles = () => {
        switch (frame) {
            case 'polaroid':
            case 'polaroid-dark':
                return { padding: `${Math.round(12 * scale)}px ${Math.round(12 * scale)}px ${Math.round(48 * scale)}px ${Math.round(12 * scale)}px` }
            case 'frame':
                return { borderWidth: Math.round(16 * scale) }
            default:
                return {}
        }
    }

    return (
        <div className="w-full h-full flex flex-col" style={{ padding: Math.round(8 * scale) }}>
            <div className={`relative w-full h-full flex-1 rounded-none overflow-hidden flex flex-col ${getFrameClass()}`} style={getFrameStyles()}>
                <div className="relative flex-1 w-full min-h-0 z-0">
                    <Image
                        src={imageUrl}
                        alt={alt || "Mood photo"}
                        fill
                        unoptimized
                        className="object-cover"
                        style={{ filter: getFilterClass() }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
                {caption && (frame === 'polaroid' || frame === 'polaroid-dark') && (
                    <div className="absolute text-center pointer-events-none" style={{ left: Math.round(12 * scale), right: Math.round(12 * scale), bottom: Math.round(12 * scale) }}>
                        <p className="font-black uppercase tracking-widest text-zinc-500 truncate" style={{ fontSize: Math.round(10 * scale) }}>{caption}</p>
                    </div>
                )}
            </div>
            {caption && !(frame === 'polaroid' || frame === 'polaroid-dark') && (
                <p className="font-black uppercase tracking-[0.2em] text-zinc-400 text-center truncate" style={{ fontSize: Math.round(9 * scale), marginTop: Math.round(8 * scale) }}>
                    {caption}
                </p>
            )}
        </div>
    )
}
