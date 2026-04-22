"use client"

import { Button } from "@/components/ui/button"
import { Paintbrush, MonitorPlay, X, Activity, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasInteraction } from "./canvas-interaction-context"
import { useTranslation } from "@/i18n/context"
import { MoodBlock } from "@/types/database"
import { EditorHeader, EditorSection } from "./EditorUI"

interface DoodlePadProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onClose?: () => void
}

export function DoodlePad({ block, onUpdate, onClose }: DoodlePadProps) {
    const {
        isDrawingMode, setIsDrawingMode,
    } = useCanvasInteraction()
    const { t } = useTranslation()

    return (
        <div className="space-y-12">
            <EditorHeader 
                title={t('editors.doodle.title') || "Rascunho Livre"}
                subtitle="Expressão Cinética"
                onClose={onClose}
            />

            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <EditorSection title="Modo de Criação">
                    <div className="p-10 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-3xl flex flex-col items-center justify-center space-y-6 relative group transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700/50">
                        {/* HUD Decoration */}
                        <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        
                        <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                            <Paintbrush className="w-8 h-8 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                        </div>

                        <div className="text-center space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-800 dark:text-zinc-200">
                                {t('doodle.fullscreen_canvas')}
                            </h4>
                            <p className="text-[8px] text-zinc-400 uppercase tracking-[0.2em] px-4 leading-relaxed font-bold opacity-60">
                                {t('doodle.fullscreen_desc')}
                            </p>
                        </div>

                        <Button
                            onClick={() => setIsDrawingMode(!isDrawingMode)}
                            className={cn(
                                "w-full h-16 rounded-2xl font-black uppercase tracking-[0.4em] text-[9px] transition-all border-none relative overflow-hidden shadow-lg",
                                isDrawingMode
                                    ? "bg-red-500 text-white hover:bg-red-600 active:scale-95"
                                    : "bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-95"
                            )}
                        >
                            {isDrawingMode ? (
                                <><X className="w-4 h-4 mr-3" /> {t('doodle.cancel_drawing')}</>
                            ) : (
                                <><MonitorPlay className="w-4 h-4 mr-3" /> {t('doodle.start_drawing')}</>
                            )}
                        </Button>
                    </div>
                </EditorSection>

                <div className="flex flex-col items-center gap-4 py-4 opacity-40">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Precision Drawing v2.1</span>
                    </div>
                    <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-widest text-center max-w-[200px]">
                        {t('editors.doodle.manifest') || "Desenhe livremente e nós cuidamos do resto."}
                    </p>
                </div>
            </div>
        </div>
    )
}
