"use client"

import { PhotoBlockContent } from "@/lib/validations"
import Image from "next/image"
import { useState } from "react"
import { ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhotoBlockPublicProps {
    content: PhotoBlockContent
}

export function SmartPhoto({ content }: PhotoBlockPublicProps) {
    const [hasError, setHasError] = useState(false)
    const {
        imageUrl,
        alt = '',
        filter = 'none',
        frame = 'none',
        caption = '',
        ambientTint = false
    } = content

    const getFilterClass = () => {
        switch (filter) {
            case 'vintage': return 'sepia(40%) contrast(110%) brightness(95%)'
            case 'bw': return 'grayscale(100%) contrast(120%)'
            case 'warm': return 'saturate(130%) hue-rotate(-10deg) brightness(105%)'
            case 'cool': return 'saturate(110%) hue-rotate(10deg) brightness(95%)'
            case 'fade': return 'contrast(85%) brightness(110%) saturate(70%)'
            case 'cinematic': return 'contrast(120%) saturate(110%) brightness(90%)'
            default: return 'none'
        }
    }

    const getFrameClasses = () => {
        switch (frame) {
            case 'polaroid':
                return 'bg-white p-4 pb-12 shadow-xl ring-1 ring-black/5'
            case 'polaroid-dark':
                return 'bg-zinc-950 p-4 pb-12 shadow-2xl ring-1 ring-white/10'
            case 'minimal':
                return 'rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10'
            case 'round':
                return 'rounded-full shadow-lg overflow-hidden'
            case 'glass':
                return 'rounded-3xl p-3 bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-2xl ring-1 ring-white/20'
            case 'border':
                return 'border-[8px] border-current shadow-lg'
            case 'shadow':
                // Aura Shadow leverages a colored glow. Using opacity in the box-shadow is tricky with currentColor,
                // so we use a pseudo-element glow for a true premium aura effect that doesn't block the UI.
                return 'rounded-xl ring-1 ring-white/10 shadow-2xl'
            case 'melt':
                return '' // We apply mask-image inline for melt
            case 'capsule':
                return 'bg-zinc-100/80 dark:bg-zinc-900/80 rounded-[2rem] shadow-sm'
            case 'frame':
                return 'p-3 bg-[#e5e5e5] dark:bg-[#1a1a1a] shadow-2xl border-4 border-[#d4d4d4] dark:border-[#262626]'
            default:
                return 'overflow-hidden'
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

    const isPolaroid = frame === 'polaroid' || frame === 'polaroid-dark'

    return (
        <div 
            className={cn(
                "relative w-full h-full group transition-all duration-500 flex flex-col",
                getFrameClasses()
            )}
            style={frame === 'melt' ? {
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
                maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)'
            } : {}}
        >
            <div className={cn(
                "relative flex-1 overflow-hidden",
                (frame === 'none' || frame === 'minimal' || frame === 'shadow' || frame === 'border' || frame === 'capsule') && "rounded-[inherit]"
            )}>
                {/* Imagem Base */}
                <Image
                    src={imageUrl}
                    alt={alt || "Mood photo"}
                    fill
                    unoptimized
                    className="object-cover transition-all duration-700 group-hover:scale-105"
                    style={{ filter: getFilterClass() }}
                    onError={() => setHasError(true)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Overlay 3D para o estilo Capsule (Fundo de Tampinha / Recessed) */}
                {frame === 'capsule' && (
                    <div 
                        className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_6px_16px_rgba(0,0,0,0.6)] border border-black/5 dark:border-white/5"
                    />
                )}

                {/* Sincronia Ambiental (Banho de Luz) */}
                {ambientTint && (
                    <div 
                        className="absolute inset-0 bg-current pointer-events-none transition-opacity duration-500" 
                        style={{ mixBlendMode: 'color', opacity: 0.25 }}
                    />
                )}
                {ambientTint && (
                    <div 
                        className="absolute inset-0 bg-current pointer-events-none transition-opacity duration-500" 
                        style={{ mixBlendMode: 'overlay', opacity: 0.15 }}
                    />
                )}
            </div>

            {/* Aura Shadow Glow (Colocado atrás da imagem se for frame shadow) */}
            {frame === 'shadow' && (
                <div className="absolute -inset-4 bg-current blur-2xl opacity-40 -z-10 rounded-xl" />
            )}

            {/* Legenda (Caption) apenas para Polaroid e Frame */}
            {isPolaroid && caption && (
                <div className={cn(
                    "absolute bottom-0 left-0 w-full h-12 flex items-center justify-center px-4",
                    frame === 'polaroid' ? "text-zinc-800" : "text-zinc-200"
                )}>
                    <span className="font-mono text-[10px] uppercase tracking-widest truncate opacity-80">
                        {caption}
                    </span>
                </div>
            )}
        </div>
    )
}
