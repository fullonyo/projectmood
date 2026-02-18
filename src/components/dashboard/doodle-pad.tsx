"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Brush, Eraser, Undo2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

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

    const save = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const dataUrl = canvas.toDataURL("image/png")
        startTransition(async () => {
            await addMoodBlock('doodle', { image: dataUrl }, { x: 50, y: 50 })
            clear()
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

                <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1.5 flex-shrink-0">
                        {['#000', '#FF0000', '#3B82F6', '#10B981', '#F59E0B'].map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={cn(
                                    "w-5 h-5 rounded-full border border-black/5 transition-all hover:scale-110 flex-shrink-0",
                                    color === c && "ring-2 ring-zinc-400 scale-110"
                                )}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                        <button
                            onClick={clear}
                            className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700 shadow-sm flex-shrink-0"
                            title="Limpar"
                        >
                            <Eraser className="w-4 h-4 text-zinc-400" />
                        </button>
                        <Button
                            onClick={save}
                            disabled={isPending}
                            className="bg-black dark:bg-white text-white dark:text-black rounded-2xl h-10 px-3 font-black uppercase tracking-widest text-[9px] hover:scale-[1.02] transition-all shadow-md flex-shrink-0"
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Colar
                        </Button>
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-zinc-500 italic text-center">Faça um rabisco e cole no mural</p>
        </div>
    )
}
