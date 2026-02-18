"use client"

import { useState, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"

const TAPES = [
    { name: 'Classic White', color: 'rgba(255, 255, 255, 0.4)', pattern: 'none' },
    { name: 'Vintage Paper', color: 'rgba(245, 245, 220, 0.6)', pattern: 'grain' },
    { name: 'Sky Blue', color: 'rgba(186, 225, 255, 0.5)', pattern: 'none' },
    { name: 'Rose Petal', color: 'rgba(255, 179, 186, 0.5)', pattern: 'none' },
    { name: 'Mint Leaf', color: 'rgba(186, 255, 201, 0.5)', pattern: 'none' },
    { name: 'Washi Dot', color: 'rgba(255, 255, 255, 0.5)', pattern: 'dots' },
]

export function ArtTools({ highlight }: { highlight?: boolean }) {
    const [isPending, startTransition] = useTransition()

    const addTape = (tape: typeof TAPES[0]) => {
        startTransition(async () => {
            await addMoodBlock('tape', {
                color: tape.color,
                pattern: tape.pattern
            }, { x: 20, y: 20 })
        })
    }

    const addWeather = () => {
        const location = prompt("Aonde você está?", "Na beira do abismo")
        const vibe = prompt("Como está o clima aí?", "Chuva de nostalgia")
        if (!location || !vibe) return

        startTransition(async () => {
            await addMoodBlock('weather', { location, vibe }, { x: 30, y: 30 })
        })
    }

    const addMedia = (category: 'book' | 'movie') => {
        const title = prompt(`O que você está ${category === 'book' ? 'lendo' : 'vendo'}?`)
        const review = prompt("Resuma em 3 palavras:")
        if (!title || !review) return

        startTransition(async () => {
            await addMoodBlock('media', { title, category, review }, { x: 40, y: 40 })
        })
    }

    return (
        <div className={cn(
            "space-y-6 transition-all duration-500 rounded-2xl",
            highlight ? "ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 p-4 -m-4" : ""
        )}>
            <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Scrapbook Tools</h2>

                <div className="grid grid-cols-3 gap-2">
                    {TAPES.map((tape) => (
                        <button
                            key={tape.name}
                            onClick={() => addTape(tape)}
                            disabled={isPending}
                            title={tape.name}
                            className="h-8 rounded-md border border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-105"
                            style={{
                                backgroundColor: tape.color,
                                backgroundImage: tape.pattern === 'dots' ? 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)' : 'none',
                                backgroundSize: '4px 4px'
                            }}
                        />
                    ))}
                </div>
                <p className="text-[10px] text-zinc-500 italic text-center">Clique para adicionar fitas adesivas (Tape)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={addWeather}
                    disabled={isPending}
                    className="rounded-xl border-dashed py-6 flex flex-col gap-1"
                >
                    <span className="text-xs font-bold">Clima Poético</span>
                    <span className="text-[9px] opacity-50">Weather Aesthetic</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addMedia('book')}
                    disabled={isPending}
                    className="rounded-xl border-dashed py-6 flex flex-col gap-1"
                >
                    <span className="text-xs font-bold">Lendo/Vendo</span>
                    <span className="text-[9px] opacity-50">Reading/Watching</span>
                </Button>
            </div>
        </div>
    )
}
