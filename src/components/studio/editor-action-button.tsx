"use client"

import { Button } from "@/components/ui/button"
import { CornerMark } from "@/components/ui/corner-mark"

/**
 * EditorActionButton — Botão de ação padronizado para editores de blocos.
 *
 * Substitui ~7 instâncias de botões "Deploy/Update" com corner marks idênticos.
 *
 * Suporta dois visuais:
 * - `primary`: bg-black/white com hover invertido
 * - `ghost`: bg-transparent com hover fill
 */

interface EditorActionButtonProps {
    /** Texto do botão */
    children: React.ReactNode
    /** Handler de clique */
    onClick: () => void
    /** Estado desabilitado */
    disabled?: boolean
    /** Variante visual. Default: 'ghost' */
    variant?: 'primary' | 'ghost'
    /** Classes CSS adicionais */
    className?: string
}

export function EditorActionButton({
    children,
    onClick,
    disabled,
    variant = 'ghost',
    className
}: EditorActionButtonProps) {
    const baseClasses = "w-full rounded-none h-14 font-black uppercase tracking-[0.4em] text-[7.5px] transition-all relative group overflow-hidden"

    const variantClasses = variant === 'primary'
        ? "bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-95 shadow-2xl border border-black dark:border-white"
        : "bg-zinc-50 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white border border-zinc-100 dark:border-zinc-800"

    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses} ${className || ''}`}
        >
            <CornerMark position="tr" size="md" />
            <CornerMark
                position="bl"
                size="md"
                opacity="opacity-0 group-hover:opacity-100 transition-opacity"
            />
            {children}
        </Button>
    )
}
