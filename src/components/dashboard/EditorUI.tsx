"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Palette, Zap } from "lucide-react"

interface EditorHeaderProps {
    title: string
    subtitle?: string
    onClose?: () => void
}

export function EditorHeader({ title, subtitle, onClose }: EditorHeaderProps) {
    return (
        <header className="px-1 space-y-1.5 mb-8 relative flex items-start justify-between">
            <div className="space-y-1.5 flex-1 pr-8">
                <h3 className="text-[13px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider leading-tight">{title}</h3>
                {subtitle && <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{subtitle}</p>}
            </div>
            {onClose && (
                <button 
                    onClick={onClose}
                    className="p-2 -mr-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors group"
                >
                    <div className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </div>
                </button>
            )}
        </header>
    )
}

interface EditorSectionProps {
    title?: string
    subtitle?: string
    children: React.ReactNode
    className?: string
}

export function EditorSection({ title, subtitle, children, className }: EditorSectionProps) {
    return (
        <section className={cn("space-y-4", className)}>
            {(title || subtitle) && (
                <header className="px-1 space-y-1">
                    {title && <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{title}</h4>}
                    {subtitle && <p className="text-[9px] text-zinc-400 font-medium leading-relaxed">{subtitle}</p>}
                </header>
            )}
            {children}
        </section>
    )
}

interface PillSelectorProps<T> {
    options: { id: T; label: string; icon?: any }[]
    activeId: T
    onChange: (id: T) => void
    columns?: number
    variant?: 'grid' | 'scroll'
}

