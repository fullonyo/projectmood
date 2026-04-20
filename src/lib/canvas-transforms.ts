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

interface SnapCandidate {
    pos: number;          // % target position
    dist: number;         // % absolute distance
    guideline: Guideline;
}

/**
 * Calcula o snap do bloco baseado no grid e em outros blocos.
 * Utiliza arquitetura "Closest-Wins" com Limiar Magnético em Pixels.
 */
export function calculateSnap(
    x: number, // % 
    y: number, // %
    width: number, // px
    height: number, // px
    canvasWidth: number,
    canvasHeight: number,
    otherBlocks: Array<{ x: number, y: number, width: number | 'auto', height: number | 'auto' }>,
    snapThresholdPx = 5, // Constante de Força Magnética Absoluta em Pixels (Figma Style)
    gridSize = 2.5 // % (conforme definido no themeConfig)
): SnapResult {
    const wPercent = (width / canvasWidth) * 100;
    const hPercent = (height / canvasHeight) * 100;

    // Converte os pixels magnéticos para a porcentagem relativa do zoom atual
    const snapThresholdX = (snapThresholdPx / canvasWidth) * 100;
    const snapThresholdY = (snapThresholdPx / canvasHeight) * 100;

    const xCandidates: SnapCandidate[] = [];
    const yCandidates: SnapCandidate[] = [];

    // 1. Grid Snap
    const gridX = Math.round(x / gridSize) * gridSize;
    const gridY = Math.round(y / gridSize) * gridSize;
    if (Math.abs(x - gridX) <= snapThresholdX) xCandidates.push({ pos: gridX, dist: Math.abs(x - gridX), guideline: { type: 'vertical', pos: gridX }});
    if (Math.abs(y - gridY) <= snapThresholdY) yCandidates.push({ pos: gridY, dist: Math.abs(y - gridY), guideline: { type: 'horizontal', pos: gridY }});

    // 2. Canvas Edges & Safe Areas Snap
    const safePaddingX = (40 / canvasWidth) * 100;
    const safePaddingY = (40 / canvasHeight) * 100;

    // Left Edge
    if (Math.abs(x - safePaddingX) <= snapThresholdX) xCandidates.push({ pos: safePaddingX, dist: Math.abs(x - safePaddingX), guideline: { type: 'vertical', pos: safePaddingX }});
    if (Math.abs(x - 0) <= snapThresholdX) xCandidates.push({ pos: 0, dist: Math.abs(x - 0), guideline: { type: 'vertical', pos: 0 }});
    // Right Edge
    if (Math.abs((x + wPercent) - (100 - safePaddingX)) <= snapThresholdX) xCandidates.push({ pos: 100 - safePaddingX - wPercent, dist: Math.abs((x + wPercent) - (100 - safePaddingX)), guideline: { type: 'vertical', pos: 100 - safePaddingX }});
    if (Math.abs((x + wPercent) - 100) <= snapThresholdX) xCandidates.push({ pos: 100 - wPercent, dist: Math.abs((x + wPercent) - 100), guideline: { type: 'vertical', pos: 100 }});

    // Top Edge
    if (Math.abs(y - safePaddingY) <= snapThresholdY) yCandidates.push({ pos: safePaddingY, dist: Math.abs(y - safePaddingY), guideline: { type: 'horizontal', pos: safePaddingY }});
    if (Math.abs(y - 0) <= snapThresholdY) yCandidates.push({ pos: 0, dist: Math.abs(y - 0), guideline: { type: 'horizontal', pos: 0 }});
    // Bottom Edge
    if (Math.abs((y + hPercent) - (100 - safePaddingY)) <= snapThresholdY) yCandidates.push({ pos: 100 - safePaddingY - hPercent, dist: Math.abs((y + hPercent) - (100 - safePaddingY)), guideline: { type: 'horizontal', pos: 100 - safePaddingY }});
    if (Math.abs((y + hPercent) - 100) <= snapThresholdY) yCandidates.push({ pos: 100 - hPercent, dist: Math.abs((y + hPercent) - 100), guideline: { type: 'horizontal', pos: 100 }});

    // 3. Block-to-Block Snapping
    for (const block of otherBlocks) {
        const bW = typeof block.width === 'number' ? (block.width / canvasWidth) * 100 : 0;
        const bH = typeof block.height === 'number' ? (block.height / canvasHeight) * 100 : 0;
        const bCenterX = block.x + (bW / 2);
        const bCenterY = block.y + (bH / 2);

        // -- Eixo X --
        // Left - Left
        if (Math.abs(x - block.x) <= snapThresholdX) xCandidates.push({ pos: block.x, dist: Math.abs(x - block.x), guideline: { type: 'vertical', pos: block.x }});
        // Right - Right
        if (Math.abs((x + wPercent) - (block.x + bW)) <= snapThresholdX) xCandidates.push({ pos: block.x + bW - wPercent, dist: Math.abs((x + wPercent) - (block.x + bW)), guideline: { type: 'vertical', pos: block.x + bW }});
        // Center - Center
        if (Math.abs((x + wPercent / 2) - bCenterX) <= snapThresholdX) xCandidates.push({ pos: bCenterX - (wPercent / 2), dist: Math.abs((x + wPercent / 2) - bCenterX), guideline: { type: 'vertical', pos: bCenterX }});
        // Left - Right (Edge-to-Edge)
        if (Math.abs(x - (block.x + bW)) <= snapThresholdX) xCandidates.push({ pos: block.x + bW, dist: Math.abs(x - (block.x + bW)), guideline: { type: 'vertical', pos: block.x + bW }});
        // Right - Left (Edge-to-Edge)
        if (Math.abs((x + wPercent) - block.x) <= snapThresholdX) xCandidates.push({ pos: block.x - wPercent, dist: Math.abs((x + wPercent) - block.x), guideline: { type: 'vertical', pos: block.x }});

        // -- Eixo Y --
        // Top - Top
        if (Math.abs(y - block.y) <= snapThresholdY) yCandidates.push({ pos: block.y, dist: Math.abs(y - block.y), guideline: { type: 'horizontal', pos: block.y }});
        // Bottom - Bottom
        if (Math.abs((y + hPercent) - (block.y + bH)) <= snapThresholdY) yCandidates.push({ pos: block.y + bH - hPercent, dist: Math.abs((y + hPercent) - (block.y + bH)), guideline: { type: 'horizontal', pos: block.y + bH }});
        // Center - Center
        if (Math.abs((y + hPercent / 2) - bCenterY) <= snapThresholdY) yCandidates.push({ pos: bCenterY - (hPercent / 2), dist: Math.abs((y + hPercent / 2) - bCenterY), guideline: { type: 'horizontal', pos: bCenterY }});
        // Top - Bottom (Edge-to-Edge)
        if (Math.abs(y - (block.y + bH)) <= snapThresholdY) yCandidates.push({ pos: block.y + bH, dist: Math.abs(y - (block.y + bH)), guideline: { type: 'horizontal', pos: block.y + bH }});
        // Bottom - Top (Edge-to-Edge)
        if (Math.abs((y + hPercent) - block.y) <= snapThresholdY) yCandidates.push({ pos: block.y - hPercent, dist: Math.abs((y + hPercent) - block.y), guideline: { type: 'horizontal', pos: block.y }});
    }

    // 4. O Motor "Closest-Wins"
    xCandidates.sort((a, b) => a.dist - b.dist);
    yCandidates.sort((a, b) => a.dist - b.dist);

    let finalX = x;
    let finalY = y;
    const guidelines: Guideline[] = [];

    // Coroa o vencedor do Eixo X e coleta as linhas guias associadas
    if (xCandidates.length > 0) {
        const winner = xCandidates[0];
        finalX = winner.pos;
        
        // Pega todos que empataram com o vencedor (distâncias idênticas geram múltiplas réguas)
        const tiedWinners = xCandidates.filter(c => Math.abs(c.pos - winner.pos) < 0.001);
        const uniquePos = new Set<number>();
        tiedWinners.forEach(c => {
            if (!uniquePos.has(c.guideline.pos)) {
                uniquePos.add(c.guideline.pos);
                guidelines.push(c.guideline);
            }
        });
    }

    // Coroa o vencedor do Eixo Y e coleta as linhas guias associadas
    if (yCandidates.length > 0) {
        const winner = yCandidates[0];
        finalY = winner.pos;
        
        const tiedWinners = yCandidates.filter(c => Math.abs(c.pos - winner.pos) < 0.001);
        const uniquePos = new Set<number>();
        tiedWinners.forEach(c => {
            if (!uniquePos.has(c.guideline.pos)) {
                uniquePos.add(c.guideline.pos);
                guidelines.push(c.guideline);
            }
        });
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

    return {
        x: parseFloat(Math.max(0, Math.min(100, finalX)).toFixed(4)),
        y: parseFloat(Math.max(0, Math.min(100, finalY)).toFixed(4)),
        guidelines,
        distances
    };
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

// ─── Alinhamento e Distribuição ─────────────────────────────────────────────

export type AlignmentType = 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom';
export type DistributionType = 'horizontal' | 'vertical';

/**
 * Calcula as novas posições baseadas em um tipo de alinhamento.
 */
export function calculateAlignment(
    blocks: Array<{ id: string, x: number, y: number, width: number, height: number, isLocked?: boolean }>,
    type: AlignmentType,
    canvasWidth: number,
    canvasHeight: number
): Array<{ id: string, x?: number, y?: number }> {
    if (blocks.length < 2) return [];

    const blocksWithPercent = blocks.map(b => ({
        ...b,
        wP: ((b.width || 120) / canvasWidth) * 100,
        hP: ((b.height || 120) / canvasHeight) * 100
    }));

    let targetValue: number;

    switch (type) {
        case 'left':
            targetValue = Math.min(...blocksWithPercent.map(b => b.x));
            return blocksWithPercent
                .filter(b => !b.isLocked && b.x !== targetValue)
                .map(b => ({ id: b.id, x: Number(Math.max(0, targetValue).toFixed(4)) }));

        case 'centerX':
            // Alinha pelo centro da bounding box da seleção
            const minX = Math.min(...blocksWithPercent.map(b => b.x));
            const maxX = Math.max(...blocksWithPercent.map(b => b.x + b.wP));
            targetValue = minX + (maxX - minX) / 2;
            return blocksWithPercent
                .filter(b => !b.isLocked)
                .map(b => ({
                    id: b.id,
                    x: Number(Math.max(0, Math.min(100, targetValue - b.wP / 2)).toFixed(4))
                }));

        case 'right':
            targetValue = Math.max(...blocksWithPercent.map(b => b.x + b.wP));
            return blocksWithPercent
                .filter(b => !b.isLocked)
                .map(b => ({
                    id: b.id,
                    x: Number(Math.max(0, Math.min(100, targetValue - b.wP)).toFixed(4))
                }));

        case 'top':
            targetValue = Math.min(...blocksWithPercent.map(b => b.y));
            return blocksWithPercent
                .filter(b => !b.isLocked && b.y !== targetValue)
                .map(b => ({ id: b.id, y: Number(Math.max(0, targetValue).toFixed(4)) }));

        case 'centerY':
            const minY = Math.min(...blocksWithPercent.map(b => b.y));
            const maxY = Math.max(...blocksWithPercent.map(b => b.y + b.hP));
            targetValue = minY + (maxY - minY) / 2;
            return blocksWithPercent
                .filter(b => !b.isLocked)
                .map(b => ({
                    id: b.id,
                    y: Number(Math.max(0, Math.min(100, targetValue - b.hP / 2)).toFixed(4))
                }));

        case 'bottom':
            targetValue = Math.max(...blocksWithPercent.map(b => b.y + b.hP));
            return blocksWithPercent
                .filter(b => !b.isLocked)
                .map(b => ({
                    id: b.id,
                    y: Number(Math.max(0, Math.min(100, targetValue - b.hP)).toFixed(4))
                }));

        default:
            return [];
    }
}

/**
 * Calcula as novas posições para distribuir o espaço uniformemente entre blocos.
 */
export function calculateDistribution(
    blocks: Array<{ id: string, x: number, y: number, width: number, height: number, isLocked?: boolean }>,
    axis: DistributionType,
    canvasWidth: number,
    canvasHeight: number
): Array<{ id: string, x?: number, y?: number }> {
    if (blocks.length < 3) return []; // Distribuição precisa de pelo menos 3 blocos

    const blocksWithPercent = blocks.map(b => ({
        ...b,
        wP: ((b.width || 120) / canvasWidth) * 100,
        hP: ((b.height || 120) / canvasHeight) * 100
    }));

    const updates: Array<{ id: string, x?: number, y?: number }> = [];

    if (axis === 'horizontal') {
        // Ordena por X para garantir ordem lógica
        const sorted = [...blocksWithPercent].sort((a, b) => a.x - b.x);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        // Total de largura ocupada pelos blocos (exceto o primeiro e último fixos)
        const totalContentWidth = sorted.reduce((acc, b) => acc + b.wP, 0);
        const totalSpan = (last.x + last.wP) - first.x;

        // Espaço livre para dividir entre os blocos (gaps)
        const totalGap = totalSpan - totalContentWidth;
        const gapSize = totalGap / (sorted.length - 1);

        let currentPos = first.x + first.wP + gapSize;

        for (let i = 1; i < sorted.length - 1; i++) {
            const b = sorted[i];
            if (!b.isLocked) {
                const clampedX = Math.max(0, Math.min(100, currentPos));
                updates.push({ id: b.id, x: Number(clampedX.toFixed(4)) });
            }
            currentPos += b.wP + gapSize;
        }
    } else {
        // Ordena por Y
        const sorted = [...blocksWithPercent].sort((a, b) => a.y - b.y);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        const totalContentHeight = sorted.reduce((acc, b) => acc + b.hP, 0);
        const totalSpan = (last.y + last.hP) - first.y;

        const totalGap = totalSpan - totalContentHeight;
        const gapSize = totalGap / (sorted.length - 1);

        let currentPos = first.y + first.hP + gapSize;

        for (let i = 1; i < sorted.length - 1; i++) {
            const b = sorted[i];
            if (!b.isLocked) {
                const clampedY = Math.max(0, Math.min(100, currentPos));
                updates.push({ id: b.id, y: Number(clampedY.toFixed(4)) });
            }
            currentPos += b.hP + gapSize;
        }
    }

    return updates;
}
