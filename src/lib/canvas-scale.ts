"use client"

import { useState, useEffect } from "react"

/**
 * Sistema de Escala Proporcional — Canvas WYSIWYG
 * 
 * Garante fidelidade visual entre resoluções diferentes.
 * Todos os tamanhos de blocos (width, height) são armazenados em "pixels de referência"
 * e escalados proporcionalmente ao viewport do viewer.
 * 
 * Referência: 1920px (largura de um monitor Full HD / 1080p)
 * - Em 4K (3840px): scale = 2.0 → blocos 2x maiores (mesma proporção)
 * - Em 720p (1280px): scale = 0.67 → blocos menores (mesma proporção)
 * - Em 1080p (1920px): scale = 1.0 → exato como editado
 */

/** Largura de viewport de referência (1080p = 1920px de largura) */
export const DESIGN_VIEWPORT_WIDTH = 1920

/** Tamanho mínimo de scale para prevenir blocos invisíveis */
const MIN_SCALE = 0.25

/** Unidade de design base para blocos complexos (FUS - Fluid Unit Scaling) */
export const STUDIO_BASE_UNIT = 200

/**
 * Hook que retorna o fator de escala atual baseado na largura do viewport.
 * Atualiza automaticamente em resize.
 * SSR-safe: retorna 1 durante hydration.
 */
export function useViewportScale(): number {
    const [scale, setScale] = useState(1)

    useEffect(() => {
        const compute = () => {
            const raw = window.innerWidth / DESIGN_VIEWPORT_WIDTH
            setScale(Math.max(MIN_SCALE, raw))
        }
        compute()
        window.addEventListener('resize', compute)
        return () => window.removeEventListener('resize', compute)
    }, [])

    return scale
}

/** 
 * Configurações padrão de dimensionamento por tipo de bloco.
 * Valores em pixels de referência (1920px width).
 */
export const DESIGN_BLOCK_CONFIGS: Record<string, { w: number; h: number; minW?: number; minH?: number }> = {
    text: { w: 350, h: 150, minW: 100, minH: 40 },
    ticker: { w: 400, h: 80, minW: 200, minH: 40 },
    subtitle: { w: 350, h: 100, minW: 150, minH: 40 },
    quote: { w: 400, h: 200, minW: 200, minH: 100 },
    photo: { w: 300, h: 300, minW: 100, minH: 100 },
    media: { w: 320, h: 200, minW: 160, minH: 100 },
    video: { w: 320, h: 200, minW: 160, minH: 100 }, // Legacy support
    music: { w: 300, h: 120, minW: 160, minH: 80 },  // Legacy support
    social: { w: 150, h: 45, minW: 40, minH: 40 },
    guestbook: { w: 350, h: 450, minW: 250, minH: 300 },
    countdown: { w: 300, h: 150, minW: 200, minH: 100 },
    moodStatus: { w: 300, h: 100, minW: 150, minH: 60 },
    weather: { w: 300, h: 100, minW: 150, minH: 60 },
    doodle: { w: 250, h: 250, minW: 50, minH: 50 },
    tape: { w: 100, h: 40, minW: 20, minH: 20 },
}

/**
 * Retorna as dimensões iniciais para um bloco baseado no tipo.
 */
export function getInitialBlockSize(type: string): { width: number; height: number } {
    const config = DESIGN_BLOCK_CONFIGS[type] || { w: 250, h: 250 };
    return { width: config.w, height: config.h };
}

/**
 * Escala um valor de tamanho de bloco (width ou height).
 * Valores numéricos são multiplicados pelo scale.
 * Valores 'auto' são retornados sem alteração.
 */
export function scaleBlockSize(
    raw: number | 'auto' | undefined | null,
    scale: number,
    type?: string,
    axis: 'w' | 'h' = 'w'
): number | 'auto' {
    if (typeof raw === 'number') return Math.round(raw * scale)

    // Se for nulo ou indefinido, busca no fallback centralizado
    if (type && DESIGN_BLOCK_CONFIGS[type]) {
        return Math.round(DESIGN_BLOCK_CONFIGS[type][axis] * scale)
    }

    return 'auto'
}

/**
 * Retorna o tamanho fallback para um tipo de bloco (Legado/Compatibilidade).
 */
export function getBlockFallbackSize(type: string): number | 'auto' {
    return DESIGN_BLOCK_CONFIGS[type]?.w || 'auto'
}

/**
 * Normalização Studio (FUS - Fluid Unit Scaling)
 * Calcula um fator de escala baseado na área do container para manter densidade visual.
 * @param width Largura real do container
 * @param height Altura real do container
 * @param referenceUnit Unidade de design ideal (default 200px)
 */
export function computeStudioNormalization(
    width: number,
    height: number,
    referenceUnit: number = STUDIO_BASE_UNIT
): number {
    if (width === 0 || height === 0) return 1
    // Raiz quadrada da área normalizada pela unidade de referência
    return Math.max(0.4, Math.sqrt(width * height) / referenceUnit)
}
