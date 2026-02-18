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
                return 'bg-white p-3 pb-12 shadow-xl'
            case 'border':
                return 'border-4 border-white shadow-lg'
            case 'shadow':
                return 'shadow-2xl'
            default:
                return ''
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className={`rounded-lg overflow-hidden ${getFrameClass()}`}>
                <img
                    src={imageUrl}
                    alt={alt}
                    className="w-full h-full object-cover"
                    style={{ filter: getFilterClass() }}
                />
                {caption && frame === 'polaroid' && (
                    <div className="absolute bottom-3 left-3 right-3 text-center">
                        <p className="text-sm text-zinc-700 font-medium">{caption}</p>
                    </div>
                )}
            </div>
            {caption && frame !== 'polaroid' && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 text-center italic">
                    {caption}
                </p>
            )}
        </div>
    )
}
