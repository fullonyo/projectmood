import { useEffect, useCallback, useRef } from 'react';
import { MoodBlock } from '@/types/database';

interface UseCanvasKeyboardProps {
    selectedIds: string[];
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    onUpdateBlock: (id: string, updates: Partial<MoodBlock>) => void;
    removeBlocks: (ids: string[]) => void;
    duplicateMoodBlock: (id: string) => void;
    bringToFront: (id: string) => void;
    sendToBack: (id: string) => void;
    blocks: MoodBlock[];
    undo: () => void;
    redo: () => void;
}

export function useCanvasKeyboard({
    selectedIds,
    setSelectedIds,
    onUpdateBlock,
    removeBlocks,
    duplicateMoodBlock,
    bringToFront,
    sendToBack,
    blocks,
    undo,
    redo
}: UseCanvasKeyboardProps) {
    const blocksRef = useRef(blocks);

    useEffect(() => {
        blocksRef.current = blocks;
    }, [blocks]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (selectedIds.length === 0) return;

        // Ignore if typing in an input or textarea
        const activeElement = document.activeElement as HTMLElement | null;
        if (
            activeElement?.tagName === 'INPUT' ||
            activeElement?.tagName === 'TEXTAREA' ||
            activeElement?.tagName === 'SELECT' ||
            activeElement?.closest('[contenteditable]')
        ) {
            return;
        }

        const selectedBlocks = blocksRef.current.filter(b => selectedIds.includes(b.id));
        if (selectedBlocks.length === 0) return;

        const moveStep = e.shiftKey ? 2.5 : 0.5; // % coordinates

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                selectedBlocks.forEach(b => {
                    if (!b.isLocked) onUpdateBlock(b.id, { x: Math.max(0, b.x - moveStep) });
                });
                break;
            case 'ArrowRight':
                e.preventDefault();
                selectedBlocks.forEach(b => {
                    if (!b.isLocked) onUpdateBlock(b.id, { x: Math.min(100, b.x + moveStep) });
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedBlocks.forEach(b => {
                    if (!b.isLocked) onUpdateBlock(b.id, { y: Math.max(0, b.y - moveStep) });
                });
                break;
            case 'ArrowDown':
                e.preventDefault();
                selectedBlocks.forEach(b => {
                    if (!b.isLocked) onUpdateBlock(b.id, { y: Math.min(100, b.y + moveStep) });
                });
                break;
            case 'Delete':
            case 'Backspace':
                e.preventDefault();
                const idsToDelete = selectedBlocks.filter(b => !b.isLocked).map(b => b.id);
                if (idsToDelete.length > 0) {
                    removeBlocks(idsToDelete);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setSelectedIds([]);
                break;
            case 'd':
                if ((e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    selectedBlocks.forEach(b => {
                        if (!b.isLocked) duplicateMoodBlock(b.id);
                    });
                }
                break;
            case '[':
                e.preventDefault();
                selectedBlocks.forEach(b => {
                    if (!b.isLocked) sendToBack(b.id);
                });
                break;
            case ']':
                e.preventDefault();
                selectedBlocks.forEach(b => {
                    if (!b.isLocked) bringToFront(b.id);
                });
                break;
            case 'z':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    if (e.shiftKey) redo();
                    else undo();
                }
                break;
            case 'y':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    redo();
                }
                break;
        }

    }, [selectedIds, onUpdateBlock, removeBlocks, duplicateMoodBlock, bringToFront, sendToBack, setSelectedIds, undo, redo]);


    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
