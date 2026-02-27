"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { motion } from "framer-motion"
import { useCanvasInteraction } from "./canvas-interaction-context"
import { Button } from "@/components/ui/button"
import { X, Check, Eraser, Loader2, Paintbrush, Activity } from "lucide-react"
import { addMoodBlock } from "@/actions/profile"
import imageCompression from "browser-image-compression"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

const PRESET_COLORS = [
    '#000000', '#666666', '#FF0000', '#FF7F00', '#FFD700',
    '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#ffffff'
]

export function FullscreenDoodleOverlay() {
    const { isDrawingMode, setIsDrawingMode, brushColor, setBrushColor, brushSize, setBrushSize } = useCanvasInteraction()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [hasDrawn, setHasDrawn] = useState(false)
    const { t } = useTranslation()

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current
            if (canvas) {
                // Ensure canvas size matches window exact size
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight

                // Re-apply styles after clear/resize
                const ctx = canvas.getContext("2d")
                if (ctx) {
                    ctx.lineJoin = "round"
                    ctx.lineCap = "round"
                    ctx.lineWidth = brushSize
                    ctx.strokeStyle = brushColor
                }
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (ctx) {
            ctx.lineWidth = brushSize
            ctx.strokeStyle = brushColor
        }
    }, [brushColor, brushSize])

    const startPosition = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true)
        setHasDrawn(true)

        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (ctx) {
            ctx.lineJoin = "round"
            ctx.lineCap = "round"
            ctx.lineWidth = brushSize
            ctx.strokeStyle = brushColor
            ctx.beginPath()
        }

        draw(e)
    }

    const finishedPosition = () => {
        setIsDrawing(false)
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (ctx) ctx.beginPath()
    }

    const draw = (e: any) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        const rect = canvas.getBoundingClientRect()
        let clientX = e.clientX
        let clientY = e.clientY

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX
            clientY = e.touches[0].clientY
        }

        const x = clientX - rect.left
        const y = clientY - rect.top

        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            setHasDrawn(false)
        }
    }

    const saveManifest = async () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx || !hasDrawn) {
            setIsDrawingMode(false)
            return
        }

        startTransition(async () => {
            try {
                // 1. Encontrar a Bounding Box do desenho
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data
                let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0
                let hasPixels = false

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const alpha = data[(y * canvas.width + x) * 4 + 3]
                        if (alpha > 0) { // Pixel não transparente
                            minX = Math.min(minX, x)
                            minY = Math.min(minY, y)
                            maxX = Math.max(maxX, x)
                            maxY = Math.max(maxY, y)
                            hasPixels = true
                        }
                    }
                }

                if (!hasPixels) {
                    setIsDrawingMode(false)
                    return
                }

                // Adicionar um pequeno padding na Bounding Box
                const padding = brushSize * 2
                minX = Math.max(0, minX - padding)
                minY = Math.max(0, minY - padding)
                maxX = Math.min(canvas.width, maxX + padding)
                maxY = Math.min(canvas.height, maxY + padding)

                const cropWidth = maxX - minX
                const cropHeight = maxY - minY

                // 2. Extrair o Canvas recortado
                const cropCanvas = document.createElement("canvas")
                cropCanvas.width = cropWidth
                cropCanvas.height = cropHeight
                const cropCtx = cropCanvas.getContext("2d")
                if (!cropCtx) throw new Error("Could not create crop context")

                cropCtx.putImageData(ctx.getImageData(minX, minY, cropWidth, cropHeight), 0, 0)

                // 3. Converter para data URL (PNG puro mantém as cores e a transparência exatas)
                const dataUrl = cropCanvas.toDataURL("image/png")

                // Removemos o browser-image-compression para doodles porque ele tentava otimizar 
                // e frequentemente convertia alpha-channel para preto ou modificava as cores originais.

                // 4. Calcular X e Y percentuais (baseado no centro do desenho)
                const percentX = parseFloat(((minX / canvas.width) * 100).toFixed(4))
                const percentY = parseFloat(((minY / canvas.height) * 100).toFixed(4))

                await addMoodBlock('doodle', { image: dataUrl }, {
                    x: percentX,
                    y: percentY,
                    width: cropWidth,
                    height: cropHeight
                })

                setIsDrawingMode(false)

            } catch (error) {
                console.error("Erro ao salvar doodle manifest:", error)
                setIsDrawingMode(false)
            }
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[50]"
        >
            {/* Visual Tint to indicate Drawing Mode */}
            <div className="absolute inset-0 pointer-events-none bg-black/5 dark:bg-black/40 backdrop-blur-[1px]" />

            <canvas
                ref={canvasRef}
                onMouseDown={startPosition}
                onMouseUp={finishedPosition}
                onMouseMove={draw}
                onMouseLeave={finishedPosition}
                onTouchStart={startPosition}
                onTouchEnd={finishedPosition}
                onTouchMove={draw}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            />

            {/* Drawing Tools HUD - Toolbar Central e Inferior */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-auto">

                {/* Floating Tools Palette */}
                <motion.div
                    className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-0 rounded-none overflow-hidden relative group"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white opacity-20 group-hover:opacity-100 transition-opacity" />

                    <header className="flex items-center gap-2 opacity-30 px-4 py-2 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
                        <h3 className="text-[7px] font-black uppercase tracking-[0.3em]">{t('editors.doodle.title')}</h3>
                    </header>

                    <div className="flex flex-col md:flex-row items-center p-2 gap-4">
                        {/* Colors */}
                        <div className="flex gap-1.5 p-1 px-2 md:border-r border-zinc-100 dark:border-zinc-900">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setBrushColor(c)}
                                    className={cn(
                                        "w-7 h-7 rounded-none transition-all hover:scale-110 border border-black/5 dark:border-white/10",
                                        brushColor === c && "ring-1 ring-offset-2 ring-black dark:ring-white scale-110"
                                    )}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>

                        {/* Sizes */}
                        <div className="flex gap-2 p-1 px-2 md:border-r border-zinc-100 dark:border-zinc-900">
                            {[2, 4, 8, 12, 16].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setBrushSize(size)}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-none transition-all hover:bg-black/5 dark:hover:bg-white/5",
                                        brushSize === size && "bg-black text-white dark:bg-white dark:text-black"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "rounded-full transition-all",
                                            brushSize === size ? "bg-white dark:bg-black" : "bg-black dark:bg-white"
                                        )}
                                        style={{ width: Math.min(size, 16), height: Math.min(size, 16) }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 p-1 px-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearCanvas}
                                disabled={isPending || !hasDrawn}
                                className="hover:bg-red-500 hover:text-white dark:hover:bg-red-500 rounded-none h-10 w-10 text-zinc-500 transition-all"
                                title={t('doodle.clear_screen')}
                            >
                                <Eraser className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDrawingMode(false)}
                                disabled={isPending}
                                className="hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none h-10 w-10 text-zinc-500 transition-all"
                                title="Cancelar"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-[200px]"
                >
                    <Button
                        onClick={saveManifest}
                        disabled={isPending || !hasDrawn}
                        className={cn(
                            "w-full bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-16 rounded-none text-[10px] font-black uppercase tracking-[0.4em] border border-zinc-100 dark:border-zinc-800 transition-all relative group overflow-hidden",
                            (!hasDrawn || isPending) && "opacity-50 grayscale"
                        )}
                    >
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        {isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Check className="w-5 h-5 mr-2" />
                        )}
                        {isPending ? t('doodle.manifesting') : t('doodle.confirm_save')}
                    </Button>
                </motion.div>
            </div>

            {/* Guide Text */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 pointer-events-none">
                <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-black dark:text-white" />
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-black dark:text-white">
                        {t('doodle.kinetic_active')}
                    </p>
                </div>
                <div className="h-[1px] w-12 bg-black/10 dark:bg-white/10" />
            </div>
        </motion.div>
    )
}
