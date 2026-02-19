"use client"

import { PhotoBlockContent } from "@/lib/validations"

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
                return 'bg-white p-3 pb-12 border border-zinc-200 shadow-none'
            case 'polaroid-dark':
                return 'bg-zinc-900 p-3 pb-12 border border-zinc-800 shadow-none'
            case 'frame':
                return 'border-4 border-white shadow-none'
            case 'minimal':
                return 'shadow-none border border-zinc-100 dark:border-zinc-900'
            case 'round':
                return 'border border-black dark:border-white shadow-none'
            default:
                return ''
        }
    }

    return (
        <div className="w-full h-full flex flex-col p-2">
            <div className={`relative w-full h-full flex-1 rounded-none overflow-hidden flex flex-col ${getFrameClass()}`}>
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
                    <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 truncate">{caption}</p>
                    </div>
                )}
            </div>
            {caption && !(frame === 'polaroid' || frame === 'polaroid-dark') && (
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-2 text-center truncate">
                    {caption}
                </p>
            )}
        </div>
    )
}
