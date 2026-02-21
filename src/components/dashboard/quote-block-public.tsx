"use client"

import { QuoteBlockContent } from "@/lib/validations"
import { useViewportScale } from "@/lib/canvas-scale"

interface QuoteBlockPublicProps {
    content: QuoteBlockContent
}

export function QuoteBlockPublic({ content }: QuoteBlockPublicProps) {
    const {
        text,
        author,
        style = 'minimal',
        color = '#000000',
        bgColor = '#ffffff',
        showQuotes = true
    } = content

    const scale = useViewportScale()

    const getStyleClasses = () => {
        switch (style) {
            case 'bold':
                return 'font-black leading-tight'
            case 'serif':
                return 'font-serif italic leading-relaxed'
            case 'modern':
                return 'font-medium tracking-tight leading-snug'
            case 'minimal':
            default:
                return 'font-normal leading-normal'
        }
    }

    const getStyleFontSize = () => {
        switch (style) {
            case 'bold': return Math.round(24 * scale)
            case 'serif': return Math.round(20 * scale)
            case 'modern': return Math.round(18 * scale)
            case 'minimal':
            default: return Math.round(16 * scale)
        }
    }

    const getQuoteIcon = () => {
        if (!showQuotes) return null

        return (
            <span className="leading-none opacity-30" style={{ fontSize: Math.round(36 * scale) }}>
                "
            </span>
        )
    }

    return (
        <div
            className="shadow-lg relative overflow-hidden"
            style={{
                backgroundColor: bgColor,
                color,
                padding: Math.round(24 * scale),
                borderRadius: Math.round(16 * scale)
            }}
        >
            {showQuotes && (
                <div className="absolute opacity-10 font-serif" style={{ top: Math.round(8 * scale), left: Math.round(8 * scale), fontSize: Math.round(60 * scale) }}>
                    "
                </div>
            )}

            <div className="relative z-10 flex flex-col" style={{ gap: Math.round(12 * scale) }}>
                <p className={getStyleClasses()} style={{ fontSize: getStyleFontSize() }}>
                    {showQuotes && <span className="opacity-50">"</span>}
                    {text}
                    {showQuotes && <span className="opacity-50">"</span>}
                </p>

                {author && (
                    <p className="font-medium opacity-70" style={{ fontSize: Math.round(14 * scale), marginTop: Math.round(12 * scale) }}>
                        — {author}
                    </p>
                )}
            </div>

            {showQuotes && (
                <div className="absolute opacity-10 font-serif rotate-180" style={{ bottom: Math.round(8 * scale), right: Math.round(8 * scale), fontSize: Math.round(60 * scale) }}>
                    "
                </div>
            )}
        </div>
    )
}
