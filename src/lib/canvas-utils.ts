/**
 * canvas-utils.ts
 * 
 * Utilitários compartilhados para manipulação do canvas, detecção de inputs e 
 * tratamento de eventos de alta performance.
 */

import { MoodBlock } from "@/types/database";

/**
 * Extrai coordenadas absolutas do viewport de forma confiável entre mouse, touch e pointer events.
 */
export const getClientPos = (e: MouseEvent | TouchEvent | PointerEvent | any) => {
    const isTouch = 'touches' in e && e.touches.length > 0;
    return {
        x: isTouch ? e.touches[0].clientX : e.clientX,
        y: isTouch ? e.touches[0].clientY : e.clientY
    };
};

/**
 * Verifica se o usuário está interagindo com um input, permitindo ignorar atalhos de teclado.
 */
export const isInputActive = () => {
    const activeElement = document.activeElement as HTMLElement | null;
    return (
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.tagName === 'SELECT' ||
        activeElement?.closest('[contenteditable]')
    );
};

/**
 * Calcula a Bounding Box (em porcentagem) de um conjunto de blocos.
 * Útil para renderizar a Aura de seleção e grupos.
 */
export interface BoundingBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

export function calculateSelectionBounds(
    selectedBlocks: MoodBlock[], 
    canvasWidth: number = 2000, 
    canvasHeight: number = 2000
): BoundingBox | null {
    if (selectedBlocks.length === 0) return null;

    let minX = 100, minY = 100, maxX = 0, maxY = 0;
    
    selectedBlocks.forEach(b => {
        // Fallback de tamanho se não houver width/height
        const wPx = typeof b.width === 'number' ? b.width : 200;
        const hPx = typeof b.height === 'number' ? b.height : 200;
        
        // Conversão Px -> % baseada nas dimensões do canvas
        const wPercent = (wPx / canvasWidth) * 100;
        const hPercent = (hPx / canvasHeight) * 100;
        
        minX = Math.min(minX, b.x);
        minY = Math.min(minY, b.y);
        
        maxX = Math.max(maxX, b.x + wPercent); 
        maxY = Math.max(maxY, b.y + hPercent);
    });

    return { 
        x: minX, 
        y: minY, 
        w: Math.max(0.1, maxX - minX), 
        h: Math.max(0.1, maxY - minY) 
    };
}

/**
 * Sistema de Eventos Customizados de Alta Performance
 */
export const dispatchCanvasEvent = (name: string, detail: any) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(name, { detail }));
    }
};

export const CANVAS_EVENTS = {
    GROUP_ROTATE: 'mood-group-rotate',
    MULTI_MOVE: 'mood-multi-move',
    CANVAS_UPDATE: 'mood-canvas-update',
    OPEN_COMMAND_CENTER: 'open-command-center'
} as const;
