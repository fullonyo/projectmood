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
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 rounded-none border border-black dark:border-white overflow-hidden font-mono relative shadow-none">
            {!isPublic && (
                <div className="absolute inset-0 z-50 bg-transparent cursor-default" />
            )}
            {/* Registry Header */}
            <div
                className="px-4 py-3 flex items-center justify-between border-b border-black dark:border-white bg-zinc-50 dark:bg-zinc-900"
            >
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 text-black dark:text-white" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white italic">
                        {title}
                    </span>
                </div>
                <div className="flex gap-1.5 opacity-20">
                    <div className="w-1 h-1 bg-black dark:bg-white animate-pulse" />
                    <div className="w-1 h-1 bg-black dark:bg-white animate-pulse delay-75" />
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
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className={cn(
                                    "px-2 py-0.5 rounded-none text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-zinc-100 dark:border-zinc-800",
                                    msg.isAdmin ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400"
                                )}>
                                    {msg.isAdmin ? <ShieldCheck className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                                    {msg.author}
                                </div>
                                <span className="text-[7px] text-zinc-300 dark:text-zinc-600 font-black uppercase tracking-widest">
                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ptBR })}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-zinc-950 p-4 rounded-none border border-zinc-100 dark:border-zinc-800 shadow-none text-[12px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono">
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            {isPublic && (
                <form onSubmit={handleSend} className="p-3 bg-zinc-50 dark:bg-zinc-900 border-t border-black dark:border-white flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="INPUT_REGISTRY_DATA..."
                        className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-none px-4 py-2 text-[11px] font-mono focus:ring-1 ring-black dark:ring-white transition-all outline-none uppercase"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="w-10 h-10 rounded-none bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-[1.05] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-none border border-black dark:border-white"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </form>
            )}
        </div>
    )
}
