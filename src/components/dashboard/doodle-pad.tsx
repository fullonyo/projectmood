"use client"

import { Button } from "@/components/ui/button"
import { Brush, Paintbrush, MonitorPlay, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasInteraction } from "./canvas-interaction-context"



export function DoodlePad() {
    const {
        isDrawingMode, setIsDrawingMode,
        brushColor, setBrushColor,
        brushSize, setBrushSize
    } = useCanvasInteraction()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <Brush className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Doodle_Draft_Protocol</h3>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950">
                {/* Hero / Action Area */}
                <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-900 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                        <Paintbrush className="w-6 h-6 text-zinc-400" />
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Fullscreen Canvas</p>
                        <p className="text-[8px] text-zinc-400 uppercase tracking-widest px-4">Desenhe livremente por cima do seu mural.</p>
                    </div>

                    <Button
                        onClick={() => setIsDrawingMode(!isDrawingMode)}
                        className={cn(
                            "w-full h-12 rounded-none font-black uppercase tracking-[0.2em] text-[9px] transition-all shadow-none border",
                            isDrawingMode
                                ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400"
                                : "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white hover:scale-[1.02]"
                        )}
                    >
                        {isDrawingMode ? (
                            <><X className="w-3 h-3 mr-2" /> Cancelar Desenho</>
                        ) : (
                            <><MonitorPlay className="w-3 h-3 mr-2" /> Iniciar Desenho Mode</>
                        )}
                    </Button>
                </div>
            </div>

            <p className="text-[7px] text-zinc-400 font-black uppercase tracking-widest text-center opacity-30">Manifest_Doodle // Fullscreen_Edition</p>
        </div>
    )
}
