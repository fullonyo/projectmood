"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
        return (
            <label
                className={cn(
                    "inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-zinc-400 focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    checked ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800",
                    className
                )}
            >
                <input
                    type="checkbox"
                    className="sr-only"
                    ref={ref}
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    {...props}
                />
                <span
                    className={cn(
                        "pointer-events-none block h-4 w-4 rounded-full bg-white dark:bg-black shadow-lg ring-0 transition-transform",
                        checked ? "translate-x-4 dark:bg-zinc-900" : "translate-x-0 bg-white"
                    )}
                />
            </label>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
