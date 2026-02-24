"use client"

import { useState, useEffect, useMemo } from "react"
import { getGuestbookMessages, addGuestbookMessage } from "@/actions/guestbook"
import { MessageSquare, Send, User, ShieldCheck, Terminal, Zap, Sparkles, StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useStudioBlock } from "@/hooks/use-studio-block"
import { motion, AnimatePresence } from "framer-motion"

interface GuestbookTheme {
    container: string;
    header: string;
    message: string;
    input: string;
    accent: string;
    icon: any;
    extra?: string;
}

/**
 * GuestbookBlock - Studio 3.0 💎🌪️✨
 * Evolução "Além do Container" com suporte a layouts Scattered e Cloud.
 */
export function GuestbookBlock({ block, isPublic = false }: { block: any, isPublic?: boolean }) {
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)

    const {
        title = "Mural de Recados",
        color = "#000000",
        style = "glass",
        layoutMode = "classic",
        density = 1,
        opacity = 1
    } = block.content as any

    // Hook Padronizado Studio + Micro-Aesthetics Calibration
    const { ref, fluidScale: originalScale, isSmall } = useStudioBlock()
    const fluidScale = originalScale * density * 0.85 // Redução base para estética minimalista

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

    // Deterministic Random helper for Scattered mode
    const getSeed = (id: string) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    }

    // Theme Configs
    const themes: Record<'glass' | 'vhs' | 'cyber' | 'paper', GuestbookTheme> = {
        glass: {
            container: "bg-white/10 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/10",
            header: "bg-white/5 border-white/10",
            message: "bg-white/10 border-white/10 text-black dark:text-white backdrop-blur-md",
            input: "bg-white/10 border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30",
            accent: color,
            icon: Sparkles
        },
        vhs: {
            container: "bg-[#050505] border-[#00ff41]/30 font-mono",
            header: "bg-[#00ff41]/10 border-[#00ff41]/20",
            message: "bg-black border-[#00ff41]/10 text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.05)]",
            input: "bg-black border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/20",
            accent: "#00ff41",
            icon: Terminal,
            extra: "vhs-scanlines"
        },
        cyber: {
            container: "bg-zinc-950 border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]",
            header: "bg-zinc-900 border-zinc-800",
            message: "bg-zinc-900/50 border-zinc-800 text-zinc-300",
            input: "bg-zinc-800/50 border-zinc-700 text-white",
            accent: color || "#3b82f6",
            icon: Zap
        },
        paper: {
            container: "bg-[#fdf6e3] border-[#e6e0d0] shadow-xl",
            header: "bg-[#eee8d5] border-[#e6e0d0]",
            message: "bg-white border-[#eee8d5] text-amber-950 shadow-sm",
            input: "bg-white/50 border-[#eee8d5] text-amber-950",
            accent: "#859900",
            icon: StickyNote
        }
    }

    const currentTheme = themes[style as keyof typeof themes] || themes.glass
    const ThemeIcon = currentTheme.icon

    // Layout Classes
    const isScattered = layoutMode === 'scattered'
    const isCloud = layoutMode === 'cloud'

    return (
        <div
            ref={ref}
            className={cn(
                "flex flex-col h-full transition-all duration-700 relative",
                !isScattered && "rounded-none border overflow-hidden",
                !isScattered && currentTheme.container,
                currentTheme.extra
            )}
            style={{ opacity }}
        >
            {/* VHS Effect Overlay - Only if not scattered, or globally if desired */}
            {style === 'vhs' && !isScattered && (
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(rgba(0,255,65,0.5)_0px,rgba(0,255,65,0.5)_1px,transparent_1px,transparent_2px)] z-50" />
            )}

            {!isPublic && (
                <div className="absolute inset-0 z-40 bg-transparent cursor-default" />
            )}

            {/* Registry Header - Hidden in Scattered if small, or ultra minimal */}
            {(layoutMode === 'classic' || !isSmall) && (
                <div
                    className={cn(
                        "flex items-center justify-between shrink-0 transition-colors duration-500",
                        !isScattered && currentTheme.header,
                        !isScattered && "border-b"
                    )}
                    style={{ padding: `${Math.round(8 * fluidScale)}px ${Math.round(14 * fluidScale)}px` }}
                >
                    <div className="flex items-center" style={{ gap: Math.round(8 * fluidScale) }}>
                        <ThemeIcon
                            className="transition-all duration-300"
                            style={{
                                width: Math.round(10 * fluidScale),
                                height: Math.round(10 * fluidScale),
                                color: currentTheme.accent
                            }}
                        />
                        <span
                            className="font-black uppercase tracking-[0.3em] italic truncate"
                            style={{
                                fontSize: Math.round(8 * fluidScale),
                                color: style === 'vhs' ? currentTheme.accent : 'inherit',
                                opacity: 0.6
                            }}
                        >
                            {title}
                        </span>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div
                className={cn(
                    "flex-1 custom-scrollbar relative",
                    isScattered ? "overflow-y-auto" : "overflow-y-auto"
                )}
                style={{
                    padding: Math.round(12 * fluidScale),
                    display: 'flex',
                    flexDirection: isScattered ? 'row' : 'column',
                    flexWrap: isScattered ? 'wrap' : 'nowrap',
                    alignContent: 'flex-start',
                    justifyContent: isScattered ? 'center' : 'flex-start',
                    gap: isScattered ? Math.round(20 * fluidScale) : Math.round(12 * fluidScale)
                }}
            >
                <AnimatePresence mode="popLayout">
                    {messages.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            className="w-full h-full flex flex-col items-center justify-center text-zinc-400"
                            style={{ gap: Math.round(8 * fluidScale) }}
                        >
                            <MessageSquare style={{ width: Math.round(24 * fluidScale), height: Math.round(24 * fluidScale) }} />
                            <p className="uppercase font-bold tracking-tighter text-center" style={{ fontSize: Math.round(8 * fluidScale) }}>
                                No signals yet
                            </p>
                        </motion.div>
                    ) : (
                        messages.map((msg, idx) => {
                            const seed = getSeed(msg.id);
                            const rotation = isScattered ? (seed % 6 - 3) : 0; // -3 to 3 deg

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "group relative z-10 transition-all duration-500",
                                        isScattered ? "w-[120px]" : "w-full"
                                    )}
                                    style={{
                                        rotate: `${rotation}deg`,
                                        width: isScattered ? Math.round(130 * fluidScale) : '100%'
                                    }}
                                >
                                    {/* Scattered Mode Tape 🩹 */}
                                    {isScattered && (
                                        <div
                                            className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity"
                                            style={{
                                                width: Math.round(40 * fluidScale),
                                                height: Math.round(12 * fluidScale),
                                                backgroundColor: style === 'paper' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.2)',
                                                border: '1px solid rgba(0,0,0,0.05)',
                                                transform: `rotate(${rotation * -2}deg)`
                                            }}
                                        />
                                    )}

                                    <div className="flex items-center" style={{ gap: Math.round(6 * fluidScale), marginBottom: Math.round(4 * fluidScale) }}>
                                        <div className={cn(
                                            "rounded-none font-black uppercase tracking-widest flex items-center border transition-all duration-500",
                                            msg.isAdmin
                                                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                                                : "bg-transparent text-zinc-400 border-zinc-500/10"
                                        )} style={{
                                            padding: `${Math.round(1 * fluidScale)}px ${Math.round(6 * fluidScale)}px`,
                                            fontSize: Math.max(5, Math.round(6 * fluidScale)),
                                            gap: Math.round(3 * fluidScale),
                                            borderColor: msg.isAdmin ? currentTheme.accent : 'inherit'
                                        }}>
                                            {msg.isAdmin ? <ShieldCheck style={{ width: Math.round(8 * fluidScale), height: Math.round(8 * fluidScale) }} /> : <User style={{ width: Math.round(8 * fluidScale), height: Math.round(8 * fluidScale) }} />}
                                            <span className="truncate max-w-[80px]">{msg.author}</span>
                                        </div>
                                    </div>

                                    <div
                                        className={cn(
                                            "rounded-none leading-relaxed transition-all duration-500",
                                            isCloud ? "bg-transparent border-none" : "border",
                                            !isCloud && currentTheme.message,
                                            isScattered && "shadow-sm group-hover:shadow-md",
                                            isCloud && "text-center blur-[0.2px] hover:blur-0"
                                        )}
                                        style={{
                                            padding: Math.round(10 * fluidScale),
                                            fontSize: Math.round(10 * fluidScale),
                                            borderLeft: (msg.isAdmin && !isCloud) ? `3px solid ${currentTheme.accent}` : 'inherit',
                                            color: isCloud ? currentTheme.accent : 'inherit',
                                            textShadow: isCloud ? `0 0 ${Math.round(4 * fluidScale)}px ${currentTheme.accent}44` : 'none'
                                        }}
                                    >
                                        {msg.content}
                                    </div>

                                    {isScattered && (
                                        <div className="mt-1 text-right opacity-20 font-black" style={{ fontSize: Math.round(5 * fluidScale) }}>
                                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: false, locale: ptBR })}
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            {isPublic && (
                <form
                    onSubmit={handleSend}
                    className={cn(
                        "flex shrink-0 transition-all duration-700",
                        !isScattered && "border-t",
                        style === 'vhs' ? "bg-black" : "bg-transparent"
                    )}
                    style={{ padding: Math.round(10 * fluidScale), gap: Math.round(8 * fluidScale) }}
                >
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="SIGNAL..."
                        className={cn(
                            "flex-1 border rounded-none focus:ring-1 outline-none uppercase transition-all duration-500 px-3",
                            currentTheme.input,
                            isScattered && "bg-white/5 border-black/10 dark:border-white/10"
                        )}
                        style={{
                            height: Math.round(32 * fluidScale),
                            fontSize: Math.round(9 * fluidScale),
                            borderColor: style === 'vhs' ? `${currentTheme.accent}44` : 'inherit'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="rounded-none flex items-center justify-center hover:scale-[1.05] active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-none border shrink-0"
                        style={{
                            width: Math.round(32 * fluidScale),
                            height: Math.round(32 * fluidScale),
                            backgroundColor: style === 'vhs' ? 'black' : currentTheme.accent,
                            color: 'white',
                            borderColor: currentTheme.accent
                        }}
                    >
                        {isSending ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full" />
                        ) : (
                            <Send style={{ width: Math.round(12 * fluidScale), height: Math.round(12 * fluidScale) }} />
                        )}
                    </button>
                </form>
            )}
        </div>
    )
}
