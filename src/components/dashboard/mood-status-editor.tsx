"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smile } from "lucide-react"

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
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowPicker(!showPicker)}
                            className="w-full h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-5xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            {emoji}
                        </button>
                        {showPicker && (
                            <div className="absolute z-50 mt-2">
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </div>
                        )}
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
