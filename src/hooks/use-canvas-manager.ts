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
                // Also protect against NaN/Infinity which can crash Zod/Prisma
                const sanitizedUpdates = Object.fromEntries(
                    Object.entries(mergedUpdates)
                        .filter(([k, v]) => {
                            // Filter out fields updateMoodBlockLayout doesn't handle or that are invalid
                            if (['id', 'userId', 'createdAt', 'updatedAt', 'deletedAt', 'type'].includes(k)) return false;
                            if (typeof v === 'number' && (isNaN(v) || !isFinite(v))) return false;
                            return true;
                        })
                        .map(([k, v]) => [k, v === null ? undefined : v])
                ) as Parameters<typeof updateMoodBlockLayout>[1];

                if (Object.keys(sanitizedUpdates).length === 0) {
                    epochRef.current[id] = Math.max(0, (epochRef.current[id] || 0) - 1);
                    return;
                }

                const result = await updateMoodBlockLayout(id, sanitizedUpdates);
                if (result?.error) throw new Error(result.error);

                setTimeout(() => {
                    epochRef.current[id] = Math.max(0, (epochRef.current[id] || 0) - 1);
                }, 1500);
            } catch (error) {
                console.error("Batch sync failed for", id, error);
                // toast.error(`Falha ao sincronizar bloco: ${id}`);
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
                // Accumulate updates, deep merging content if necessary
                const currentPending = pendingUpdates.current[block.id] || {};
                const newPending = { ...currentPending, ...blockUpdates };

                if (blockUpdates.content && currentPending.content) {
                    newPending.content = { ...(currentPending.content as any), ...(blockUpdates.content as any) };
                }

                pendingUpdates.current[block.id] = newPending;

                return updatedBlock;
            });
        });

        // Debounced Batch Backend Persistence
        ids.forEach(id => {
            scheduleBackendSave(id);
        });
    }, [captureHistory, scheduleBackendSave]);

    const applyHistoryAction = useCallback(async (action: 'undo' | 'redo') => {
        const isUndo = action === 'undo';
        if (isUndo && history.past.length === 0) return;
        if (!isUndo && history.future.length === 0) return;

        const safeRestore = async (id: string) => {
            for (let i = 0; i < 2; i++) {
                try {
                    const res = await restoreMoodBlock(id);
                    if (!res?.error) return true;
                } catch (e) { }
                await new Promise(r => setTimeout(r, 500 * (i + 1)));
            }
            return false;
        };

        const safeDelete = async (id: string) => {
            for (let i = 0; i < 2; i++) {
                try {
                    const res = await deleteMoodBlock(id);
                    if (!res?.error) return true;
                } catch (e) { }
                await new Promise(r => setTimeout(r, 500 * (i + 1)));
            }
            return false;
        };

        isUndoRedoAction.current = true;
        const curr = history;
        const newHistory = isUndo ? undoHistory(curr) : redoHistory(curr);
        const nextState = newHistory.present;
        const currentBlocks = curr.present;

        setBlocks(nextState);
        setHistory(newHistory);

        // Sync with backend
        const syncPromises = nextState.map(async (nextBlock) => {
            const currBlock = currentBlocks.find(b => b.id === nextBlock.id);
            if (!currBlock) {
                const ok = await safeRestore(nextBlock.id);
                if (!ok) toast.error(`Erro ao restaurar bloco ${nextBlock.id.slice(0, 4)}...`);
            } else if (JSON.stringify(nextBlock) !== JSON.stringify(currBlock)) {
                const { id, userId, createdAt, updatedAt, deletedAt, ...updates } = nextBlock;
                pendingUpdates.current[nextBlock.id] = updates;
                epochRef.current[nextBlock.id] = (epochRef.current[nextBlock.id] || 0) + 1;
                scheduleBackendSave(nextBlock.id);
            }
        });

        const deletePromises = currentBlocks
            .filter(currBlock => !nextState.find(b => b.id === currBlock.id))
            .map(async (currBlock) => {
                const ok = await safeDelete(currBlock.id);
                if (!ok) toast.error(`Erro ao remover bloco ${currBlock.id.slice(0, 4)}...`);
            });

        await Promise.all([...syncPromises, ...deletePromises]);
        setTimeout(() => { isUndoRedoAction.current = false; }, 100);
    }, [history, scheduleBackendSave]);

    const undo = useCallback(() => applyHistoryAction('undo'), [applyHistoryAction]);
    const redo = useCallback(() => applyHistoryAction('redo'), [applyHistoryAction]);

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

    const applyTransform = useCallback((
        minRequired: number,
        transformFn: (blocks: MoodBlock[], w: number, h: number) => { id: string, x?: number, y?: number }[]
    ) => {
        const selectedIdArray = Array.isArray(selectedIds) ? selectedIds : [];
        if (selectedIdArray.length < minRequired) return;

        const selectedBlocks = blocks.filter(b => selectedIdArray.includes(b.id));
        const { width, height } = getCanvasDimensions();
        const updates = transformFn(selectedBlocks, width, height);

        if (updates.length === 0) return;

        // 1. Filter for ACTUAL changes
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

        // 3. Side-Effects (Persistence)
        actualUpdates.forEach(update => {
            const { id, ...cleanUpdates } = update;
            pendingUpdates.current[id] = { ...pendingUpdates.current[id], ...cleanUpdates };
            epochRef.current[id] = (epochRef.current[id] || 0) + 1;
            scheduleBackendSave(id);
        });
    }, [selectedIds, blocks, getCanvasDimensions, captureHistory, scheduleBackendSave]);

    const alignSelected = useCallback((type: AlignmentType) => {
        applyTransform(2, (selected, w, h) => calculateAlignment(selected as any, type, w, h));
    }, [applyTransform]);

    const distributeSelected = useCallback((axis: DistributionType) => {
        applyTransform(3, (selected, w, h) => calculateDistribution(selected as any, axis, w, h));
    }, [applyTransform]);

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
