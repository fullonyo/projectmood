/**
 * Constantes compartilhadas entre editores de blocos.
 *
 * Centraliza BLEND_MODES, FRAMES e demais constantes que antes estavam
 * duplicadas em múltiplos arquivos de editor.
 */

// ─── Blend Modes ──────────────────────────────────────────────────────────────

/** CSS mix-blend-mode values disponíveis em todos os editores. */
export const BLEND_MODES = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color-dodge', 'color-burn', 'hard-light', 'soft-light',
    'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
] as const

export type BlendMode = typeof BLEND_MODES[number]

// ─── Frames ───────────────────────────────────────────────────────────────────

import type { FrameType } from "@/components/dashboard/FrameContainer"

/** Frame completo com label e ícone opcional. */
export interface FrameOption {
    id: FrameType
    label: string
    icon?: any
}

/**
 * Lista master de frames disponíveis.
 * Cada editor pode filtrar as que precisa via `getFrameOptions()`.
 */
export const FRAME_OPTIONS: FrameOption[] = [
    { id: 'none', label: 'Nenhum' },
    { id: 'polaroid', label: 'Polaroid' },
    { id: 'polaroid-dark', label: 'Black Polaroid' },
    { id: 'frame', label: 'Moldura' },
    { id: 'minimal', label: 'Minimalist' },
    { id: 'glass', label: 'Glass' },
    { id: 'round', label: 'Círculo' },
]

/**
 * Retorna apenas os frames com os IDs especificados.
 * Útil quando um editor não suporta todas as opções.
 *
 * @example
 * const mediaFrames = getFrameOptions(['none', 'polaroid', 'glass', 'minimal'])
 */
export function getFrameOptions(ids: FrameType[]): FrameOption[] {
    return FRAME_OPTIONS.filter(f => ids.includes(f.id))
}
