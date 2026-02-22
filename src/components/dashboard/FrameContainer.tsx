"use client"

import { cn } from "@/lib/utils"
import { useViewportScale } from "@/lib/canvas-scale"
import React from "react"

export type FrameType = 'none' | 'polaroid' | 'polaroid-dark' | 'frame' | 'minimal' | 'round' | 'glass'

interface FrameContainerProps {
    children: React.ReactNode
    frame?: FrameType
    caption?: string
    padding?: boolean
    className?: string
}

export function FrameContainer({
    children,
    frame = 'none',
    caption,
    padding = true,
    className
}: FrameContainerProps) {
    const scale = useViewportScale()

    const getFrameClass = () => {
        switch (frame) {
            case 'polaroid':
                return 'bg-white border border-zinc-200 shadow-xl'
            case 'polaroid-dark':
                return 'bg-zinc-900 border border-zinc-800 shadow-xl'
            case 'frame':
                return 'border-white shadow-2xl'
            case 'minimal':
                return 'shadow-none border border-zinc-200 dark:border-zinc-800'
            case 'round':
                return 'border-2 border-black dark:border-white shadow-none overflow-hidden'
            case 'glass':
                return 'bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 shadow-none'
            default:
                return ''
        }
    }

    const getFrameStyles = () => {
        const basePadding = padding ? Math.round(8 * scale) : 0
        switch (frame) {
            case 'polaroid':
            case 'polaroid-dark':
                return {
                    padding: `${Math.round(12 * scale)}px ${Math.round(12 * scale)}px ${Math.round(48 * scale)}px ${Math.round(12 * scale)}px`,
                    borderRadius: Math.round(2 * scale)
                }
            case 'frame':
                return {
                    borderWidth: Math.round(12 * scale),
                    padding: basePadding
                }
            case 'round':
                return {
                    borderRadius: '9999px',
                    padding: basePadding
                }
            case 'glass':
                return {
                    borderRadius: Math.round(12 * scale),
                    padding: basePadding
                }
            default:
                return { padding: basePadding }
        }
    }

    return (
        <div className={cn("w-full h-full flex flex-col group", className)} style={getFrameStyles()}>
            <div className={cn(
                "relative w-full h-full flex-1 flex flex-col transition-all duration-500",
                getFrameClass()
            )}>
                <div className="relative flex-1 w-full min-h-0 z-0 overflow-hidden">
                    {children}
                </div>

                {caption && (frame === 'polaroid' || frame === 'polaroid-dark') && (
                    <div className="absolute text-center pointer-events-none w-full" style={{ bottom: Math.round(12 * scale) }}>
                        <p className="font-black uppercase tracking-widest text-zinc-500 truncate px-4" style={{ fontSize: Math.round(10 * scale) }}>
                            {caption}
                        </p>
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
