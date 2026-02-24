"use client"

import { useState, useEffect, useRef, RefObject } from "react"
import { computeStudioNormalization, useViewportScale } from "@/lib/canvas-scale"

interface StudioBlockState {
    width: number
    height: number
    /** Escala normalizada baseada na área do bloco (Fluid Unit Scaling) */
    fluidScale: number
    /** Proporção do layout (true se largura > altura * 1.4) */
    isHorizontal: boolean
    /** Se o bloco é muito pequeno para conteúdos secundários */
    isSmall: boolean
}

/**
 * Hook Padronizado Studio para Blocos Reativos
 * Encapsula ResizeObserver e lógica de Normalização de Design (FUS).
 * 
 * @returns {RefObject<T>} ref - Referência para anexar ao container principal
 * @returns {StudioBlockState} state - Estados de dimensão e escala
 */
export function useStudioBlock<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T>(null)
    const viewportScale = useViewportScale()
    const [state, setState] = useState<StudioBlockState>({
        width: 0,
        height: 0,
        fluidScale: 1,
        isHorizontal: false,
        isSmall: false
    })

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect

                // Aplicar fórmula padrão de normalização Studio (Área)
                const fluidScale = computeStudioNormalization(width, height)

                setState({
                    width,
                    height,
                    fluidScale,
                    isHorizontal: width > height * 1.4,
                    isSmall: height < 100 || width < 120
                })
            }
        })

        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    return { ref, ...state, viewportScale }
}
