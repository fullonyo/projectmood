"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Palette, Upload, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

interface ColorPaletteExtractorProps {
    onApplyPalette: (palette: string[]) => void
}

export function ColorPaletteExtractor({ onApplyPalette }: ColorPaletteExtractorProps) {
    const { t } = useTranslation()
    const [extractedColors, setExtractedColors] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const extractColorsFromImage = (base64: string): Promise<string[]> => {
        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')!

                // Resize for performance
                const scale = Math.min(1, 200 / Math.max(img.width, img.height))
                canvas.width = img.width * scale
                canvas.height = img.height * scale
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const pixels = imageData.data
                const colorMap = new Map<string, number>()

                // Sample pixels for performance
                for (let i = 0; i < pixels.length; i += 16) {
                    const r = pixels[i]
                    const g = pixels[i + 1]
                    const b = pixels[i + 2]
                    // Quantize colors slightly to group similar ones
                    const qr = Math.round(r / 10) * 10
                    const qg = Math.round(g / 10) * 10
                    const qb = Math.round(b / 10) * 10
                    const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`
                    colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
                }

                const sortedColors = Array.from(colorMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([color]) => color)

                resolve(sortedColors)
            }
            img.src = base64
        })
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setLoading(true)
        const reader = new FileReader()
        reader.onload = async () => {
            const base64 = reader.result as string
            setPreviewUrl(base64)
            const colors = await extractColorsFromImage(base64)
            setExtractedColors(colors)
            setLoading(false)
        }
        reader.readAsDataURL(file)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    })

    const reset = () => {
        setPreviewUrl(null)
        setExtractedColors([])
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <Sparkles className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">{t('editors.palette.title')}</h3>
                    <p className="text-[9px] text-zinc-400 uppercase tracking-tighter">{t('editors.palette.desc')}</p>
                </div>
            </div>

            {!previewUrl ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border border-dashed border-zinc-200 dark:border-zinc-800 rounded-none p-6 text-center transition-all cursor-pointer group bg-zinc-50/50 dark:bg-zinc-900/30",
                        isDragActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-400 group-hover:scale-110 transition-transform" />
                    <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                        {isDragActive ? t('editors.palette.drop') : t('editors.palette.drag')}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">{t('editors.palette.hint')}</p>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="relative aspect-video rounded-none overflow-hidden border border-zinc-200 dark:border-zinc-800 group">
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Source" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={reset}
                                className="p-2 bg-white/20 backdrop-blur-md rounded-none hover:bg-white/40 transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        {loading && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white animate-pulse">
                                    {t('editors.palette.analyzing')}
                                </p>
                            </div>
                        )}
                    </div>

                    {extractedColors.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex gap-1.5 justify-center">
                                {extractedColors.map((color, idx) => (
                                    <div key={idx} className="group relative">
                                        <div
                                            className="w-10 h-10 rounded-none border border-white dark:border-zinc-900 shadow-none transition-transform hover:scale-110"
                                            style={{ backgroundColor: color }}
                                        />
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[8px] font-mono uppercase bg-zinc-900 text-white px-1 rounded-none">
                                                {color}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={() => onApplyPalette(extractedColors)}
                                className="w-full bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black h-12 rounded-none text-[10px] font-black uppercase tracking-widest border border-black dark:border-white transition-all"
                            >
                                {t('editors.palette.apply')}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
