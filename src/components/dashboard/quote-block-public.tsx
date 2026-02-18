"use client"

import { QuoteBlockContent } from "@/lib/validations"

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

    const getStyleClasses = () => {
        switch (style) {
            case 'bold':
                return 'text-2xl font-black leading-tight'
            case 'serif':
                return 'text-xl font-serif italic leading-relaxed'
            case 'modern':
                return 'text-lg font-medium tracking-tight leading-snug'
            case 'minimal':
            default:
                return 'text-base font-normal leading-normal'
        }
    }

    const getQuoteIcon = () => {
        if (!showQuotes) return null

        return (
            <span className="text-4xl leading-none opacity-30">
                "
            </span>
        )
    }

    return (
        <div
            className="p-6 rounded-2xl shadow-lg relative overflow-hidden"
            style={{ backgroundColor: bgColor, color }}
        >
            {showQuotes && (
                <div className="absolute top-2 left-2 opacity-10 text-6xl font-serif">
                    "
                </div>
            )}

            <div className="relative z-10 space-y-3">
                <p className={getStyleClasses()}>
                    {showQuotes && <span className="opacity-50">"</span>}
                    {text}
                    {showQuotes && <span className="opacity-50">"</span>}
                </p>

                {author && (
                    <p className="text-sm font-medium opacity-70 mt-3">
                        — {author}
                    </p>
                )}
            </div>

            {showQuotes && (
                <div className="absolute bottom-2 right-2 opacity-10 text-6xl font-serif rotate-180">
                    "
                </div>
            )}
        </div>
    )
}
