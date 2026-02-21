"use client"

import { useState, useEffect } from "react"
import { CountdownBlockContent } from "@/lib/validations"
import { cn } from "@/lib/utils"
import { useViewportScale } from "@/lib/canvas-scale"
import { Gift, Cake, Calendar, Rocket, Heart, Hourglass, Sparkles, PartyPopper } from "lucide-react"

const ICON_MAP = {
    Gift, Cake, Calendar, Rocket, Heart, Hourglass, Sparkles, PartyPopper
}

interface CountdownBlockPublicProps {
    content: CountdownBlockContent
}

export function CountdownBlockPublic({ content }: CountdownBlockPublicProps) {
    const { title, targetDate, emoji: iconName, style = 'minimal' } = content
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
    const Icon = iconName ? ICON_MAP[iconName as keyof typeof ICON_MAP] : null
    const scale = useViewportScale()

    function calculateTimeLeft() {
        const difference = +new Date(targetDate) - +new Date()

        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                finished: false
            }
        }

        return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true }
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    return (
        <div className="w-full h-full flex flex-col items-center justify-center" style={{ padding: Math.round(24 * scale) }}>
            <div className={cn(
                "shadow-xl text-center",
                style === 'neon' && "bg-black shadow-pink-500/20",
                style === 'bold' && "bg-white dark:bg-zinc-900 border-black dark:border-white text-black dark:text-white",
                style === 'minimal' && "bg-white/10 dark:bg-black/10 backdrop-blur-xl border-white/10"
            )} style={{
                minWidth: Math.round(280 * scale),
                padding: Math.round(24 * scale),
                display: 'flex',
                flexDirection: 'column',
                gap: Math.round(24 * scale),
                borderWidth: style === 'neon' ? Math.round(2 * scale) : style === 'bold' ? Math.round(4 * scale) : Math.round(1 * scale),
                borderColor: style === 'neon' ? '#ec4899' : undefined,
                borderStyle: 'solid',
                borderRadius: Math.round(16 * scale)
            }}>
                {Icon && (
                    <div className={cn(
                        "flex justify-center",
                        style === 'neon' ? "text-pink-500 animate-pulse" : "text-current"
                    )}>
                        <Icon strokeWidth={1.5} style={{ width: Math.round(48 * scale), height: Math.round(48 * scale) }} />
                    </div>
                )}

                <h3 className={cn(
                    "font-black uppercase tracking-widest leading-tight",
                    style === 'bold' ? "" : "opacity-60",
                )} style={{ fontSize: style === 'bold' ? Math.round(24 * scale) : Math.round(14 * scale) }}>
                    {title}
                </h3>

                {timeLeft.finished ? (
                    <div className={cn(
                        "font-black uppercase tracking-tighter italic",
                        style === 'neon' && "text-pink-400"
                    )} style={{ fontSize: Math.round(30 * scale) }}>
                        O Momento Chegou
                    </div>
                ) : (
                    <div className="grid grid-cols-4" style={{ gap: Math.round(16 * scale) }}>
                        {[
                            { value: timeLeft.days, label: 'Dias' },
                            { value: timeLeft.hours, label: 'Horas' },
                            { value: timeLeft.minutes, label: 'Min' },
                            { value: timeLeft.seconds, label: 'Seg' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col" style={{ gap: Math.round(4 * scale) }}>
                                <div className={cn(
                                    "font-black tabular-nums tracking-tighter",
                                    style === 'neon' && "text-pink-400",
                                )} style={{ fontSize: Math.round(30 * scale) }}>
                                    {String(item.value).padStart(2, '0')}
                                </div>
                                <div className="font-bold uppercase tracking-widest opacity-40" style={{ fontSize: Math.round(8 * scale) }}>
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    )
}
