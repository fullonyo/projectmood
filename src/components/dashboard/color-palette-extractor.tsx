"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

interface ColorPaletteExtractorProps {
    onApplyPalette: (palette: string[]) => void
}

export function ColorPaletteExtractor({ onApplyPalette }: ColorPaletteExtractorProps) {
    const [extractedColors, setExtractedColors] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)

        // Convert to base64
        const reader = new FileReader()
        reader.onload = async () => {
            const base64 = reader.result as string

            // Simple color extraction using canvas
            const colors = await extractColorsFromImage(base64)
            setExtractedColors(colors)
            setLoading(false)
        }
        reader.readAsDataURL(file)
    }

    const extractColorsFromImage = (base64: string): Promise<string[]> => {
        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')!

                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const pixels = imageData.data

                // Simple color extraction - get dominant colors
                const colorMap = new Map<string, number>()

                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i]
                    const g = pixels[i + 1]
                    const b = pixels[i + 2]
                    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
                    colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
                }

                // Get top 5 colors
                const sortedColors = Array.from(colorMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([color]) => color)

                resolve(sortedColors)
            }
            img.src = base64
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <Palette className="w-4 h-4 text-zinc-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Paleta de Cores</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Upload de Imagem
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full text-sm"
                    />
                </div>

                {loading && <p className="text-xs text-zinc-500">Extraindo cores...</p>}

                {extractedColors.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Cores Extraídas:
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                            {extractedColors.map((color, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div
                                        className="w-full h-12 rounded-lg border border-zinc-200 dark:border-zinc-700"
                                        style={{ backgroundColor: color }}
                                    />
                                    <p className="text-[9px] text-center font-mono text-zinc-500">
                                        {color}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={() => onApplyPalette(extractedColors)}
                            className="w-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
                        >
                            Aplicar Paleta ao Perfil
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
