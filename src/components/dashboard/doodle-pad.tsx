"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Brush, Eraser, Undo2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import imageCompression from 'browser-image-compression'

export function DoodlePad() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [color, setColor] = useState("#000000")

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.lineJoin = "round"
        ctx.lineCap = "round"
        ctx.lineWidth = 2
        ctx.strokeStyle = color
    }, [color])

    const startPosition = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true)
        draw(e)
    }

    const finishedPosition = () => {
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.getContext("2d")?.beginPath()
    }

    const draw = (e: any) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = (e.clientX || e.touches[0].clientX) - rect.left
        const y = (e.clientY || e.touches[0].clientY) - rect.top

        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const clear = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
    }

    const save = async () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const dataUrl = canvas.toDataURL("image/png")

        startTransition(async () => {
            try {
                // Convert base64 to Blob
                const response = await fetch(dataUrl)
                const blob = await response.blob()

                // Compress
                const compressedFile = await imageCompression(blob as File, {
                    maxSizeMB: 0.2, // Doodles são pequenos, 200KB é mais que suficiente
                    maxWidthOrHeight: 800,
                    useWebWorker: true
                })

                const reader = new FileReader()
                reader.onloadend = async () => {
                    await addMoodBlock('doodle', { image: reader.result as string }, { x: 50, y: 50 })
                    clear()
                }
                reader.readAsDataURL(compressedFile)
            } catch (error) {
                console.error("Erro ao salvar doodle:", error)
                // Fallback para original se falhar
                await addMoodBlock('doodle', { image: dataUrl }, { x: 50, y: 50 })
                clear()
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <Brush className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">The Doodle Spot</h3>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-4 space-y-4 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <canvas
                    ref={canvasRef}
                    width={240}
                    height={200}
                    onMouseDown={startPosition}
                    onMouseUp={finishedPosition}
                    onMouseMove={draw}
                    onTouchStart={startPosition}
                    onTouchEnd={finishedPosition}
                    onTouchMove={draw}
                    className="w-full bg-white dark:bg-zinc-950 rounded-2xl cursor-crosshair touch-none shadow-inner border border-zinc-100 dark:border-zinc-900"
                />

                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-1.5 p-1 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                            {[2, 4, 8, 12].map(size => (
                                <button
                                    key={size}
                                    onClick={() => {
                                        const ctx = canvasRef.current?.getContext("2d")
                                        if (ctx) ctx.lineWidth = size
                                    }}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
                                >
                                    <div
                                        className="bg-zinc-400 rounded-full"
                                        style={{ width: size, height: size }}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1.5">
                            <button
                                onClick={clear}
                                className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700 shadow-sm"
                                title="Limpar"
                            >
                                <Eraser className="w-4 h-4 text-zinc-400" />
                            </button>
                            <Button
                                onClick={save}
                                disabled={isPending}
                                className="bg-black dark:bg-white text-white dark:text-black rounded-xl w-10 h-10 p-0 flex items-center justify-center hover:scale-[1.05] transition-all shadow-md"
                                title="Colar no mural"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-2 -mx-1 px-1">
                        {['#000', '#666', '#FF0000', '#FF7F00', '#FFD700', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#ffffff'].map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={cn(
                                    "w-6 h-6 rounded-full border border-black/5 transition-all hover:scale-125 shrink-0",
                                    color === c && "ring-2 ring-zinc-400 scale-125 z-10 mx-1"
                                )}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-zinc-500 italic text-center">Faça um rabisco e cole no mural</p>
        </div>
    )
}
