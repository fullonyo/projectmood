"use client"

import { useState, useEffect, useMemo } from "react"
import { getGuestbookMessages, addGuestbookMessage } from "@/actions/guestbook"
import { MessageSquare, Send, ShieldCheck, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useStudioBlock } from "@/hooks/use-studio-block"
import { motion, AnimatePresence } from "framer-motion"

import { MoodBlock } from "@/types/database"

interface GuestbookTheme {
    accent: string;
    text: string;
    secondary: string;
}

interface GuestbookContent {
    title?: string;
    color?: string;
    style?: string;
    layoutMode?: string;
    density?: number;
    opacity?: number;
}

/**
 * SmartGuestbook - Signature Script Edition 🖋️✨
 * Um layout "Decalque": sem molduras, sem fundos, apenas a essência das mensagens.
 */
export function SmartGuestbook({ block, isPublic = false }: { block: MoodBlock, isPublic?: boolean }) {
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [isInputFocused, setIsInputFocused] = useState(false)

    const content = block.content as GuestbookContent
    const {
        title = "Mural de Recados",
        color = "#3b82f6",
        style = "glass",
        layoutMode = "classic",
        density = 1,
        opacity = 1
    } = content

    const { ref, fluidScale: originalScale } = useStudioBlock()
    const fluidScale = originalScale * density

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

    // Themes focused on direct typography - Memoized for performance
    const themes: Record<string, GuestbookTheme> = useMemo(() => ({
        glass: { accent: color!, text: "text-zinc-900 dark:text-white", secondary: "text-zinc-400 dark:text-zinc-500" },
        onyx: { accent: color || "#ffffff", text: "text-white", secondary: "text-zinc-600" },
        silk: { accent: "#c2a38a", text: "text-zinc-800", secondary: "text-zinc-400" },
        vhs: { accent: "#00ff41", text: "text-[#00ff41]", secondary: "text-[#00ff41]/40" },
        cyber: { accent: "#3b82f6", text: "text-white", secondary: "text-blue-900" }
    }), [color])

    const currentTheme = themes[style!] || themes.glass
    const isStream = layoutMode === 'stream'
    const isScattered = layoutMode === 'scattered' || layoutMode === 'float'

    // Helper to decode HTML entities like &lt; into <
    // React's standard rendering {} will still escape these as text, 
    // so it's safe to decode them here for display.
    const decodeEntities = (html: string) => {
        if (typeof document === 'undefined') return html;
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
    };

    // We use a unique key for the message area to force re-render when layout mode changes
    // ensuring animations and positions reset correctly for the ghost/decal effect
    const layoutKey = `${layoutMode}-${style}`

    return (
        <div
            ref={ref}
            className="flex flex-col h-full transition-all duration-1000 relative group/guestbook bg-transparent border-none shadow-none overflow-visible"
            style={{ opacity }}
        >
            {!isPublic && (
                <div className="absolute inset-0 z-40 bg-transparent cursor-default" />
            )}

            {/* Ghost Title - Editable in Real-time */}
            {title && (
                <div className="px-8 pt-8 pb-2 shrink-0">
                    <h3 
                        className={cn("font-black uppercase tracking-[0.4em] opacity-10 italic", currentTheme.text)}
                        style={{ fontSize: Math.round(10 * fluidScale) }}
                    >
                        {title}
                    </h3>
                </div>
            )}

            {/* Messages Area - Free Flow */}
            <div
                key={layoutKey}
                className={cn(
                    "flex-1 custom-scrollbar relative overflow-y-auto px-8 py-6 animate-in fade-in duration-700",
                    isStream && "flex flex-col",
                    isScattered && "flex flex-row flex-wrap justify-center content-start"
                )}
                style={{ gap: Math.round(32 * fluidScale) }}
            >
                {/* Minimalist Signature Line for Stream Mode - Ultra Faint */}
                {isStream && messages.length > 0 && (
                    <div 
                        className="absolute left-[32px] top-6 bottom-6 w-[0.5px] opacity-10"
                        style={{ backgroundColor: currentTheme.accent }}
                    />
                )}

                <AnimatePresence mode="popLayout">
                    {messages.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            className={cn("w-full h-full flex flex-col items-center justify-center gap-4", currentTheme.text)}
                        >
                            <MessageSquare style={{ width: Math.round(24 * fluidScale), height: Math.round(24 * fluidScale) }} strokeWidth={1} />
                            <p className="uppercase font-black tracking-[0.4em] italic" style={{ fontSize: Math.round(7 * fluidScale) }}>
                                Quiet Wall
                            </p>
                        </motion.div>
                    ) : (
                        messages.map((msg, idx) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, filter: "blur(6px)", y: 10 }}
                                animate={{ 
                                    opacity: 1, 
                                    filter: "blur(0px)",
                                    y: 0,
                                    transition: { delay: idx * 0.05, duration: 1, ease: "easeOut" } 
                                }}
                                className={cn(
                                    "relative group/msg transition-all duration-700",
                                    isScattered ? "w-[160px]" : "w-full max-w-[90%]",
                                    isStream && "pl-10"
                                )}
                                style={layoutMode === 'float' ? {
                                    y: [0, -12, 0],
                                    transition: { 
                                        y: { repeat: Infinity, duration: 5 + (idx % 2), ease: "easeInOut", delay: idx * 0.4 }
                                    }
                                } as any : {}}
                            >
                                {/* Message Content - Direct Wall Writing */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span 
                                            className={cn("text-[8px] font-black uppercase tracking-[0.2em] opacity-20 italic shrink-0", currentTheme.text)}
                                        >
                                            {msg.author}
                                        </span>
                                        {msg.isAdmin && (
                                            <ShieldCheck 
                                                className="w-2 h-2 opacity-10" 
                                                style={{ color: currentTheme.accent }}
                                            />
                                        )}
                                    </div>
                                    
                                    <div
                                        className={cn(
                                            "transition-all duration-1000 relative whitespace-pre-wrap break-words",
                                            currentTheme.text,
                                            !isScattered && "hover:translate-x-1"
                                        )}
                                        style={{
                                            fontSize: Math.round(14 * fluidScale),
                                            lineHeight: 1.6,
                                            letterSpacing: "-0.01em",
                                            fontWeight: 400
                                        }}
                                    >
                                        {decodeEntities(msg.content)}
                                    </div>
                                    
                                    <div className="mt-1 text-[6px] font-bold uppercase tracking-widest opacity-0 group-hover/msg:opacity-10 transition-opacity duration-1000">
                                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: false, locale: ptBR })}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Signature Line - Ultra Minimal Input */}
            {isPublic && (
                <div className="px-6 py-4 shrink-0 relative z-20">
                    <form
                        onSubmit={handleSend}
                        className={cn(
                            "flex items-center gap-4 transition-all duration-700 border-b",
                            isInputFocused ? "opacity-100" : "opacity-20",
                            currentTheme.text
                        )}
                        style={{ 
                            paddingBottom: Math.round(8 * fluidScale),
                            borderColor: isInputFocused ? currentTheme.accent : 'currentColor'
                        }}
                    >
                        <span className="text-[11px] font-medium italic opacity-40 shrink-0 tracking-tight">escreva um rastro...</span>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            placeholder=""
                            className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-0 text-[14px] font-light tracking-wide italic"
                            style={{ height: Math.round(28 * fluidScale) }}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className={cn(
                                "flex items-center justify-center transition-all duration-700",
                                !newMessage.trim() ? "opacity-0 scale-50" : "opacity-100 scale-100"
                            )}
                            style={{ color: currentTheme.accent }}
                        >
                            {isSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}


