"use client"

import { Button } from "@/components/ui/button"
import { Brush, Paintbrush, MonitorPlay, X, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasInteraction } from "./canvas-interaction-context"
import { useTranslation } from "@/i18n/context"



import { MoodBlock } from "@/types/database"

interface DoodlePadProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onClose?: () => void
}

export function DoodlePad({ block, onUpdate, onClose }: DoodlePadProps) {
    const {
        isDrawingMode, setIsDrawingMode,
        brushColor, setBrushColor,
        brushSize, setBrushSize
    } = useCanvasInteraction()
    const { t } = useTranslation()

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-2 opacity-30 px-1">
                <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
                <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('editors.doodle.title')}</h3>
            </header>

            <div className="bg-zinc-100 dark:bg-zinc-900 gap-[1px] grid border border-zinc-200 dark:border-zinc-800">
                {/* Hero / Action Area */}
                <div className="p-8 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center space-y-6 relative group">
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white opacity-20 group-hover:opacity-100 transition-opacity" />

                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center transition-transform group-hover:scale-110">
                        <Paintbrush className="w-6 h-6 text-zinc-400" />
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('doodle.fullscreen_canvas')}</p>
                        <p className="text-[7px] text-zinc-400 uppercase tracking-[0.4em] px-4 leading-relaxed font-black opacity-50">{t('doodle.fullscreen_desc')}</p>
                    </div>

                    <Button
                        onClick={() => setIsDrawingMode(!isDrawingMode)}
                        className={cn(
                            "w-full h-14 rounded-none font-black uppercase tracking-[0.4em] text-[7.5px] transition-all border relative overflow-hidden",
                            isDrawingMode
                                ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                                : "bg-white dark:bg-zinc-950 text-black dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"
                        )}
                    >
                        {isDrawingMode ? (
                            <><X className="w-3 h-3 mr-2" /> {t('doodle.cancel_drawing')}</>
                        ) : (
                            <><MonitorPlay className="w-3 h-3 mr-2" /> {t('doodle.start_drawing')}</>
                        )}
                    </Button>
                </div>
            </div>

            <p className="text-[7px] text-zinc-400 font-black uppercase tracking-widest text-center opacity-30">{t('editors.doodle.manifest')}</p>
        </div>
    )
}