export function PillSelector<T extends string>({ 
    options, 
    activeId, 
    onChange, 
    columns = 3,
    variant = 'grid'
}: PillSelectorProps<T>) {
    if (variant === 'scroll') {
        return (
            <div className="flex gap-2 overflow-x-auto pb-2 px-1 custom-scrollbar snap-x">
                {options.map((opt) => {
                    const isActive = activeId === opt.id
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onChange(opt.id)}
                            className={cn(
                                "px-5 py-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider snap-start shrink-0 transition-all",
                                isActive
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                            )}
                        >
                            {opt.label}
                        </button>
                    )
                })}
            </div>
        )
    }

    return (
        <div className={cn(
            "p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl grid gap-1",
            columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : columns === 4 ? "grid-cols-4" : columns === 6 ? "grid-cols-6" : "grid-cols-3"
        )}>
            {options.map((opt) => {
                const Icon = opt.icon
                const isActive = activeId === opt.id
                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={cn(
                            "flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all relative group",
                            isActive
                                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5"
                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        {Icon && <Icon className={cn("w-4 h-4 mb-1.5 transition-transform", isActive && "scale-110")} />}
                        <span className={cn("text-[8px] font-bold uppercase tracking-tight text-center truncate w-full whitespace-nowrap px-1 leading-tight")}>
                            {opt.label}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

interface GridSelectorProps<T> {
    options: { id: T; label?: string; icon?: any; color?: string }[]
    activeId: T | T[]
    onChange: (id: T) => void
    columns?: number
    variant?: 'circle' | 'card'
}

export function GridSelector<T extends string>({ options, activeId, onChange, columns = 4, variant = 'card' }: GridSelectorProps<T>) {
    const isSelected = (id: T) => Array.isArray(activeId) ? activeId.includes(id) : activeId === id

    return (
        <div className={cn(
            "grid gap-3",
            columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : columns === 4 ? "grid-cols-4" : columns === 5 ? "grid-cols-5" : "grid-cols-4"
        )}>
            {options.map((opt) => {
                const Icon = opt.icon
                const active = isSelected(opt.id)

                if (variant === 'circle') {
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onChange(opt.id)}
                            className={cn(
                                "w-10 h-10 rounded-full border-2 transition-all relative group shadow-sm flex items-center justify-center",
                                active
                                    ? "border-blue-500 scale-110 ring-4 ring-blue-500/10"
                                    : "border-white dark:border-zinc-800 hover:scale-110"
                            )}
                            style={opt.color ? { backgroundColor: opt.color } : {}}
                        >
                            {Icon && <Icon className={cn("w-4 h-4", active ? "text-blue-600" : "text-zinc-400")} />}
                            {opt.color && <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 bg-white" />}
                        </button>
                    )
                }

                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={cn(
                            "flex flex-col items-center justify-center p-3 transition-all rounded-2xl border",
                            active
                                ? "bg-white dark:bg-zinc-800 border-blue-500 shadow-md ring-1 ring-blue-500/20 text-blue-600 dark:text-blue-400"
                                : "bg-zinc-50 dark:bg-zinc-900 border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center mb-2 transition-all",
                            active ? "bg-blue-50 dark:bg-blue-900/30" : "bg-white dark:bg-zinc-800 shadow-sm"
                        )}>
                            {Icon && <Icon className="w-4 h-4" />}
                            {opt.color && <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: opt.color }} />}
                        </div>
                        {opt.label && <span className="text-[8px] font-bold uppercase tracking-tight text-center truncate w-full whitespace-nowrap px-1 leading-tight">{opt.label}</span>}
                    </button>
                )
            })}
        </div>
    )
}

interface EditorActionButtonProps {
    onClick: () => void
    disabled?: boolean
    isLoading?: boolean
    label: string
    variant?: 'primary' | 'danger'
}

export function EditorActionButton({ onClick, disabled, isLoading, label, variant = 'primary' }: EditorActionButtonProps) {
    return (
        <Button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={cn(
                "w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg relative group overflow-hidden border-none",
                variant === 'danger' 
                    ? "bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40 shadow-red-500/10"
                    : "bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100"
            )}
        >
            {isLoading ? "Processando..." : label}
            <div className={cn(
                "absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300",
                variant === 'danger' ? "bg-red-500/5" : "bg-white/10 dark:bg-black/10"
            )} />
        </Button>
    )
}

interface EditorSliderProps {
    value: number
    min: number
    max: number
    step?: number
    onChange: (val: number) => void
    label?: string
    unit?: string
    icon?: any
}

export function EditorSlider({ value, min, max, step = 1, onChange, label, unit = '', icon: Icon }: EditorSliderProps) {
    return (
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center px-1">
                {label && <Label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">{label}</Label>}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{value}{unit}</span>
                    {Icon && <Icon className="w-3.5 h-3.5 text-zinc-300" />}
                </div>
            </div>
            <Slider
                value={[value]}
                min={min}
                max={max}
                step={step}
                onValueChange={([v]) => onChange(v)}
                className="py-2"
            />
        </div>
    )
}

interface EditorColorPickerProps {
    value: string
    onChange: (val: string) => void
    label?: string
}

export function EditorColorPicker({ value, onChange, label }: EditorColorPickerProps) {
    return (
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
                <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl pl-12 h-12 text-[11px] font-mono focus-visible:ring-1 focus-visible:ring-blue-500/20"
                />
            </div>
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer bg-zinc-100 dark:bg-zinc-900 border-none p-1 shadow-inner ring-1 ring-black/5"
            />
        </div>
    )
}

interface EditorSwitchProps {
    value: boolean
    onChange: (val: boolean) => void
    label: string
    icon?: any
}

export function EditorSwitch({ value, onChange, label, icon: Icon }: EditorSwitchProps) {
    return (
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
                {Icon && <Icon className={cn("w-4 h-4", value ? "text-blue-500" : "text-zinc-300")} />}
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</Label>
            </div>
            <button
                onClick={() => onChange(!value)}
                className={cn(
                    "w-11 h-6 rounded-full transition-all relative outline-none",
                    value ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" : "bg-zinc-200 dark:bg-zinc-800"
                )}
            >
                <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    value ? "left-6" : "left-1"
                )} />
            </button>
        </div>
    )
}
