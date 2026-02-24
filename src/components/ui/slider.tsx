"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: number[]
    onValueChange: (value: number[]) => void
    min?: number
    max?: number
    step?: number
}

export function Slider({
    value,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    className,
    ...props
}: SliderProps) {
    return (
        <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[0]}
                onChange={(e) => onValueChange([parseFloat(e.target.value)])}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-none appearance-none cursor-pointer accent-black dark:accent-white"
                {...props}
            />
        </div>
    )
}
