"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Brush, Eraser, Undo2 } from "lucide-react"

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
            await addMoodBlock('doodle', { image: dataUrl }, { x: 100, y: 100 })
            clear()
        })
    }

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">The Doodle Spot</h2>

            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 space-y-4 border border-zinc-200 dark:border-zinc-700">
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
                    className="w-full bg-white dark:bg-zinc-900 rounded-xl cursor-crosshair touch-none shadow-inner"
                />

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {['#000', '#FF0000', '#3B82F6'].map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-4 h-4 rounded-full border ${color === c ? 'ring-2 ring-zinc-400' : ''}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={clear} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                            <Eraser className="w-4 h-4 text-zinc-400" />
                        </button>
                        <Button size="sm" onClick={save} disabled={isPending} className="rounded-full h-8 px-4 text-[10px] uppercase font-bold">
                            Colar no Mural
                        </Button>
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-zinc-500 italic text-center">Faça um rabisco e cole no mural</p>
        </div>
    )
}
