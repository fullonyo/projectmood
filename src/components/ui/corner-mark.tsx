import { cn } from "@/lib/utils"

/**
 * CornerMark — Elemento decorativo de canto do design system.
 *
 * Substitui ~50 instâncias inline de:
 * ```tsx
 * <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white" />
 * ```
 *
 * Suporta múltiplos tamanhos e posições, com opacidade e animação opcionais.
 */

type CornerPosition = 'tr' | 'tl' | 'br' | 'bl'
type CornerSize = 'xs' | 'sm' | 'md' | 'lg'

interface CornerMarkProps {
    /** Posição do canto. Default: 'tr' (top-right) */
    position?: CornerPosition
    /** Tamanho do marcador. Default: 'xs' */
    size?: CornerSize
    /** Opacidade CSS (ex: 'opacity-20', 'opacity-0 group-hover:opacity-100') */
    opacity?: string
    /** Classes CSS adicionais */
    className?: string
}

const SIZE_MAP: Record<CornerSize, string> = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-4 h-4',
}

const POSITION_MAP: Record<CornerPosition, { classes: string; borders: string }> = {
    tr: { classes: 'top-0 right-0', borders: 'border-t border-r' },
    tl: { classes: 'top-0 left-0', borders: 'border-t border-l' },
    br: { classes: 'bottom-0 right-0', borders: 'border-b border-r' },
    bl: { classes: 'bottom-0 left-0', borders: 'border-b border-l' },
}

export function CornerMark({
    position = 'tr',
    size = 'xs',
    opacity,
    className
}: CornerMarkProps) {
    const pos = POSITION_MAP[position]
    return (
        <div
            className={cn(
                "absolute border-black dark:border-white",
                pos.classes,
                pos.borders,
                SIZE_MAP[size],
                opacity,
                className
            )}
        />
    )
}
