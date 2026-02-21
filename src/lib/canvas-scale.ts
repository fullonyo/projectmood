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
 * Escala um valor de tamanho de bloco (width ou height).
 * Valores numéricos são multiplicados pelo scale.
 * Valores 'auto' são retornados sem alteração.
 */
export function scaleBlockSize(
    raw: number | 'auto' | undefined | null,
    scale: number,
    fallback: number | 'auto' = 'auto'
): number | 'auto' {
    const value = raw ?? fallback
    if (typeof value === 'number') return Math.round(value * scale)
    return value
}

/**
 * Retorna o tamanho fallback para um tipo de bloco.
 * Tipos visuais (foto, vídeo, música, guestbook) recebem 300px.
 * Outros (texto, quote, etc.) recebem 'auto'.
 */
export function getBlockFallbackSize(type: string): number | 'auto' {
    if (['photo', 'video', 'music', 'guestbook'].includes(type)) return 300
    return 'auto'
}
