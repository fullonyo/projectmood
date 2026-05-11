"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"

export function LiveCurators() {
    const [count, setCount] = useState(84)

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => {
                const change = Math.floor(Math.random() * 3) - 1 // -1, 0, ou +1
                return Math.max(78, Math.min(prev + change, 120))
            })
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex items-center gap-2 text-zinc-500">
            <Users className="w-3 h-3 opacity-40" />
            <span className="text-[9px] uppercase font-black tracking-widest">
                {count} curadores <span className="text-zinc-700 font-medium">sintonizados</span>
            </span>
        </div>
    )
}
