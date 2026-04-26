"use client"

import { PhotoBlockContent } from "@/lib/validations"
import Image from "next/image"
import { useState } from "react"
import { ImageOff } from "lucide-react"

interface PhotoBlockPublicProps {
    content: PhotoBlockContent
}

export function SmartPhoto({ content }: PhotoBlockPublicProps) {
    const [hasError, setHasError] = useState(false)
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

    if (!imageUrl || imageUrl.trim() === "" || hasError) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/50 gap-2 border border-dashed border-zinc-200 dark:border-zinc-800">
                <ImageOff className="w-5 h-5 text-zinc-400 opacity-20" />
                <div className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 opacity-30">
                    {hasError ? "Asset Load Error" : "Missing Image"}
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full h-full overflow-hidden group">
            <Image
                src={imageUrl}
                alt={alt || "Mood photo"}
                fill
                unoptimized
                className="object-cover transition-all duration-700 group-hover:scale-110"
                style={{ filter: getFilterClass() }}
                onError={() => setHasError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
    )
}
