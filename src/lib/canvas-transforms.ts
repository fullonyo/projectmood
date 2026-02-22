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

export interface Guideline {
    type: 'horizontal' | 'vertical';
    pos: number; // % ou px dependendo do contexto
}

export interface DistanceGuide {
    type: 'horizontal' | 'vertical';
    pos: number; // %
    start: number; // %
    end: number; // %
    distance: number; // px ou % 
    label: string;
}

export interface SnapResult {
    x: number;
    y: number;
    guidelines: Guideline[];
    distances: DistanceGuide[];
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

/**
 * Calcula o snap do bloco baseado no grid e em outros blocos.
 */
export function calculateSnap(
    x: number, // % 
    y: number, // %
    width: number, // px
    height: number, // px
    canvasWidth: number,
    canvasHeight: number,
    otherBlocks: Array<{ x: number, y: number, width: number | 'auto', height: number | 'auto' }>,
    snapThreshold = 1, // %
    gridSize = 2.5 // % (conforme definido no themeConfig)
): SnapResult {
    let finalX = x;
    let finalY = y;
    const guidelines: Guideline[] = [];

    const wPercent = (width / canvasWidth) * 100;
    const hPercent = (height / canvasHeight) * 100;

    // 1. Grid & Canvas Edge Snapping
    const safePaddingX = (40 / canvasWidth) * 100;
    const safePaddingY = (40 / canvasHeight) * 100;

    // Grid Snap
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;

    if (Math.abs(x - snappedX) < snapThreshold) finalX = snappedX;
    if (Math.abs(y - snappedY) < snapThreshold) finalY = snappedY;

    // Canvas Edges Snap (with Safe Area)
    // Left
    if (Math.abs(finalX - safePaddingX) < snapThreshold) {
        finalX = safePaddingX;
        guidelines.push({ type: 'vertical', pos: safePaddingX });
    } else if (Math.abs(finalX - 0) < snapThreshold) {
        finalX = 0;
        guidelines.push({ type: 'vertical', pos: 0 });
    }

    // Right
    if (Math.abs((finalX + wPercent) - (100 - safePaddingX)) < snapThreshold) {
        finalX = 100 - wPercent - safePaddingX;
        guidelines.push({ type: 'vertical', pos: 100 - safePaddingX });
    } else if (Math.abs((finalX + wPercent) - 100) < snapThreshold) {
        finalX = 100 - wPercent;
        guidelines.push({ type: 'vertical', pos: 100 });
    }

    // Top
    if (Math.abs(finalY - safePaddingY) < snapThreshold) {
        finalY = safePaddingY;
        guidelines.push({ type: 'horizontal', pos: safePaddingY });
    } else if (Math.abs(finalY - 0) < snapThreshold) {
        finalY = 0;
        guidelines.push({ type: 'horizontal', pos: 0 });
    }

    // Bottom
    if (Math.abs((finalY + hPercent) - (100 - safePaddingY)) < snapThreshold) {
        finalY = 100 - hPercent - safePaddingY;
        guidelines.push({ type: 'horizontal', pos: 100 - safePaddingY });
    } else if (Math.abs((finalY + hPercent) - 100) < snapThreshold) {
        finalY = 100 - hPercent;
        guidelines.push({ type: 'horizontal', pos: 100 });
    }

    // 2. Block-to-Block Snapping (simplificado)
    // No futuro podemos expandir para centros e bordas opostas
    for (const block of otherBlocks) {
        const bW = typeof block.width === 'number' ? (block.width / canvasWidth) * 100 : 0;
        const bH = typeof block.height === 'number' ? (block.height / canvasHeight) * 100 : 0;

        // X Alignments
        // Left - Left
        if (Math.abs(finalX - block.x) < snapThreshold) {
            finalX = block.x;
            guidelines.push({ type: 'vertical', pos: block.x });
        }
        // Right - Right
        if (Math.abs((finalX + wPercent) - (block.x + bW)) < snapThreshold) {
            finalX = block.x + bW - wPercent;
            guidelines.push({ type: 'vertical', pos: block.x + bW });
        }

        // Center - Center
        const bCenterX = block.x + (bW / 2);
        if (Math.abs((finalX + wPercent / 2) - bCenterX) < snapThreshold) {
            finalX = bCenterX - (wPercent / 2);
            guidelines.push({ type: 'vertical', pos: bCenterX });
        }

        // Y Alignments
        // Top - Top
        if (Math.abs(finalY - block.y) < snapThreshold) {
            finalY = block.y;
            guidelines.push({ type: 'horizontal', pos: block.y });
        }
        // Bottom - Bottom
        if (Math.abs((finalY + hPercent) - (block.y + bH)) < snapThreshold) {
            finalY = block.y + bH - hPercent;
            guidelines.push({ type: 'horizontal', pos: block.y + bH });
        }
        // Center - Center
        const bCenterY = block.y + (bH / 2);
        if (Math.abs((finalY + hPercent / 2) - bCenterY) < snapThreshold) {
            finalY = bCenterY - (hPercent / 2);
            guidelines.push({ type: 'horizontal', pos: bCenterY });
        }

        // 3. Edge-to-Edge Snapping (New: Align opposite edges)
        // Left - Right
        if (Math.abs(finalX - (block.x + bW)) < snapThreshold) {
            finalX = block.x + bW;
            guidelines.push({ type: 'vertical', pos: block.x + bW });
        }
        // Right - Left
        if (Math.abs((finalX + wPercent) - block.x) < snapThreshold) {
            finalX = block.x - wPercent;
            guidelines.push({ type: 'vertical', pos: block.x });
        }
        // Top - Bottom
        if (Math.abs(finalY - (block.y + bH)) < snapThreshold) {
            finalY = block.y + bH;
            guidelines.push({ type: 'horizontal', pos: block.y + bH });
        }
        // Bottom - Top
        if (Math.abs((finalY + hPercent) - block.y) < snapThreshold) {
            finalY = block.y - hPercent;
            guidelines.push({ type: 'horizontal', pos: block.y });
        }
    }

    // 4. Distance Guides (Advanced precision UI)
    const distances: DistanceGuide[] = [];
    const thresholdDist = 15; // % - Distância máxima para mostrar guia

    for (const block of otherBlocks) {
        const bW = typeof block.width === 'number' ? (block.width / canvasWidth) * 100 : 0;
        const bH = typeof block.height === 'number' ? (block.height / canvasHeight) * 100 : 0;

        // Horizontais (Gap entre blocos lado a lado)
        // Checa se há sobreposição vertical
        const overlapsY = (finalY < block.y + bH) && (finalY + hPercent > block.y);

        if (overlapsY) {
            // Bloco à DIREITA do atual
            if (block.x >= finalX + wPercent && block.x <= finalX + wPercent + thresholdDist) {
                const dist = block.x - (finalX + wPercent);
                distances.push({
                    type: 'vertical',
                    pos: finalX + wPercent + (dist / 2),
                    start: Math.max(finalY, block.y),
                    end: Math.min(finalY + hPercent, block.y + hPercent),
                    distance: dist,
                    label: `${Math.round(dist)}%`
                });
            }
            // Bloco à ESQUERDA do atual
            if (finalX >= block.x + bW && finalX <= block.x + bW + thresholdDist) {
                const dist = finalX - (block.x + bW);
                distances.push({
                    type: 'vertical',
                    pos: block.x + bW + (dist / 2),
                    start: Math.max(finalY, block.y),
                    end: Math.min(finalY + hPercent, block.y + hHPercent(block, canvasHeight)),
                    distance: dist,
                    label: `${Math.round(dist)}%`
                });
            }
        }

        // Verticais (Gap entre blocos topo/baixo)
        const overlapsX = (finalX < block.x + bW) && (finalX + wPercent > block.x);
        if (overlapsX) {
            // Bloco ABAIXO do atual
            if (block.y >= finalY + hPercent && block.y <= finalY + hPercent + thresholdDist) {
                const dist = block.y - (finalY + hPercent);
                distances.push({
                    type: 'horizontal',
                    pos: finalY + hPercent + (dist / 2),
                    start: Math.max(finalX, block.x),
                    end: Math.min(finalX + wPercent, block.x + bW),
                    distance: dist,
                    label: `${Math.round(dist)}%`
                });
            }
            // Bloco ACIMA do atual
            if (finalY >= block.y + bH && finalY <= block.y + bH + thresholdDist) {
                const dist = finalY - (block.y + bH);
                distances.push({
                    type: 'horizontal',
                    pos: block.y + bH + (dist / 2),
                    start: Math.max(finalX, block.x),
                    end: Math.min(finalX + wPercent, block.x + bW),
                    distance: dist,
                    label: `${Math.round(dist)}%`
                });
            }
        }
    }

    return { x: finalX, y: finalY, guidelines, distances };
}

function hHPercent(block: any, canvasHeight: number) {
    return typeof block.height === 'number' ? (block.height / canvasHeight) * 100 : 0;
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

/**
 * Calcula o ângulo de rotação baseado na posição do mouse.
 * 
 * @param centerX - X do centro do bloco (px)
 * @param centerY - Y do centro do bloco (px)
 * @param mouseX - X do mouse (px)
 * @param mouseY - Y do mouse (px)
 * @param snapToGrid - Se true, trava em incrementos de 15 graus (Shift)
 */
export function calculateRotation(
    centerX: number,
    centerY: number,
    mouseX: number,
    mouseY: number,
    snapToGrid = false
): number {
    // Vetor do centro até o mouse
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;

    // Arco tangente para obter o ângulo em radianos.
    // +90 graus porque o 0 no CSS rotate é "top" (12h), mas o 0 trigonométrico é "right" (3h)
    let angle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;

    // Normaliza para 0-360
    angle = (angle + 360) % 360;

    if (snapToGrid) {
        const snapIncrement = 15;
        angle = Math.round(angle / snapIncrement) * snapIncrement;
    }

    return Math.round(angle);
}
