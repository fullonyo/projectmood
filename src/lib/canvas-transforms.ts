/**
 * canvas-transforms.ts
 * 
 * Módulo de funções puras para cálculos de transformação de blocos no canvas.
 * Inspirado nas técnicas de resize do Figma: canto oposto fixo, aspect ratio lock,
 * limites de tamanho, e handles laterais.
 * 
 * Separar lógica matemática da UI é padrão em editores profissionais —
 * facilita testes, centraliza regras e evita bugs de estado.
 */

// ─── Constantes ─────────────────────────────────────────────────────────────

export const SIZE_LIMITS = {
    MIN_WIDTH: 40,
    MIN_HEIGHT: 40,
    MAX_WIDTH: 2000,
    MAX_HEIGHT: 2000,
} as const;

// ─── Types ──────────────────────────────────────────────────────────────────

export type ResizeCorner = 'br' | 'bl' | 'tr' | 'tl';
export type ResizeEdge = 'top' | 'bottom' | 'left' | 'right';
export type ResizeHandle = ResizeCorner | ResizeEdge;

export interface Rect {
    x: number;       // % no canvas (0-100)
    y: number;       // % no canvas (0-100)
    width: number;   // px absoluto
    height: number;  // px absoluto
}

export interface ResizeResult {
    x: number;
    y: number;
    width: number;
    height: number;
}

// ─── Funções Puras ──────────────────────────────────────────────────────────

/**
 * Limita tamanho dentro dos bounds min/max.
 */
export function clampSize(
    width: number,
    height: number,
    min = { width: SIZE_LIMITS.MIN_WIDTH, height: SIZE_LIMITS.MIN_HEIGHT },
    max = { width: SIZE_LIMITS.MAX_WIDTH, height: SIZE_LIMITS.MAX_HEIGHT }
): { width: number; height: number } {
    return {
        width: Math.round(Math.max(min.width, Math.min(max.width, width))),
        height: Math.round(Math.max(min.height, Math.min(max.height, height))),
    };
}

/**
 * Calcula o novo tamanho e posição ao redimensionar por um canto.
 * 
 * Lógica Figma-like: o canto OPOSTO ao que está sendo arrastado permanece fixo.
 * 
 * @param handle - Qual canto ou borda está sendo arrastado
 * @param deltaX - Delta horizontal em pixels do pan
 * @param deltaY - Delta vertical em pixels do pan
 * @param current - Retângulo atual {x, y, width, height}
 * @param canvasWidth - Largura do canvas em pixels (para converter px ↔ %)
 * @param canvasHeight - Altura do canvas em pixels (para converter px ↔ %)
 * @param keepAspectRatio - Se true, mantém proporção original (Shift)
 */
export function calculateResize(
    handle: ResizeHandle,
    deltaX: number,
    deltaY: number,
    current: Rect,
    canvasWidth: number,
    canvasHeight: number,
    keepAspectRatio = false
): ResizeResult {
    let newWidth = current.width;
    let newHeight = current.height;
    let newX = current.x;
    let newY = current.y;

    const aspectRatio = current.width / current.height;

    switch (handle) {
        // ─── Cantos ─────────────────────────────────────────────────────

        case 'br': {
            // Bottom-right: posição fixa (TL fixo), expande para baixo-direita
            newWidth = current.width + deltaX;
            newHeight = current.height + deltaY;
            break;
        }
        case 'bl': {
            // Bottom-left: TR fixo, expande para baixo-esquerda
            newWidth = current.width - deltaX;
            newHeight = current.height + deltaY;
            // Ajusta X para manter o canto direito fixo
            newX = current.x + (deltaX / canvasWidth) * 100;
            break;
        }
        case 'tr': {
            // Top-right: BL fixo, expande para cima-direita
            newWidth = current.width + deltaX;
            newHeight = current.height - deltaY;
            // Ajusta Y para manter o canto inferior fixo
            newY = current.y + (deltaY / canvasHeight) * 100;
            break;
        }
        case 'tl': {
            // Top-left: BR fixo, expande para cima-esquerda
            newWidth = current.width - deltaX;
            newHeight = current.height - deltaY;
            // Ajusta X e Y para manter o canto inferior-direito fixo
            newX = current.x + (deltaX / canvasWidth) * 100;
            newY = current.y + (deltaY / canvasHeight) * 100;
            break;
        }

        // ─── Bordas (resize em 1 eixo) ──────────────────────────────────

        case 'right': {
            newWidth = current.width + deltaX;
            break;
        }
        case 'left': {
            newWidth = current.width - deltaX;
            newX = current.x + (deltaX / canvasWidth) * 100;
            break;
        }
        case 'bottom': {
            newHeight = current.height + deltaY;
            break;
        }
        case 'top': {
            newHeight = current.height - deltaY;
            newY = current.y + (deltaY / canvasHeight) * 100;
            break;
        }
    }

    // ─── Aspect Ratio Lock (Shift) ──────────────────────────────────────
    if (keepAspectRatio && isCorner(handle)) {
        // Usa o eixo de maior delta como driver
        const rawW = newWidth;
        const rawH = newHeight;

        if (Math.abs(rawW - current.width) >= Math.abs(rawH - current.height)) {
            // Width domina → ajustar height
            newHeight = newWidth / aspectRatio;
        } else {
            // Height domina → ajustar width
            newWidth = newHeight * aspectRatio;
        }

        // Recalcular offsets de posição para cantos que movem X/Y
        if (handle === 'tl' || handle === 'bl') {
            const widthDiff = current.width - newWidth;
            newX = current.x + (widthDiff / canvasWidth) * 100;
        }
        if (handle === 'tl' || handle === 'tr') {
            const heightDiff = current.height - newHeight;
            newY = current.y + (heightDiff / canvasHeight) * 100;
        }
    }

    // ─── Clamp Size ─────────────────────────────────────────────────────
    const clamped = clampSize(newWidth, newHeight);

    // Se o clamp alterou o tamanho, recalcular posição para cantos que movem
    if (clamped.width !== Math.round(newWidth)) {
        const widthDelta = current.width - clamped.width;
        if (handle === 'bl' || handle === 'tl' || handle === 'left') {
            newX = current.x + (widthDelta / canvasWidth) * 100;
        }
    }
    if (clamped.height !== Math.round(newHeight)) {
        const heightDelta = current.height - clamped.height;
        if (handle === 'tr' || handle === 'tl' || handle === 'top') {
            newY = current.y + (heightDelta / canvasHeight) * 100;
        }
    }

    // ─── Clamp Position ─────────────────────────────────────────────────
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    return {
        x: parseFloat(newX.toFixed(4)),
        y: parseFloat(newY.toFixed(4)),
        width: clamped.width,
        height: clamped.height,
    };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isCorner(handle: ResizeHandle): handle is ResizeCorner {
    return ['br', 'bl', 'tr', 'tl'].includes(handle);
}

/**
 * Mapeia um handle para o cursor CSS correto.
 */
export function getResizeCursor(handle: ResizeHandle): string {
    const cursors: Record<ResizeHandle, string> = {
        br: 'nwse-resize',
        tl: 'nwse-resize',
        bl: 'nesw-resize',
        tr: 'nesw-resize',
        top: 'ns-resize',
        bottom: 'ns-resize',
        left: 'ew-resize',
        right: 'ew-resize',
    };
    return cursors[handle];
}
