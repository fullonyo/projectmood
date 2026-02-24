"use client"

import { useState, useEffect } from "react"
import { getGuestbookMessages, addGuestbookMessage } from "@/actions/guestbook"
import { MessageSquare, Send, User, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useStudioBlock } from "@/hooks/use-studio-block"

/**
 * GuestbookBlock - Padronizado com Studio FUS 💎
 * Garante que o mural de recados se adapte perfeitamente ao tamanho da caixa.
 */
export function GuestbookBlock({ block, isPublic = false }: { block: any, isPublic?: boolean }) {
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const { title = "Mural de Recados" } = block.content as any

    // Hook Padronizado Studio
    const { ref, fluidScale, isSmall } = useStudioBlock()

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
        <div ref={ref} className="flex flex-col h-full bg-white dark:bg-zinc-950 rounded-none border border-black dark:border-white overflow-hidden font-mono relative shadow-none">
            {!isPublic && (
                <div className="absolute inset-0 z-50 bg-transparent cursor-default" />
            )}

            {/* Registry Header */}
            <div
                className="flex items-center justify-between border-b border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 shrink-0"
                style={{ padding: `${Math.round(10 * fluidScale)}px ${Math.round(16 * fluidScale)}px` }}
            >
                <div className="flex items-center" style={{ gap: Math.round(8 * fluidScale) }}>
                    <MessageSquare className="text-black dark:text-white" style={{ width: Math.round(12 * fluidScale), height: Math.round(12 * fluidScale) }} />
                    <span className="font-black uppercase tracking-[0.3em] text-black dark:text-white italic truncate" style={{ fontSize: Math.round(10 * fluidScale) }}>
                        {title}
                    </span>
                </div>
                {!isSmall && (
                    <div className="flex opacity-20" style={{ gap: Math.round(6 * fluidScale) }}>
                        <div className="bg-black dark:bg-white animate-pulse" style={{ width: Math.round(4 * fluidScale), height: Math.round(4 * fluidScale) }} />
                        <div className="bg-black dark:bg-white animate-pulse delay-75" style={{ width: Math.round(4 * fluidScale), height: Math.round(4 * fluidScale) }} />
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"
                style={{
                    padding: Math.round(16 * fluidScale),
                    backgroundSize: `${Math.round(16 * fluidScale)}px ${Math.round(16 * fluidScale)}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: Math.round(16 * fluidScale)
                }}
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50" style={{ gap: Math.round(8 * fluidScale) }}>
                        <MessageSquare style={{ width: Math.round(32 * fluidScale), height: Math.round(32 * fluidScale) }} />
                        <p className="uppercase font-bold tracking-tighter text-center" style={{ fontSize: Math.round(10 * fluidScale) }}>
                            Nenhum recado ainda
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center" style={{ gap: Math.round(8 * fluidScale), marginBottom: Math.round(6 * fluidScale) }}>
                                <div className={cn(
                                    "rounded-none font-black uppercase tracking-widest flex items-center border border-zinc-100 dark:border-zinc-800",
                                    msg.isAdmin ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400"
                                )} style={{ padding: `${Math.round(2 * fluidScale)}px ${Math.round(8 * fluidScale)}px`, fontSize: Math.max(6, Math.round(8 * fluidScale)), gap: Math.round(4 * fluidScale) }}>
                                    {msg.isAdmin ? <ShieldCheck style={{ width: Math.round(10 * fluidScale), height: Math.round(10 * fluidScale) }} /> : <User style={{ width: Math.round(10 * fluidScale), height: Math.round(10 * fluidScale) }} />}
                                    <span className="truncate max-w-[100px]">{msg.author}</span>
                                </div>
                                {!isSmall && (
                                    <span className="text-zinc-300 dark:text-zinc-600 font-black uppercase tracking-widest" style={{ fontSize: Math.round(7 * fluidScale) }}>
                                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ptBR })}
                                    </span>
                                )}
                            </div>
                            <div className="bg-white dark:bg-zinc-950 rounded-none border border-zinc-100 dark:border-zinc-800 shadow-none text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono" style={{ padding: Math.round(12 * fluidScale), fontSize: Math.round(12 * fluidScale) }}>
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            {isPublic && (
                <form onSubmit={handleSend} className="bg-zinc-50 dark:bg-zinc-900 border-t border-black dark:border-white flex shrink-0" style={{ padding: Math.round(10 * fluidScale), gap: Math.round(8 * fluidScale) }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="MESSAGE..."
                        className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-none focus:ring-1 ring-black dark:ring-white transition-all outline-none uppercase font-mono px-3"
                        style={{ height: Math.round(36 * fluidScale), fontSize: Math.round(11 * fluidScale) }}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="rounded-none bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-[1.05] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-none border border-black dark:border-white shrink-0"
                        style={{ width: Math.round(36 * fluidScale), height: Math.round(36 * fluidScale) }}
                    >
                        <Send style={{ width: Math.round(14 * fluidScale), height: Math.round(14 * fluidScale) }} />
                    </button>
                </form>
            )}
        </div>
    )
}
