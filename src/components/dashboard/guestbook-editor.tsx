"use client"

import { useState, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageSquare, Plus, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

export function GuestbookEditor({ highlight }: { highlight?: boolean }) {
    const [title, setTitle] = useState("Meu Mural de Recados")
    const [color, setColor] = useState("#000000")
    const [isPending, startTransition] = useTransition()

    const handleAdd = () => {
        startTransition(async () => {
            await addMoodBlock('guestbook', {
                title,
                color
            }, {
                width: 350,
                height: 400
            })
        })
    }

    return (
        <div className={cn(
            "space-y-4 transition-all duration-500 rounded-2xl",
            highlight ? "ring-2 ring-purple-500/30 bg-purple-50/50 dark:bg-purple-900/10 p-4 -m-4" : ""
        )}>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Guestbook</h2>
            </div>

            <div className="space-y-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Título do Mural</label>
                    <Input
                        placeholder="Ex: Deixe um recado!"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Cor de Destaque</label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 pl-10"
                            />
                            <div
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: color }}
                            />
                        </div>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleAdd}
                    isLoading={isPending}
                    className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] h-11 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar ao Mural
                </Button>
            </div>

            <p className="text-[10px] text-zinc-500 italic leading-relaxed">
                Permite que visitantes deixem mensagens interativas no seu espaço.
            </p>
        </div>
    )
}
