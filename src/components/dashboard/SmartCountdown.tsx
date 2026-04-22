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
        <div ref={ref} className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden text-zinc-900 dark:text-zinc-100" style={{ 
            padding: Math.round(16 * fluidScale),
            gap: Math.round(12 * fluidScale) 
        }}>
            {Icon && (
                <div className={cn(
                    "flex justify-center shrink-0 mb-2",
                    style === 'neon' ? "text-pink-500 animate-pulse" : "text-current"
                )}>
                    <Icon 
                        strokeWidth={style === 'bold' ? 2.5 : 1.5} 
                        style={{ 
                            width: Math.round(42 * fluidScale), 
                            height: Math.round(42 * fluidScale),
                            filter: style === 'neon' ? 'drop-shadow(0 0 10px rgba(236,72,153,0.4))' : 'none'
                        }} 
                    />
                </div>
            )}

            <h3 className={cn(
                "font-black uppercase tracking-[0.3em] leading-tight line-clamp-1 text-center",
                style === 'bold' ? "opacity-100" : "opacity-40",
            )} style={{ fontSize: Math.round(10 * fluidScale) }}>
                {title}
            </h3>

            {timeLeft.finished ? (
                <div className={cn(
                    "font-black uppercase tracking-tighter italic text-center",
                    style === 'neon' ? "text-pink-400" : "text-current"
                )} style={{ fontSize: Math.round(20 * fluidScale) }}>
                    O Momento Chegou
                </div>
            ) : (
                <div className="flex justify-center items-center w-full grow min-h-0" style={{ gap: Math.round(16 * fluidScale) }}>
                    {[
                        { value: timeLeft.days, label: 'Dias' },
                        { value: timeLeft.hours, label: 'Hrs' },
                        { value: timeLeft.minutes, label: 'Min' },
                        { value: timeLeft.seconds, label: 'Seg' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1" style={{ gap: Math.round(4 * fluidScale) }}>
                            <div suppressHydrationWarning className={cn(
                                "font-black tabular-nums tracking-tighter leading-none",
                                style === 'neon' ? "text-pink-400" : "text-current",
                                style === 'bold' && "scale-110"
                            )} style={{ 
                                fontSize: Math.round(32 * fluidScale),
                                textShadow: style === 'neon' ? '0 0 15px rgba(236,72,153,0.3)' : 'none'
                            }}>
                                {String(item.value).padStart(2, '0')}
                            </div>
                            <div className="font-bold uppercase tracking-[0.2em] opacity-30 whitespace-nowrap" style={{ fontSize: Math.round(7 * fluidScale) }}>
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div >
    )
}
