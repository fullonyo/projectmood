"use client"

import { useEffect, useRef, useState, useTransition, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getStroke } from "perfect-freehand"
import { useCanvasInteraction } from "./canvas-interaction-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { X, Check, Eraser, Loader2, Paintbrush, Undo2, Zap, Minus, Plus, Square, Circle, Minus as LineIcon, Pipette, MousePointer2, Activity, PenTool, Highlighter } from "lucide-react"
import { addMoodBlock } from "@/actions/profile"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

const COLOR_PALETTE = [
    '#ffffff', '#a1a1aa', '#3f3f46', '#000000',
    '#ef4444', '#f97316', '#f59e0b', '#10b981',
    '#3b82f6', '#8b5cf6', '#d946ef'
]

type ToolType = 'brush' | 'pen' | 'marker' | 'spray' | 'tape' | 'eraser' | 'line' | 'rect' | 'circle'

export function FullscreenDoodleOverlay() {
    const { 
        isDrawingMode, setIsDrawingMode, 
        brushColor, setBrushColor, 
        brushSize, setBrushSize,
        brushOpacity, setBrushOpacity
    } = useCanvasInteraction()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const colorInputRef = useRef<HTMLInputElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [hasDrawn, setHasDrawn] = useState(false)
    const [history, setHistory] = useState<string[]>([])
    const [isNeon, setIsNeon] = useState(false)
    const [tool, setTool] = useState<ToolType>('pen')
    const { t } = useTranslation()

    const points = useRef<number[][]>([])
    const startPoint = useRef<{ x: number, y: number } | null>(null)
    const snapshot = useRef<ImageData | null>(null)
    const sprayInterval = useRef<any>(null)

    const applyContextStyles = (ctx: CanvasRenderingContext2D) => {
        ctx.lineJoin = "round"; 
        ctx.lineCap = "round"; 
        ctx.strokeStyle = brushColor;
        ctx.fillStyle = brushColor;
        ctx.lineWidth = brushSize;
        
        if (tool === 'eraser') {
            ctx.globalCompositeOperation = "destination-out";
            ctx.globalAlpha = 1.0;
        } else {
            ctx.globalAlpha = brushOpacity;
            ctx.globalCompositeOperation = "source-over";
        }

        if (tool === 'marker') {
            ctx.globalAlpha = brushOpacity * 0.5;
        }

        if (isNeon && tool !== 'eraser') { 
            ctx.shadowBlur = brushSize * 1.5; 
            ctx.shadowColor = brushColor; 
        } else { 
            ctx.shadowBlur = 0; 
        }
    }

    const initCanvas = useCallback((restoreData?: string) => {
        const canvas = canvasRef.current; if (!canvas) return
        const ctx = canvas.getContext("2d"); if (!ctx) return
        if (restoreData || canvas.width !== window.innerWidth) {
            canvas.width = window.innerWidth; canvas.height = window.innerHeight
        }
        if (restoreData) {
            const img = new Image(); img.onload = () => { ctx.drawImage(img, 0, 0); applyContextStyles(ctx); }
            img.src = restoreData
        }
        applyContextStyles(ctx)
    }, [brushColor, brushSize, isNeon])

    useEffect(() => {
        initCanvas()
        const hResize = () => { if (canvasRef.current) initCanvas(canvasRef.current.toDataURL()) }
        window.addEventListener('resize', hResize); return () => window.removeEventListener('resize', hResize)
    }, [])

    const saveToHistory = () => {
        const canvas = canvasRef.current; if (canvas) setHistory(prev => [...prev.slice(-19), canvas.toDataURL()])
    }

    const undo = () => {
        const newHistory = [...history]; const lastState = newHistory.pop(); setHistory(newHistory)
        const canvas = canvasRef.current; const ctx = canvas?.getContext("2d")
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            if (newHistory.length > 0) {
                const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0); img.src = newHistory[newHistory.length - 1]
            } else { setHasDrawn(false) }
        }
    }

    const getCoords = (e: any) => {
        const canvas = canvasRef.current; if (!canvas) return { x: 0, y: 0, time: 0 }
        const rect = canvas.getBoundingClientRect(); const cx = e.touches ? e.touches[0].clientX : e.clientX; const cy = e.touches ? e.touches[0].clientY : e.clientY
        return { x: cx - rect.left, y: cy - rect.top, time: Date.now() }
    }

    const startPosition = (e: any) => {
        setIsDrawing(true); 
        setHasDrawn(true); 
        saveToHistory();
        const coords = getCoords(e);
        points.current = [[coords.x, coords.y, e.pressure || 0.5]];
        startPoint.current = { x: coords.x, y: coords.y };
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) {
            applyContextStyles(ctx);
            snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        if (tool === 'spray') {
            startSpray(coords.x, coords.y)
        }
    }

    const startSpray = (x: number, y: number) => {
        if (sprayInterval.current) clearInterval(sprayInterval.current)
        sprayInterval.current = setInterval(() => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!ctx) return
            
            ctx.fillStyle = brushColor
            ctx.globalAlpha = brushOpacity * 0.2 // Partículas leves para acumulação suave
            
            const density = brushSize * 2
            for (let i = 0; i < density; i++) {
                // Distribuição polar para efeito esférico
                const angle = Math.random() * Math.PI * 2
                const radius = Math.random() * brushSize * (Math.random() > 0.5 ? 0.8 : 1) // Favorece centro
                const px = x + Math.cos(angle) * radius
                const py = y + Math.sin(angle) * radius
                
                const pSize = Math.random() * 1.5 + 0.5
                ctx.beginPath()
                ctx.arc(px, py, pSize, 0, Math.PI * 2)
                ctx.fill()
            }
        }, 30)
    }

    const getSvgPathFromStroke = (stroke: number[][]) => {
        if (!stroke.length) return ""
        const d = stroke.reduce(
            (acc, [x, y], i, arr) => {
                const [nx, ny] = arr[(i + 1) % arr.length]
                acc.push(x, y, (x + nx) / 2, (y + ny) / 2)
                return acc
            },
            ["M", ...stroke[0], "Q"]
        )
        d.push("Z")
        return d.join(" ")
    }

    const draw = (e: any) => {
        if (!isDrawing || !startPoint.current) return
        const canvas = canvasRef.current; 
        const ctx = canvas?.getContext("2d"); 
        if (!ctx || !canvas) return
        
        const currentPoint = getCoords(e)
        
        // Se for ferramenta de forma, limpa e redesenha do snapshot
        if (!['brush', 'pen', 'marker', 'eraser'].includes(tool) && snapshot.current) {
            ctx.putImageData(snapshot.current, 0, 0)
        }

        if (['brush', 'pen', 'marker', 'eraser', 'tape'].includes(tool)) {
            // Adiciona novo ponto
            points.current.push([currentPoint.x, currentPoint.y, e.pressure || 0.5])
            
            // Perfeito Freehand logic
            const stroke = getStroke(points.current, {
                size: brushSize,
                thinning: tool === 'pen' ? 0.5 : tool === 'brush' ? 0.7 : tool === 'tape' ? 0 : 0.5,
                smoothing: 0.5,
                streamline: 0.5,
                simulatePressure: tool !== 'tape',
                last: true
            })

            const pathData = getSvgPathFromStroke(stroke)
            
            if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0)
            
            ctx.beginPath()
            const p = new Path2D(pathData)
            ctx.fill(p)
        } else if (tool === 'spray') {
            // Atualiza posição do spray contínuo
            startSpray(currentPoint.x, currentPoint.y)
        } else if (tool === 'line') {
            ctx.beginPath(); ctx.moveTo(startPoint.current.x, startPoint.current.y); ctx.lineTo(currentPoint.x, currentPoint.y); ctx.stroke()
        } else if (tool === 'rect') {
            ctx.strokeRect(startPoint.current.x, startPoint.current.y, currentPoint.x - startPoint.current.x, currentPoint.y - startPoint.current.y)
        } else if (tool === 'circle') {
            const r = Math.hypot(currentPoint.x - startPoint.current.x, currentPoint.y - startPoint.current.y)
            ctx.beginPath(); ctx.arc(startPoint.current.x, startPoint.current.y, r, 0, Math.PI * 2); ctx.stroke()
        }
    }

    const finishedPosition = () => { 
        setIsDrawing(false); 
        points.current = []; 
        startPoint.current = null; 
        if (sprayInterval.current) {
            clearInterval(sprayInterval.current)
            sprayInterval.current = null
        }
        const ctx = canvasRef.current?.getContext("2d")
        if (ctx) ctx.beginPath()
    }

    const saveManifest = async () => {
        const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx || !hasDrawn) { setIsDrawingMode(false); return; }
        startTransition(async () => {
            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); const data = imageData.data
                let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0; let hasPixels = false
                for (let y = 0; y < canvas.height; y += 4) {
                    for (let x = 0; x < canvas.width; x += 4) {
                        if (data[(y * canvas.width + x) * 4 + 3] > 10) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); hasPixels = true }
                    }
                }
                if (!hasPixels) { setIsDrawingMode(false); return; }
                const padding = brushSize * 4; const cropW = (maxX - minX) + padding * 2; const cropH = (maxY - minY) + padding * 2
                const cropCanvas = document.createElement("canvas"); cropCanvas.width = cropW; cropCanvas.height = cropH
                const cropCtx = cropCanvas.getContext("2d")
                if (cropCtx) {
                    cropCtx.drawImage(canvas, minX - padding, minY - padding, cropW, cropH, 0, 0, cropW, cropH)
                    const dataUrl = cropCanvas.toDataURL("image/png")
                    await addMoodBlock('doodle', { image: dataUrl }, { x: parseFloat(((minX - padding) / canvas.width * 100).toFixed(4)), y: parseFloat(((minY - padding) / canvas.height * 100).toFixed(4)), width: cropW, height: cropH })
                }
                setIsDrawingMode(false)
            } catch (e) { setIsDrawingMode(false) }
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] overflow-hidden touch-none"
        >
            <canvas ref={canvasRef} onMouseDown={startPosition} onMouseUp={finishedPosition} onMouseMove={draw} onMouseLeave={finishedPosition} onTouchStart={startPosition} onTouchEnd={finishedPosition} onTouchMove={draw} className="absolute inset-0 w-full h-full cursor-crosshair z-10" />

            {/* Top Bar - System Actions */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-8 flex items-center justify-between pointer-events-none z-50">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button onClick={() => setIsDrawingMode(false)} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-all bg-black/20 backdrop-blur-md rounded-full border border-white/5">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="hidden md:flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-white/20 bg-black/10 px-4 py-2 rounded-full">
                        <Activity className="w-3 h-3" />
                        Kinetic.Doodle.Engine
                    </div>
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    <button onClick={undo} disabled={history.length === 0} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-0 transition-all bg-black/20 backdrop-blur-md rounded-full border border-white/5">
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={saveManifest}
                        disabled={isPending || !hasDrawn}
                        className="bg-white text-black hover:bg-emerald-400 hover:text-black px-6 h-10 rounded-full font-black text-[9px] uppercase tracking-[0.4em] transition-all flex items-center gap-3 shadow-2xl active:scale-95 disabled:opacity-20"
                    >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        {t('common.save')}
                    </button>
                </div>
            </div>

            {/* Bottom Dock - Creative Tools */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 z-50 pointer-events-none">
                
                {/* Contextual Settings (Small Bubble) */}
                <AnimatePresence>
                    <motion.div 
                        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="flex items-center gap-6 px-6 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 pointer-events-auto"
                    >
                        <div className="flex items-center gap-4">
                            <button onClick={() => setBrushSize(Math.max(2, brushSize - 2))} className="text-white/20 hover:text-white"><Minus className="w-3 h-3" /></button>
                            <span className="text-[9px] font-black text-white/40 tabular-nums w-4 text-center">{brushSize}px</span>
                            <button onClick={() => setBrushSize(Math.min(50, brushSize + 2))} className="text-white/20 hover:text-white"><Plus className="w-3 h-3" /></button>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Opc</span>
                            <Slider
                                value={[brushOpacity]}
                                min={0.1}
                                max={1}
                                step={0.05}
                                onValueChange={(val: number[]) => setBrushOpacity(val[0])}
                                className="w-20"
                            />
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <button 
                            onClick={() => setIsNeon(!isNeon)} 
                            className={cn("flex items-center gap-2 text-[8px] font-black uppercase tracking-widest transition-all", isNeon ? "text-blue-400" : "text-white/20 hover:text-white")}
                        >
                            <Zap className="w-3 h-3" />
                            Neon
                        </button>
                    </motion.div>
                </AnimatePresence>

                {/* Main Creative Dock */}
                <motion.div 
                    layout
                    className="flex items-center gap-8 px-10 py-4 rounded-[3rem] bg-zinc-900/40 backdrop-blur-3xl border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] pointer-events-auto"
                >
                    {/* Tools Segment */}
                    <div className="flex items-center gap-2">
                        {[
                            { id: 'pen', icon: PenTool },
                            { id: 'brush', icon: Paintbrush },
                            { id: 'marker', icon: Highlighter },
                            { id: 'spray', icon: Activity },
                            { id: 'tape', icon: LineIcon },
                            { id: 'eraser', icon: Eraser },
                            { id: 'line', icon: LineIcon },
                            { id: 'rect', icon: Square },
                            { id: 'circle', icon: Circle }
                        ].map(t => (
                            <button 
                                key={t.id} onClick={() => setTool(t.id as any)} 
                                className={cn("w-10 h-10 flex items-center justify-center transition-all relative", tool === t.id ? "text-white scale-110" : "text-white/20 hover:text-white/60")}
                            >
                                <t.icon className="w-4.5 h-4.5" />
                                {tool === t.id && (
                                    <motion.div layoutId="tool-active" className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    {/* Palette Segment */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2.5">
                            {COLOR_PALETTE.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setBrushColor(c)}
                                    className={cn(
                                        "w-3.5 h-3.5 rounded-full transition-all border",
                                        brushColor === c ? "scale-150 border-white" : "border-transparent opacity-30 hover:opacity-100"
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                        <button 
                            onClick={() => colorInputRef.current?.click()}
                            className={cn("w-8 h-8 flex items-center justify-center transition-all", !COLOR_PALETTE.includes(brushColor) ? "text-white" : "text-white/20 hover:text-white")}
                        >
                            <Pipette className="w-4 h-4" />
                            <input ref={colorInputRef} type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="sr-only" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
