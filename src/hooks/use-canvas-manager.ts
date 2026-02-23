import { useState, useCallback, useRef, useEffect } from 'react';
import { updateMoodBlockLayout, deleteMoodBlock, restoreMoodBlock } from '@/actions/profile';
import { toast } from 'sonner';

import { MoodBlock } from '@/types/database';

// Helper types removed if unused

export function useCanvasManager(initialBlocks: MoodBlock[]) {
    const [isSaving, setIsSaving] = useState(false);

    // 1. SOVEREIGN STATE: Local state is the absolute master.
    const [blocks, setBlocks] = useState<MoodBlock[]>(initialBlocks);

    // 2. EPOCH SYSTEM: Prevent race conditions with server updates
    const epochRef = useRef<Record<string, number>>({});

    // 3. PERSISTENCE QUEUE: Debounce saving
    const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});
    // 4. PENDING UPDATES: Accumulate updates between debounce cycles
    const pendingUpdates = useRef<Record<string, Partial<MoodBlock>>>({});

    // 5. HISTORY SYSTEM
    const [past, setPast] = useState<MoodBlock[][]>([]);
    const [future, setFuture] = useState<MoodBlock[][]>([]);
    const isUndoRedoAction = useRef(false);
    const historyDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    const scheduleBackendSave = useCallback((id: string) => {
        if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
        saveTimers.current[id] = setTimeout(async () => {
            setIsSaving(true);
            const mergedUpdates = { ...pendingUpdates.current[id] };
            delete pendingUpdates.current[id];

            try {
                // Sanitize: Prisma returns null for width/height, but Action expects number | undefined
                const sanitizedUpdates = Object.fromEntries(
                    Object.entries(mergedUpdates).map(([k, v]) => [k, v === null ? undefined : v])
                ) as Parameters<typeof updateMoodBlockLayout>[1];
                const result = await updateMoodBlockLayout(id, sanitizedUpdates);
                if (result?.error) throw new Error(result.error);
                setTimeout(() => {
                    epochRef.current[id] = Math.max(0, (epochRef.current[id] || 0) - 1);
                }, 1500);
            } catch (error) {
                console.error("Batch sync failed for", id, error);
            } finally {
                setIsSaving(false);
            }
        }, 800);
    }, []);

    const captureHistory = useCallback((currentState: MoodBlock[]) => {
        if (isUndoRedoAction.current) return;

        if (!historyDebounceTimer.current) {
            setPast(prev => [...prev.slice(-49), currentState]);
            setFuture([]); // Clear future on new action
        }

        if (historyDebounceTimer.current) clearTimeout(historyDebounceTimer.current);
        historyDebounceTimer.current = setTimeout(() => {
            historyDebounceTimer.current = null;
        }, 800);
    }, []);

    // 6. SAFEGUARD (DIRTY TRACKING): Previne fechamento acidental da guia do Chrome antes do async
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isSaving || Object.keys(pendingUpdates.current).length > 0) {
                e.preventDefault();
                e.returnValue = ''; // Trigger nativo
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isSaving]);

    // Smart Sync from Server Props
    useEffect(() => {
        setBlocks(prev => {
            return initialBlocks.map(initial => {
                const current = prev.find(b => b.id === initial.id);
                if (!current) return initial;

                // EPOCH PROTECTION: If recently edited locally, ignore server
                const currentEpoch = epochRef.current[initial.id] || 0;
                if (currentEpoch > 0) return current;

                // Reconciliation: Only accept if significant change
                const hasChanged =
                    Math.abs(initial.x - current.x) > 0.001 ||
                    Math.abs(initial.y - current.y) > 0.001 ||
                    initial.width !== current.width ||
                    initial.height !== current.height ||
                    initial.zIndex !== current.zIndex ||
                    initial.rotation !== current.rotation ||
                    initial.isLocked !== current.isLocked ||
                    initial.isHidden !== current.isHidden ||
                    JSON.stringify(initial.content) !== JSON.stringify(current.content);


                return hasChanged ? initial : current;
            });
        });
    }, [initialBlocks]);

    const updateBlocks = useCallback((ids: string[], updates: Partial<MoodBlock> | ((block: MoodBlock) => Partial<MoodBlock>)) => {
        // Optimistic State Update for all
        setBlocks(prev => {
            captureHistory(prev);

            return prev.map(block => {
                if (!ids.includes(block.id)) return block;

                const blockUpdates = typeof updates === 'function' ? updates(block) : updates;
                const updatedBlock = { ...block, ...blockUpdates };

                if (blockUpdates.content) {
                    updatedBlock.content = { ...(block.content || {}), ...blockUpdates.content };
                }

                // Lock Epoch
                epochRef.current[block.id] = (epochRef.current[block.id] || 0) + 1;
                // Accumulate
                pendingUpdates.current[block.id] = { ...pendingUpdates.current[block.id], ...blockUpdates };

                return updatedBlock;
            });
        });

        // Debounced Batch Backend Persistence
        ids.forEach(id => {
            scheduleBackendSave(id);
        });
    }, [captureHistory, scheduleBackendSave]);

    const undo = useCallback(() => {
        if (past.length === 0) return;

        isUndoRedoAction.current = true;
        setPast(prevPast => {
            const newPast = [...prevPast];
            const previousState = newPast.pop()!;

            setBlocks(currentBlocks => {
                setFuture(prevFuture => [currentBlocks, ...prevFuture]);

                // Compare and push backend updates via pendingUpdates logic
                previousState.forEach(prevBlock => {
                    const currBlock = currentBlocks.find(b => b.id === prevBlock.id);
                    if (!currBlock) {
                        // Foi deletado na action que estamos desfazendo, portanto RESTAURAR:
                        restoreMoodBlock(prevBlock.id).catch(e => console.error(e));
                    } else if (JSON.stringify(prevBlock) !== JSON.stringify(currBlock)) {
                        pendingUpdates.current[prevBlock.id] = prevBlock;
                        epochRef.current[prevBlock.id] = (epochRef.current[prevBlock.id] || 0) + 1;
                        scheduleBackendSave(prevBlock.id);
                    }
                });

                // Inversão: Se o bloco existe agora e NÂO existia no passado (ex: Desfazer a criação de um Bloco) 
                currentBlocks.forEach(currBlock => {
                    if (!previousState.find(b => b.id === currBlock.id)) {
                        deleteMoodBlock(currBlock.id).catch(e => console.error(e));
                    }
                });

                return previousState;
            });
            return newPast;
        });

        setTimeout(() => { isUndoRedoAction.current = false; }, 100);
    }, [past, scheduleBackendSave]);

    const redo = useCallback(() => {
        if (future.length === 0) return;

        isUndoRedoAction.current = true;
        setFuture(prevFuture => {
            const newFuture = [...prevFuture];
            const nextState = newFuture.shift()!;

            setBlocks(currentBlocks => {
                setPast(prevPast => [...prevPast, currentBlocks]);

                // Compare and push backend updates
                nextState.forEach(nextBlock => {
                    const currBlock = currentBlocks.find(b => b.id === nextBlock.id);
                    if (!currBlock) {
                        restoreMoodBlock(nextBlock.id).catch(e => console.error(e));
                    } else if (JSON.stringify(nextBlock) !== JSON.stringify(currBlock)) {
                        pendingUpdates.current[nextBlock.id] = nextBlock;
                        epochRef.current[nextBlock.id] = (epochRef.current[nextBlock.id] || 0) + 1;
                        scheduleBackendSave(nextBlock.id);
                    }
                });

                currentBlocks.forEach(currBlock => {
                    if (!nextState.find(b => b.id === currBlock.id)) {
                        deleteMoodBlock(currBlock.id).catch(e => console.error(e));
                    }
                });

                return nextState;
            });
            return newFuture;
        });

        setTimeout(() => { isUndoRedoAction.current = false; }, 100);
    }, [future, scheduleBackendSave]);

    const updateBlock = useCallback((id: string, updates: Partial<MoodBlock>) => {
        updateBlocks([id], updates);
    }, [updateBlocks]);

    // Helper for direct property updates
    const moveBlock = useCallback((id: string, x: number, y: number) => {
        updateBlock(id, { x, y });
    }, [updateBlock]);

    const removeBlocks = useCallback((ids: string[]) => {
        if (ids.length === 0) return;

        setBlocks(prev => {
            captureHistory(prev);
            return prev.filter(b => !ids.includes(b.id));
        });

        // Fire & Forget: Deleção Assíncrona via Banco
        ids.forEach(id => {
            deleteMoodBlock(id).catch(e => console.error("Optimistic delete failed", e));
        });

        toast(ids.length > 1 ? `${ids.length} widgets removidos` : 'Widget removido', {
            action: {
                label: 'Desfazer',
                onClick: () => undo()
            }
        });
    }, [captureHistory, undo]);

    return {
        blocks,
        setBlocks,
        updateBlock,
        updateBlocks,
        moveBlock,
        removeBlocks,
        isSaving,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0
    };
}
