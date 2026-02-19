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
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <Brush className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Doodle_Draft_Protocol</h3>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950">
                <div className="p-5 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-900">
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
                        className="w-full bg-white dark:bg-zinc-950 cursor-crosshair touch-none border border-zinc-200 dark:border-zinc-800 grayscale invert dark:invert-0"
                    />
                </div>

                <div className="p-5 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                            {[2, 4, 8, 12].map(size => (
                                <button
                                    key={size}
                                    onClick={() => {
                                        const ctx = canvasRef.current?.getContext("2d")
                                        if (ctx) ctx.lineWidth = size
                                    }}
                                    className="w-8 h-8 flex items-center justify-center border-r last:border-r-0 border-zinc-100 dark:border-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group"
                                >
                                    <div
                                        className="bg-current rounded-full transition-all"
                                        style={{ width: size, height: size }}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={clear}
                                className="w-10 h-10 flex items-center justify-center border border-zinc-100 dark:border-zinc-900 bg-white/50 dark:bg-zinc-900 text-zinc-400 hover:text-black dark:hover:text-white transition-all"
                                title="RESET_BUFFER"
                            >
                                <Eraser className="w-4 h-4" />
                            </button>
                            <Button
                                onClick={save}
                                disabled={isPending}
                                className="bg-black dark:bg-white text-white dark:text-black rounded-none w-10 h-10 p-0 flex items-center justify-center hover:scale-[1.05] active:scale-95 transition-all shadow-none border border-black dark:border-white"
                                title="MANIFEST_NODE"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-400">Identity_Chrome_Nodes</p>
                        <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-2 -mx-1 px-1">
                            {['#000', '#666', '#FF0000', '#FF7F00', '#FFD700', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#ffffff'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        "w-5 h-5 border border-black/10 transition-all hover:scale-125 shrink-0",
                                        color === c && "ring-1 ring-black dark:ring-white scale-125 z-10 mx-0.5"
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-[7px] text-zinc-400 font-black uppercase tracking-widest text-center opacity-30">Manifest_Doodle // Kinetic_Expression</p>
        </div>
    )
}
