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
        filter = 'none'
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

    if (!imageUrl || imageUrl.trim() === "") {
        return (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-20">No Image</div>
            </div>
        )
    }

    return (
        <div className="relative w-full h-full overflow-hidden">
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
    )
}
