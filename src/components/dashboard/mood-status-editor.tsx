"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smile } from "lucide-react"
import { cn } from "@/lib/utils"

// Dynamic import to avoid SSR issues with emoji picker
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

interface MoodStatusEditorProps {
    onAdd: (content: any) => void
}

export function MoodStatusEditor({ onAdd }: MoodStatusEditorProps) {
    const [emoji, setEmoji] = useState("😊")
    const [text, setText] = useState("")
    const [showPicker, setShowPicker] = useState(false)

    const handleAdd = () => {
        if (!text.trim()) return

        onAdd({
            emoji,
            text: text.trim(),
            timestamp: new Date().toISOString()
        })

        // Reset form
        setText("")
        setEmoji("😊")
    }

    const handleEmojiClick = (emojiData: any) => {
        setEmoji(emojiData.emoji)
        setShowPicker(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <Smile className="w-4 h-4 text-zinc-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Mood Status</h3>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Emoji</Label>
                    <div className="flex flex-col gap-3">
                        {/* Quick Selection Row */}
                        <div className="flex flex-wrap gap-2 p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            {['😊', '✨', '🔥', '🍕', '🎉', '😴', '🧠', '🌈', '💖', '💀'].map(e => (
                                <button
                                    key={e}
                                    onClick={() => setEmoji(e)}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center text-lg rounded-lg transition-all hover:scale-125",
                                        emoji === e ? "bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700" : "opacity-60 hover:opacity-100"
                                    )}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>

                        <div className="relative group">
                            <button
                                type="button"
                                onClick={() => setShowPicker(!showPicker)}
                                className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-4xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border-2 border-dashed border-zinc-200 dark:border-zinc-700"
                            >
                                {emoji}
                                <span className="absolute bottom-1 right-2 text-[8px] font-black uppercase opacity-0 group-hover:opacity-40 tracking-tighter">Escolher Outro</span>
                            </button>
                            {showPicker && (
                                <div className="absolute z-50 mt-2 left-0 right-0">
                                    <EmojiPicker onEmojiClick={handleEmojiClick} width="100%" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Seu mood agora
                    </Label>
                    <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ex: Inspirado e criativo!"
                        maxLength={50}
                    />
                    <span className="text-[10px] text-zinc-400">{text.length}/50</span>
                </div>

                <Button
                    onClick={handleAdd}
                    disabled={!text.trim()}
                    className="w-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
                >
                    Adicionar Status
                </Button>
            </div>
        </div>
    )
}
