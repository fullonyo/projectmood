"use client"

import { useState, useEffect } from "react"
import { CountdownBlockContent } from "@/lib/validations"
import { cn } from "@/lib/utils"

interface CountdownBlockPublicProps {
    content: CountdownBlockContent
}

export function CountdownBlockPublic({ content }: CountdownBlockPublicProps) {
    const { title, targetDate, emoji, style = 'minimal' } = content
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

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
                "rounded-3xl p-8 shadow-xl text-center space-y-6",
                style === 'neon' && "bg-black border-2 border-purple-500 shadow-purple-500/50",
                style === 'bold' && "bg-gradient-to-br from-orange-500 to-pink-500 text-white",
                style === 'minimal' && "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            )}>
                {emoji && <div className="text-6xl">{emoji}</div>}

                <h3 className={cn(
                    "font-bold",
                    style === 'bold' && "text-2xl",
                    style === 'neon' && "text-xl text-purple-400",
                    style === 'minimal' && "text-lg text-zinc-800 dark:text-zinc-200"
                )}>
                    {title}
                </h3>

                {timeLeft.finished ? (
                    <div className="text-4xl font-black">
                        🎉 Aconteceu! 🎉
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
                                    "text-3xl font-black tabular-nums",
                                    style === 'neon' && "text-purple-400 animate-pulse",
                                    style === 'bold' && "text-white",
                                    style === 'minimal' && "text-zinc-800 dark:text-zinc-200"
                                )}>
                                    {String(item.value).padStart(2, '0')}
                                </div>
                                <div className={cn(
                                    "text-xs uppercase tracking-wider",
                                    style === 'neon' && "text-purple-300",
                                    style === 'bold' && "text-white/80",
                                    style === 'minimal' && "text-zinc-500"
                                )}>
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
