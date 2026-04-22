"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Palette, X, ChevronRight, Sparkles, Loader2 } from "lucide-react"
import { useState } from "react"

interface EditorHeaderProps {
    title: string
    subtitle?: string
    onClose?: () => void
}

export function EditorHeader({ title, subtitle, onClose }: EditorHeaderProps) {
    return (
        <div className="relative mb-8 pt-2">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] text-zinc-900 dark:text-white break-words">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shrink-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="h-[1px] w-full bg-gradient-to-r from-zinc-200 dark:from-zinc-800 to-transparent mt-6" />
        </div>
    )
}

interface ListSelectorProps {
    options: { id: string; label: string }[]
    activeId: string
    onChange: (id: string) => void
    id?: string
}

export function ListSelector({ options, activeId, onChange, id }: ListSelectorProps) {
    return (
        <div className="flex flex-col gap-1">
            {options.map(option => (
                <button
                    key={option.id}
                    onClick={() => onChange(option.id)}
                    className={cn(
                        "w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between group",
                        activeId === option.id 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                            : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                    )}
                >
                    {option.label}
                    {activeId === option.id && (
                        <motion.div 
                            layoutId={`list-active-dot-${id || 'default'}`} 
                            className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                        />
                    )}
                </button>
            ))}
        </div>
    )
}

interface EditorSectionProps {
    title: string
    children: React.ReactNode
    description?: string
}

export function EditorSection({ title, children, description }: EditorSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1 px-1">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                    {title}
                </h4>
                {description && (
                    <p className="text-[10px] text-zinc-400/60 font-medium leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    )
}

interface PillSelectorProps<T> {
    options: { id: T, label: string, icon?: any }[]
    activeId: T
    onChange: (id: T) => void
    variant?: 'standard' | 'scroll' | 'ghost'
}

export function PillSelector<T extends string>({ options, activeId, onChange, variant = 'standard' }: PillSelectorProps<T>) {
    const isGhost = variant === 'ghost'

    return (
        <div className={cn(
            "flex p-1 rounded-2xl transition-all",
            !isGhost && "bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800",
            variant === 'scroll' ? "overflow-x-auto no-scrollbar" : "w-full"
        )}>
            {options.map((opt) => {
                const active = activeId === opt.id
                const Icon = opt.icon
                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={cn(
                            "relative flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                            active ? "text-zinc-900 dark:text-white" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
                            variant === 'scroll' && "flex-none"
                        )}
                    >
                        {active && (
                            <motion.div
                                layoutId="pill-active"
                                className={cn(
                                    "absolute inset-0 shadow-sm rounded-xl border border-black/5 dark:border-white/5",
                                    isGhost ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" : "bg-white dark:bg-zinc-800"
                                )}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5 truncate">
                            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                            <span className="truncate">{opt.label}</span>
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

interface GridSelectorProps<T> {
    options: { id: T, label: string, icon: any, color?: string }[]
    activeId: T | T[]
    onChange: (id: T) => void
    columns?: number
    variant?: 'circle' | 'card' | 'ghost'
    id?: string
}

export function GridSelector<T extends string>({ options, activeId, onChange, columns = 4, variant = 'card', id = 'default' }: GridSelectorProps<T>) {
    const isSelected = (id: T) => Array.isArray(activeId) ? activeId.includes(id) : activeId === id
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    return (
        <div className={cn(
            "grid gap-3",
            columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : columns === 4 ? "grid-cols-4" : columns === 5 ? "grid-cols-5" : "grid-cols-4"
        )}>
            {options.map((opt) => {
                const Icon = opt.icon
                const active = isSelected(opt.id)

                if (variant === 'ghost') {
                    return (
                        <div key={opt.id} className="relative flex items-center justify-center">
                            <button
                                onClick={() => onChange(opt.id)}
                                onMouseEnter={() => setHoveredId(opt.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                className={cn(
                                    "flex items-center justify-center p-4 transition-all relative group",
                                    active ? "scale-110" : "hover:scale-105 opacity-40 hover:opacity-100"
                                )}
                            >
                                {Icon && <Icon 
                                    className={cn("w-8 h-8 transition-colors", !active && "text-zinc-400")} 
                                    style={active ? { color: opt.color || '#3b82f6' } : {}}
                                />}
                                {active && (
                                    <motion.div 
                                        layoutId={`${id}-active`}
                                        className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500" 
                                    />
                                )}
                            </button>

                            <AnimatePresence>
                                {hoveredId === opt.id && opt.label && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: -45, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute z-50 pointer-events-none whitespace-nowrap bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg shadow-xl border border-white/10"
                                    >
                                        {opt.label}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 dark:bg-white rotate-45" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                }

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

interface EditorListSelectorProps<T> {
    options: { id: T, label: string, icon?: any }[]
    activeId: T
    onChange: (id: T) => void
    maxHeight?: string
}

export function EditorListSelector<T extends string>({ options, activeId, onChange, maxHeight = "max-h-64" }: EditorListSelectorProps<T>) {
    return (
        <div className={cn("overflow-y-auto custom-scrollbar px-1", maxHeight)}>
            <div className="space-y-1">
                {options.map((opt) => {
                    const active = activeId === opt.id
                    const Icon = opt.icon
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onChange(opt.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase transition-all",
                                active 
                                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg shadow-black/5" 
                                    : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <span className="truncate pr-2">{opt.label}</span>
                            {active && (
                                Icon ? <Icon className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

interface EditorActionButtonProps {
    onClick: () => void
    disabled?: boolean
    isLoading?: boolean
    label: string
    variant?: 'primary' | 'danger'
    icon?: any
}

export function EditorActionButton({ onClick, disabled, isLoading, label, variant = 'primary', icon: Icon }: EditorActionButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={cn(
                "w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg relative group overflow-hidden border-none flex items-center justify-center gap-3",
                variant === 'danger' 
                    ? "bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40 shadow-red-500/10"
                    : "bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100"
            )}
        >
            <div className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    Icon && <Icon className="w-4 h-4" />
                )}
                {isLoading ? "Processando..." : label}
            </div>
            <div className={cn(
                "absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300",
                variant === 'danger' ? "bg-red-500/5" : "bg-white/10 dark:bg-black/10"
            )} />
        </button>
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
    variant?: 'standard' | 'ghost'
}

export function EditorSlider({ value, min, max, step = 1, onChange, label, unit = '', icon: Icon, variant = 'standard' }: EditorSliderProps) {
    const isGhost = variant === 'ghost'

    return (
        <div className={cn(
            "transition-all",
            isGhost ? "p-1 space-y-3" : "bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6"
        )}>
            <div className="flex justify-between items-center px-1 gap-2">
                {label && (
                    <Label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider truncate">
                        {label}
                    </Label>
                )}
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                        {value}{unit}
                    </span>
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
    variant?: 'standard' | 'ghost'
}

export function EditorColorPicker({ value, onChange, label, variant = 'standard' }: EditorColorPickerProps) {
    const isGhost = variant === 'ghost'

    return (
        <div className={cn(
            "flex items-center gap-4 transition-all",
            isGhost ? "p-1" : "bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm"
        )}>
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
