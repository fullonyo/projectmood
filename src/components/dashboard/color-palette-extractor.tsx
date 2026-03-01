"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Palette, Upload, X, Sparkles, Loader2, Activity } from "lucide-react"
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

                const scale = Math.min(1, 200 / Math.max(img.width, img.height))
                canvas.width = img.width * scale
                canvas.height = img.height * scale
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const pixels = imageData.data
                const colorMap = new Map<string, number>()

                for (let i = 0; i < pixels.length; i += 16) {
                    const r = pixels[i]
                    const g = pixels[i + 1]
                    const b = pixels[i + 2]
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
            <header className="flex items-center gap-2 opacity-30 px-1">
                <Activity className="w-3 h-3 text-black dark:text-white" />
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em]">{t('editors.palette.title') || "Color Extraction"}</h3>
            </header>

            {!previewUrl ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border border-dashed p-10 text-center transition-all cursor-pointer group relative overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/10",
                        isDragActive
                            ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-800/20'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white opacity-20 group-hover:opacity-100 transition-opacity" />
                    <Upload className="w-6 h-6 mx-auto mb-4 text-zinc-400 opacity-40 group-hover:scale-110 transition-transform" />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">
                        {isDragActive ? t('editors.palette.drop') : t('editors.palette.drag')}
                    </p>
                    <p className="text-[7px] text-zinc-400 font-mono mt-2 uppercase tracking-widest">{t('editors.palette.hint')}</p>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="relative aspect-video rounded-none overflow-hidden border border-black/10 dark:border-white/10 group shadow-lg">
                        <img src={previewUrl} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" alt="Source" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <button
                                onClick={reset}
                                className="p-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all active:scale-95"
                            >
                                <X className="w-3.5 h-3.5 text-white" />
                            </button>
                        </div>
                        {loading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 text-white animate-spin opacity-50" />
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/50">
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
                                            className="w-8 h-8 border border-black/5 dark:border-white/5 transition-all hover:scale-110 hover:-translate-y-1 shadow-sm active:scale-95"
                                            style={{ backgroundColor: color }}
                                        />
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0 z-20">
                                            <span className="text-[7px] font-black font-mono uppercase bg-black text-white dark:bg-white dark:text-black px-1 py-0.5 whitespace-nowrap">
                                                {color}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={() => onApplyPalette(extractedColors)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 rounded-none text-[8px] font-black uppercase tracking-[0.3em] border border-zinc-100 dark:border-zinc-800 transition-all active:scale-[0.98] relative group"
                            >
                                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black dark:border-white" />
                                {t('editors.palette.apply')}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
