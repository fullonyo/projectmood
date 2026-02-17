"use client"

import { useState, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Type } from "lucide-react"

export function TextEditor() {
    const [text, setText] = useState("")
    const [isPending, startTransition] = useTransition()

    const handleAdd = () => {
        if (!text.trim()) return
        startTransition(async () => {
            await addMoodBlock('text', { text })
            setText("")
        })
    }

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Adicionar Texto</h2>
            <div className="space-y-3">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escreva algo poético..."
                    className="w-full h-32 p-4 rounded-[2rem] bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 resize-none text-sm placeholder:italic"
                />
                <Button
                    onClick={handleAdd}
                    disabled={!text.trim() || isPending}
                    isLoading={isPending}
                    className="w-full rounded-full gap-2"
                >
                    <Type className="w-4 h-4" />
                    Adicionar ao Espaço
                </Button>
            </div>
        </div>
    )
}
