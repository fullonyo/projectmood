"use client"

import { useState, useEffect } from "react"
import { getGuestbookMessages, addGuestbookMessage } from "@/actions/guestbook"
import { MessageSquare, Send, User, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function GuestbookBlock({ block, isPublic = false }: { block: any, isPublic?: boolean }) {
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const { title = "Mural de Recados", color = "#000000" } = block.content as any

    useEffect(() => {
        const loadMessages = async () => {
            const data = await getGuestbookMessages(block.id)
            setMessages(data)
        }
        loadMessages()
    }, [block.id])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        setIsSending(true)
        const res = await addGuestbookMessage(block.id, newMessage)
        if (res.success) {
            setNewMessage("")
            const updated = await getGuestbookMessages(block.id)
            setMessages(updated)
        }
        setIsSending(false)
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden font-sans relative">
            {!isPublic && (
                <div className="absolute inset-0 z-50 bg-transparent cursor-default" />
            )}
            {/* Window Header */}
            <div
                className="px-4 py-2 flex items-center justify-between border-b-2 border-zinc-200 dark:border-zinc-800"
                style={{ backgroundColor: color + '10' }}
            >
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" style={{ color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest italic" style={{ color }}>
                        {title}
                    </span>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                    <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-2 opacity-50">
                        <MessageSquare className="w-8 h-8" />
                        <p className="text-[10px] uppercase font-bold tracking-tighter text-center">
                            Nenhum recado ainda.<br />Seja o primeiro!
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1",
                                    msg.isAdmin ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                )}>
                                    {msg.isAdmin ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                    {msg.author}
                                </div>
                                <span className="text-[8px] text-zinc-400 font-medium uppercase italic">
                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ptBR })}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-zinc-800/50 p-3 rounded-2xl rounded-tl-none border border-zinc-100 dark:border-zinc-800 shadow-sm text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area (Only for public view or if allowed) */}
            {isPublic && (
                <form onSubmit={handleSend} className="p-3 bg-zinc-50 dark:bg-zinc-950 border-t-2 border-zinc-200 dark:border-zinc-800 flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Deixe um recado..."
                        className="flex-1 bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 ring-zinc-200 dark:ring-zinc-800 transition-all outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            )}
        </div>
    )
}
