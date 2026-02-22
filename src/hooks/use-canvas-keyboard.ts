import { useEffect, useCallback, useRef } from 'react';
import { MoodBlock } from '@/types/database';

interface UseCanvasKeyboardProps {
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    onUpdateBlock: (id: string, updates: Partial<MoodBlock>) => void;
    onDeleteRequest: (id: string) => void;
    onDuplicate: (id: string) => void;
    blocks: MoodBlock[];
}

export function useCanvasKeyboard({
    selectedId,
    setSelectedId,
    onUpdateBlock,
    onDeleteRequest,
    onDuplicate,
    blocks
}: UseCanvasKeyboardProps) {
    const blocksRef = useRef(blocks);
    blocksRef.current = blocks;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!selectedId) return;

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

        const selectedBlock = blocksRef.current.find(b => b.id === selectedId);
        if (!selectedBlock) return;

        const moveStep = e.shiftKey ? 2.5 : 0.5; // % coordinates

        switch (e.key) {
            case 'ArrowLeft':
                if (selectedBlock.isLocked) break;
                e.preventDefault();
                onUpdateBlock(selectedId, { x: Math.max(0, selectedBlock.x - moveStep) });
                break;
            case 'ArrowRight':
                if (selectedBlock.isLocked) break;
                e.preventDefault();
                onUpdateBlock(selectedId, { x: Math.min(100, selectedBlock.x + moveStep) });
                break;
            case 'ArrowUp':
                if (selectedBlock.isLocked) break;
                e.preventDefault();
                onUpdateBlock(selectedId, { y: Math.max(0, selectedBlock.y - moveStep) });
                break;
            case 'ArrowDown':
                if (selectedBlock.isLocked) break;
                e.preventDefault();
                onUpdateBlock(selectedId, { y: Math.min(100, selectedBlock.y + moveStep) });
                break;
            case 'Delete':
            case 'Backspace':
                if (selectedBlock.isLocked) break;
                e.preventDefault();
                onDeleteRequest(selectedId);
                break;
            case 'Escape':
                e.preventDefault();
                setSelectedId(null);
                break;
            case 'd':
                if ((e.ctrlKey || e.metaKey)) {
                    if (selectedBlock.isLocked) break;
                    e.preventDefault();
                    onDuplicate(selectedId);
                }
                break;
        }

    }, [selectedId, onUpdateBlock, onDeleteRequest, onDuplicate, setSelectedId]);


    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
