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
        <div className="space-y-10">
            <header className="flex flex-col gap-1 px-1">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                    {t('editors.palette.title') || "Color Extraction"}
                </h3>
                <p className="text-[10px] text-zinc-400/60 font-medium leading-relaxed">
                    Extraia a atmosfera cromática de uma imagem
                </p>
            </header>

            {!previewUrl ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed p-12 text-center transition-all cursor-pointer rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/50 group",
                        isDragActive && "border-blue-500 bg-blue-50/50"
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload className={cn("w-10 h-10 mx-auto mb-4 text-zinc-400 transition-transform group-hover:scale-110", isDragActive && "text-blue-500")} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        {isDragActive ? t('editors.palette.drop') : t('editors.palette.drag')}
                    </p>
                    {loading && <p className="mt-4 animate-pulse text-[10px] text-blue-500 font-black uppercase tracking-widest">Analisando Atmosfera...</p>}
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 group shadow-2xl">
                        <img src={previewUrl} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" alt="Source" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={reset}
                                className="w-12 h-12 bg-white/90 dark:bg-black/90 rounded-full flex items-center justify-center shadow-xl hover:bg-red-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {loading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 text-white animate-spin opacity-50" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                                    {t('editors.palette.analyzing')}
                                </p>
                            </div>
                        )}
                    </div>

                    {extractedColors.length > 0 && (
                        <div className="space-y-8">
                            <div className="flex gap-3 justify-center">
                                {extractedColors.map((color, idx) => (
                                    <div key={idx} className="group relative">
                                        <div
                                            className="w-10 h-10 rounded-xl border border-black/5 dark:border-white/5 transition-all hover:scale-110 hover:-translate-y-2 shadow-lg cursor-pointer active:scale-95"
                                            style={{ backgroundColor: color }}
                                        />
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0 z-20">
                                            <span className="text-[8px] font-black font-mono uppercase bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-2 py-1 rounded-md shadow-xl whitespace-nowrap border border-white/10">
                                                {color}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <Button
                                onClick={() => onApplyPalette(extractedColors)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-3xl h-14 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                {t('editors.palette.apply')}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
