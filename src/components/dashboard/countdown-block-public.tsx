"use client"

import { useState, useEffect } from "react"
import { CountdownBlockContent } from "@/lib/validations"
import { cn } from "@/lib/utils"
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
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div className={cn(
                "rounded-3xl p-8 shadow-xl text-center space-y-6 min-w-[280px]",
                style === 'neon' && "bg-black border-2 border-pink-500 shadow-pink-500/20",
                style === 'bold' && "bg-white dark:bg-zinc-900 border-4 border-black dark:border-white text-black dark:text-white",
                style === 'minimal' && "bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20"
            )}>
                {Icon && (
                    <div className={cn(
                        "flex justify-center",
                        style === 'neon' ? "text-pink-500 animate-pulse" : "text-current"
                    )}>
                        <Icon className="w-12 h-12" strokeWidth={1.5} />
                    </div>
                )}

                <h3 className={cn(
                    "font-black uppercase tracking-widest leading-tight",
                    style === 'bold' ? "text-2xl" : "text-sm opacity-60",
                )}>
                    {title}
                </h3>

                {timeLeft.finished ? (
                    <div className={cn(
                        "text-3xl font-black uppercase tracking-tighter italic",
                        style === 'neon' && "text-pink-400"
                    )}>
                        O Momento Chegou
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { value: timeLeft.days, label: 'Dias' },
                            { value: timeLeft.hours, label: 'Horas' },
                            { value: timeLeft.minutes, label: 'Min' },
                            { value: timeLeft.seconds, label: 'Seg' }
                        ].map((item, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className={cn(
                                    "text-3xl font-black tabular-nums tracking-tighter",
                                    style === 'neon' && "text-pink-400",
                                )}>
                                    {String(item.value).padStart(2, '0')}
                                </div>
                                <div className="text-[8px] font-bold uppercase tracking-widest opacity-40">
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
