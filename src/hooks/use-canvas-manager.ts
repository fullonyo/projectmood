import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { updateMoodBlockLayout, deleteMoodBlock, restoreMoodBlock } from '@/actions/profile';
import { toast } from 'sonner';
import { createHistory, pushHistory, undoHistory, redoHistory, HistoryState } from '@/lib/canvas-history';
import { calculateAlignment, calculateDistribution, AlignmentType, DistributionType } from '@/lib/canvas-transforms';

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
    // 5. HISTORY SYSTEM (Centralizado)
    const [history, setHistory] = useState<HistoryState<MoodBlock[]>>(createHistory(blocks));
    const isUndoRedoAction = useRef(false);
    const historyDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    // 6. INTERACTION STATE MACHINE
    const [canvasState, setCanvasState] = useState<'IDLE' | 'DRAGGING' | 'RESIZING' | 'SELECTING'>('IDLE');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

        if (historyDebounceTimer.current) clearTimeout(historyDebounceTimer.current);
        historyDebounceTimer.current = setTimeout(() => {
            setHistory(prev => pushHistory(prev, currentState));
            historyDebounceTimer.current = null;
        }, 300);
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
        if (history.past.length === 0) return;

        isUndoRedoAction.current = true;
        setHistory(curr => {
            const newHistory = undoHistory(curr);
            const previousState = newHistory.present;
            const currentBlocks = curr.present;

            setBlocks(previousState);

            // Sync with backend
            previousState.forEach(prevBlock => {
                const currBlock = currentBlocks.find(b => b.id === prevBlock.id);
                if (!currBlock) {
                    restoreMoodBlock(prevBlock.id).catch(e => console.error(e));
                } else if (JSON.stringify(prevBlock) !== JSON.stringify(currBlock)) {
                    // Strip internal Prisma fields
                    const { id, userId, createdAt, updatedAt, deletedAt, ...updates } = prevBlock;
                    pendingUpdates.current[prevBlock.id] = updates;
                    epochRef.current[prevBlock.id] = (epochRef.current[prevBlock.id] || 0) + 1;
                    scheduleBackendSave(prevBlock.id);
                }
            });

            currentBlocks.forEach(currBlock => {
                if (!previousState.find(b => b.id === currBlock.id)) {
                    deleteMoodBlock(currBlock.id).catch(e => console.error(e));
                }
            });

            return newHistory;
        });

        setTimeout(() => { isUndoRedoAction.current = false; }, 100);
    }, [history, scheduleBackendSave]);

    const redo = useCallback(() => {
        if (history.future.length === 0) return;

        isUndoRedoAction.current = true;
        setHistory(curr => {
            const newHistory = redoHistory(curr);
            const nextState = newHistory.present;
            const currentBlocks = curr.present;

            setBlocks(nextState);

            // Sync with backend
            nextState.forEach(nextBlock => {
                const currBlock = currentBlocks.find(b => b.id === nextBlock.id);
                if (!currBlock) {
                    restoreMoodBlock(nextBlock.id).catch(e => console.error(e));
                } else if (JSON.stringify(nextBlock) !== JSON.stringify(currBlock)) {
                    // Strip internal Prisma fields
                    const { id, userId, createdAt, updatedAt, deletedAt, ...updates } = nextBlock;
                    pendingUpdates.current[nextBlock.id] = updates;
                    epochRef.current[nextBlock.id] = (epochRef.current[nextBlock.id] || 0) + 1;
                    scheduleBackendSave(nextBlock.id);
                }
            });

            currentBlocks.forEach(currBlock => {
                if (!nextState.find(b => b.id === currBlock.id)) {
                    deleteMoodBlock(currBlock.id).catch(e => console.error(e));
                }
            });

            return newHistory;
        });

        setTimeout(() => { isUndoRedoAction.current = false; }, 100);
    }, [history, scheduleBackendSave]);

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

    // ─── ALIGNMENT & DISTRIBUTION ───────────────────────────────────────────

    // Helper to get current canvas dimensions safely
    const getCanvasDimensions = useCallback(() => {
        if (typeof document === 'undefined') return { width: 2000, height: 2000 };
        const canvas = document.querySelector('.mood-canvas-stage');
        return {
            width: canvas?.clientWidth || 2000,
            height: canvas?.clientHeight || 2000
        };
    }, []);

    const alignSelected = useCallback((type: AlignmentType) => {
        const selectedIdArray = Array.isArray(selectedIds) ? selectedIds : [];
        if (selectedIdArray.length < 2) return;

        const selectedBlocks = blocks.filter(b => selectedIdArray.includes(b.id));
        const { width, height } = getCanvasDimensions();
        const updates = calculateAlignment(
            selectedBlocks as any,
            type,
            width,
            height
        );

        if (updates.length === 0) return;

        // 1. Filter for ACTUAL changes to avoid redundant captures and saves
        const actualUpdates = updates.filter(update => {
            const block = blocks.find(b => b.id === update.id);
            if (!block) return false;
            const xDelta = update.x !== undefined ? Math.abs(update.x - block.x) : 0;
            const yDelta = update.y !== undefined ? Math.abs(update.y - block.y) : 0;
            return xDelta > 0.0001 || yDelta > 0.0001;
        });

        if (actualUpdates.length === 0) return;

        // 2. Snapshot for History (Optimistic UI)
        setBlocks(prev => {
            captureHistory(prev);
            return prev.map(block => {
                const update = actualUpdates.find(u => u.id === block.id);
                if (!update) return block;
                const { id: _, ...cleanUpdates } = update;
                return { ...block, ...cleanUpdates };
            });
        });

        // 3. Side-Effects (Persistence) - Outside of state logic
        actualUpdates.forEach(update => {
            const { id, ...cleanUpdates } = update;
            pendingUpdates.current[id] = { ...pendingUpdates.current[id], ...cleanUpdates };
            epochRef.current[id] = (epochRef.current[id] || 0) + 1;
            scheduleBackendSave(id);
        });
    }, [selectedIds, blocks, getCanvasDimensions, captureHistory, scheduleBackendSave]);

    const distributeSelected = useCallback((axis: DistributionType) => {
        const selectedIdArray = Array.isArray(selectedIds) ? selectedIds : [];
        if (selectedIdArray.length < 3) return;

        const selectedBlocks = blocks.filter(b => selectedIdArray.includes(b.id));
        const { width, height } = getCanvasDimensions();
        const updates = calculateDistribution(
            selectedBlocks as any,
            axis,
            width,
            height
        );

        if (updates.length === 0) return;

        // 1. Filter actual changes
        const actualUpdates = updates.filter(update => {
            const block = blocks.find(b => b.id === update.id);
            if (!block) return false;
            const xDelta = update.x !== undefined ? Math.abs(update.x - block.x) : 0;
            const yDelta = update.y !== undefined ? Math.abs(update.y - block.y) : 0;
            return xDelta > 0.0001 || yDelta > 0.0001;
        });

        if (actualUpdates.length === 0) return;

        // 2. Snapshot for History
        setBlocks(prev => {
            captureHistory(prev);
            return prev.map(block => {
                const update = actualUpdates.find(u => u.id === block.id);
                if (!update) return block;
                const { id: _, ...cleanUpdates } = update;
                return { ...block, ...cleanUpdates };
            });
        });

        // 3. Side-Effects (Persistence)
        actualUpdates.forEach(update => {
            const { id, ...cleanUpdates } = update;
            pendingUpdates.current[id] = { ...pendingUpdates.current[id], ...cleanUpdates };
            epochRef.current[id] = (epochRef.current[id] || 0) + 1;
            scheduleBackendSave(id);
        });
    }, [selectedIds, blocks, getCanvasDimensions, captureHistory, scheduleBackendSave]);

    // ─── GROUPING ───────────────────────────────────────────────────────────

    const groupSelected = useCallback(() => {
        const selectedIdArray = Array.isArray(selectedIds) ? selectedIds : [];
        if (selectedIdArray.length < 2) return;
        const newGroupId = `group_${Date.now()}`;
        updateBlocks(selectedIdArray, { groupId: newGroupId });
        toast('Blocos agrupados');
    }, [selectedIds, updateBlocks]);

    const ungroupSelected = useCallback(() => {
        const selectedIdArray = Array.isArray(selectedIds) ? selectedIds : [];
        if (selectedIdArray.length === 0) return;

        // Find all unique groups in selection
        const groupsToDissolve = new Set(
            blocks.filter(b => selectedIdArray.includes(b.id) && b.groupId).map(b => b.groupId)
        );

        if (groupsToDissolve.size === 0) return;

        // Find ALL blocks belonging to these groups
        const blockIdsToUpdate = blocks
            .filter(b => b.groupId && groupsToDissolve.has(b.groupId))
            .map(b => b.id);

        updateBlocks(blockIdsToUpdate, { groupId: null });
        toast('Grupos desfeitos');
    }, [selectedIds, blocks, updateBlocks]);

    // Helper to wrap setSelectedIds and always include group members
    const setSmartSelectedIds = useCallback((newIdsOrFn: string[] | ((prev: string[]) => string[])) => {
        setSelectedIds(prev => {
            const next = typeof newIdsOrFn === 'function' ? newIdsOrFn(prev) : newIdsOrFn;
            if (next.length === 0) return [];

            // Expand selection to include all members of all groups touched by selection
            const groupsTouched = new Set(
                blocks.filter(b => next.includes(b.id) && b.groupId).map(b => b.groupId)
            );

            if (groupsTouched.size === 0) return next;

            const allMemberIds = blocks
                .filter(b => b.groupId && groupsTouched.has(b.groupId))
                .map(b => b.id);

            return [...new Set([...next, ...allMemberIds])];
        });
    }, [blocks]);

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
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        canvasState,
        setCanvasState,
        selectedIds,
        setSelectedIds: setSmartSelectedIds,
        alignSelected,
        distributeSelected,
        groupSelected,
        ungroupSelected
    };
}
