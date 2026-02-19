"use client"

import { PhotoBlockContent } from "@/lib/validations"

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
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <div className={`relative w-full h-full flex-1 min-h-0 rounded-none overflow-hidden ${getFrameClass()}`}>
                <img
                    src={imageUrl}
                    alt={alt}
                    className="w-full h-full object-cover"
                    style={{ filter: getFilterClass() }}
                />
                {caption && (frame === 'polaroid' || frame === 'polaroid-dark') && (
                    <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium truncate">{caption}</p>
                    </div>
                )}
            </div>
            {caption && !(frame === 'polaroid' || frame === 'polaroid-dark') && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 text-center italic">
                    {caption}
                </p>
            )}
        </div>
    )
}
