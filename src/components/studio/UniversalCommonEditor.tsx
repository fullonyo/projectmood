"use client"
import { MoodBlock } from "@/types/database"
import { useTranslation } from "@/i18n/context"
import { 
    Eye, EyeOff, Lock, Unlock, 
    Layers, MousePointer2, 
    ChevronDown, Trash2, 
    Activity, Gauge
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { EditorHeader } from "./EditorUI"

interface UniversalCommonEditorProps {
    selectedBlocks: MoodBlock[]
    onUpdateBlocks: (ids: string[], updates: Partial<MoodBlock> | ((block: MoodBlock) => Partial<MoodBlock>)) => void
    onClose: () => void
}

export function UniversalCommonEditor({
    selectedBlocks,
    onUpdateBlocks,
    onClose
}: UniversalCommonEditorProps) {
    const { t } = useTranslation()
    const blockIds = selectedBlocks.map(b => b.id)

    // Unified States for Multi-Selection
    const allHidden = selectedBlocks.every(b => b.isHidden)
    const allLocked = selectedBlocks.every(b => b.isLocked)
    
    // Average opacity or mixed
    const opacities = selectedBlocks.map(b => (b.content as any).opacity ?? 1)
    const isMixedOpacity = new Set(opacities).size > 1
    const [localOpacity, setLocalOpacity] = useState(opacities[0])

    const handleUpdateOpacity = (val: number) => {
        setLocalOpacity(val)
        onUpdateBlocks(blockIds, (block) => ({
            content: { ...(block.content || {}), opacity: val }
        }))
    }

    const handleBatchAction = (action: 'hide' | 'lock' | 'delete') => {
        switch (action) {
            case 'hide':
                onUpdateBlocks(blockIds, (b) => ({ isHidden: !allHidden }))
                break
            case 'lock':
                onUpdateBlocks(blockIds, (b) => ({ isLocked: !allLocked }))
                break
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <EditorHeader 
                title="Propriedades Comuns"
                subtitle={`Editando ${selectedBlocks.length} itens simultaneamente`}
                onClose={onClose}
            />

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleBatchAction('hide')}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-95",
                        allHidden 
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                            : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white"
                    )}
                >
                    <div className="flex flex-col items-start">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Visibilidade</span>
                        <span className="text-[10px] font-bold">{allHidden ? 'Oculto' : 'Visível'}</span>
                    </div>
                    {allHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                    onClick={() => handleBatchAction('lock')}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-95",
                        allLocked 
                            ? "bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20" 
                            : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white"
                    )}
                >
                    <div className="flex flex-col items-start">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Proteção</span>
                        <span className="text-[10px] font-bold">{allLocked ? 'Trancado' : 'Livre'}</span>
                    </div>
                    {allLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
            </div>

            {/* Opacity Control */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Opacidade Coletiva</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600">
                        {isMixedOpacity && localOpacity === opacities[0] ? 'Misto' : `${Math.round(localOpacity * 100)}%`}
                    </span>
                </div>
                <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={localOpacity}
                    onChange={(e) => handleUpdateOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-3 px-1">
                    <span className="text-[8px] font-bold text-zinc-400 uppercase">0%</span>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase">100%</span>
                </div>
            </div>

            {/* Layout Order (Batch Z-Index) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Camadas em Bloco</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => {
                            const maxZ = Math.max(...selectedBlocks.map(b => b.zIndex || 0))
                            onUpdateBlocks(blockIds, { zIndex: maxZ + 10 })
                        }}
                        className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-blue-500 transition-all text-[9px] font-bold uppercase tracking-wider"
                    >
                        Trazer p/ Frente
                    </button>
                    <button 
                        onClick={() => {
                            const minZ = Math.min(...selectedBlocks.map(b => b.zIndex || 10))
                            onUpdateBlocks(blockIds, { zIndex: Math.max(1, minZ - 10) })
                        }}
                        className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-blue-500 transition-all text-[9px] font-bold uppercase tracking-wider"
                    >
                        Enviar p/ Trás
                    </button>
                </div>
            </div>

            {/* Quick Utility Actions */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <button
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
                >
                    <MousePointer2 className="w-3 h-3" />
                    Limpar Seleção
                </button>

                <button
                    onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir esses ${selectedBlocks.length} itens?`)) {
                            onUpdateBlocks(blockIds, { isDeleted: true } as any)
                            onClose()
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-red-500 transition-all"
                >
                    <Trash2 className="w-3 h-3" />
                    Excluir Seleção
                </button>
            </div>
        </div>
    )
}
