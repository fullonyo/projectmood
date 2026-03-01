"use client"

import { useState, useEffect } from "react"
import { CountdownBlockContent } from "@/lib/validations"
import { cn } from "@/lib/utils"
import { useStudioBlock } from "@/hooks/use-studio-block"
import { Gift, Cake, Calendar, Rocket, Heart, Hourglass, Sparkles, PartyPopper } from "lucide-react"

const ICON_MAP = {
    Gift, Cake, Calendar, Rocket, Heart, Hourglass, Sparkles, PartyPopper
}

interface CountdownBlockPublicProps {
    content: CountdownBlockContent
}

export function SmartCountdown({ content }: CountdownBlockPublicProps) {
    const { title, targetDate, emoji: iconName, style = 'minimal' } = content
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
    const Icon = iconName ? ICON_MAP[iconName as keyof typeof ICON_MAP] : null

    const { ref, fluidScale } = useStudioBlock()

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
        <div ref={ref} className="w-full h-full flex flex-col items-center justify-center p-[5%]" style={{ gap: Math.round(16 * fluidScale) }}>
            <div className={cn(
                "shadow-xl text-center flex flex-col items-center justify-center transition-all duration-500",
                style === 'neon' && "bg-black shadow-pink-500/20",
                style === 'bold' && "bg-white dark:bg-zinc-900 border-black dark:border-white text-black dark:text-white",
                style === 'minimal' && "bg-white/10 dark:bg-black/10 backdrop-blur-xl border-white/10"
            )} style={{
                width: '100%',
                height: '100%',
                padding: Math.round(20 * fluidScale),
                gap: Math.round(16 * fluidScale),
                borderWidth: style === 'neon' ? Math.round(2 * fluidScale) : style === 'bold' ? Math.round(4 * fluidScale) : Math.round(1 * fluidScale),
                borderColor: style === 'neon' ? '#ec4899' : undefined,
                borderStyle: 'solid',
                borderRadius: Math.round(16 * fluidScale)
            }}>
                {Icon && (
                    <div className={cn(
                        "flex justify-center shrink-0",
                        style === 'neon' ? "text-pink-500 animate-pulse" : "text-current"
                    )}>
                        <Icon strokeWidth={1.5} style={{ width: Math.round(48 * fluidScale), height: Math.round(48 * fluidScale) }} />
                    </div>
                )}

                <h3 className={cn(
                    "font-black uppercase tracking-widest leading-tight line-clamp-1",
                    style === 'bold' ? "" : "opacity-60",
                )} style={{ fontSize: Math.round((style === 'bold' ? 24 : 12) * fluidScale) }}>
                    {title}
                </h3>

                {timeLeft.finished ? (
                    <div className={cn(
                        "font-black uppercase tracking-tighter italic",
                        style === 'neon' && "text-pink-400"
                    )} style={{ fontSize: Math.round(24 * fluidScale) }}>
                        O Momento Chegou
                    </div>
                ) : (
                    <div className="flex justify-center items-center w-full grow min-h-0" style={{ gap: Math.round(12 * fluidScale) }}>
                        {[
                            { value: timeLeft.days, label: 'Dias' },
                            { value: timeLeft.hours, label: 'Hrs' },
                            { value: timeLeft.minutes, label: 'Min' },
                            { value: timeLeft.seconds, label: 'Seg' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center flex-1" style={{ gap: Math.round(2 * fluidScale) }}>
                                <div suppressHydrationWarning className={cn(
                                    "font-black tabular-nums tracking-tighter leading-none",
                                    style === 'neon' && "text-pink-400",
                                )} style={{ fontSize: Math.round(28 * fluidScale) }}>
                                    {String(item.value).padStart(2, '0')}
                                </div>
                                <div className="font-bold uppercase tracking-widest opacity-40 whitespace-nowrap" style={{ fontSize: Math.round(7 * fluidScale) }}>
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
