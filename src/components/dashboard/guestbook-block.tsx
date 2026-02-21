"use client"

import { useState, useEffect } from "react"
import { getGuestbookMessages, addGuestbookMessage } from "@/actions/guestbook"
import { MessageSquare, Send, User, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useViewportScale } from "@/lib/canvas-scale"

export function GuestbookBlock({ block, isPublic = false }: { block: any, isPublic?: boolean }) {
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const { title = "Mural de Recados", color = "#000000" } = block.content as any
    const scale = useViewportScale()

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
                className="flex items-center justify-between border-b border-black dark:border-white bg-zinc-50 dark:bg-zinc-900"
                style={{ padding: `${Math.round(12 * scale)}px ${Math.round(16 * scale)}px` }}
            >
                <div className="flex items-center" style={{ gap: Math.round(8 * scale) }}>
                    <MessageSquare className="text-black dark:text-white" style={{ width: Math.round(12 * scale), height: Math.round(12 * scale) }} />
                    <span className="font-black uppercase tracking-[0.3em] text-black dark:text-white italic" style={{ fontSize: Math.round(10 * scale) }}>
                        {title}
                    </span>
                </div>
                <div className="flex opacity-20" style={{ gap: Math.round(6 * scale) }}>
                    <div className="bg-black dark:bg-white animate-pulse" style={{ width: Math.round(4 * scale), height: Math.round(4 * scale) }} />
                    <div className="bg-black dark:bg-white animate-pulse delay-75" style={{ width: Math.round(4 * scale), height: Math.round(4 * scale) }} />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]" style={{ padding: Math.round(16 * scale), backgroundSize: `${Math.round(16 * scale)}px ${Math.round(16 * scale)}px`, display: 'flex', flexDirection: 'column', gap: Math.round(16 * scale) }}>
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50" style={{ gap: Math.round(8 * scale) }}>
                        <MessageSquare style={{ width: Math.round(32 * scale), height: Math.round(32 * scale) }} />
                        <p className="uppercase font-bold tracking-tighter text-center" style={{ fontSize: Math.round(10 * scale) }}>
                            Nenhum recado ainda.<br />Seja o primeiro!
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center" style={{ gap: Math.round(8 * scale), marginBottom: Math.round(6 * scale) }}>
                                <div className={cn(
                                    "rounded-none font-black uppercase tracking-widest flex items-center border border-zinc-100 dark:border-zinc-800",
                                    msg.isAdmin ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400"
                                )} style={{ padding: `${Math.round(2 * scale)}px ${Math.round(8 * scale)}px`, fontSize: Math.round(8 * scale), gap: Math.round(4 * scale) }}>
                                    {msg.isAdmin ? <ShieldCheck style={{ width: Math.round(10 * scale), height: Math.round(10 * scale) }} /> : <User style={{ width: Math.round(10 * scale), height: Math.round(10 * scale) }} />}
                                    {msg.author}
                                </div>
                                <span className="text-zinc-300 dark:text-zinc-600 font-black uppercase tracking-widest" style={{ fontSize: Math.round(7 * scale) }}>
                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ptBR })}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-zinc-950 rounded-none border border-zinc-100 dark:border-zinc-800 shadow-none text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono" style={{ padding: Math.round(16 * scale), fontSize: Math.round(12 * scale) }}>
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            {isPublic && (
                <form onSubmit={handleSend} className="bg-zinc-50 dark:bg-zinc-900 border-t border-black dark:border-white flex" style={{ padding: Math.round(12 * scale), gap: Math.round(8 * scale) }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="INPUT_REGISTRY_DATA..."
                        className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-none focus:ring-1 ring-black dark:ring-white transition-all outline-none uppercase font-mono"
                        style={{ padding: `${Math.round(8 * scale)}px ${Math.round(16 * scale)}px`, fontSize: Math.round(11 * scale) }}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="rounded-none bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-[1.05] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-none border border-black dark:border-white"
                        style={{ width: Math.round(40 * scale), height: Math.round(40 * scale) }}
                    >
                        <Send style={{ width: Math.round(14 * scale), height: Math.round(14 * scale) }} />
                    </button>
                </form>
            )}
        </div>
    )
}
