import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { updateMoodBlockLayout, deleteMoodBlock, restoreMoodBlock } from '@/actions/profile';
import { toast } from 'sonner';
import { createHistory, pushHistory, undoHistory, redoHistory, HistoryState } from '@/lib/canvas-history';
import { calculateAlignment, calculateDistribution, AlignmentType, DistributionType } from '@/lib/canvas-transforms';

import { MoodBlock } from '@/types/database';

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
    const [history, setHistory] = useState<HistoryState<MoodBlock[]>>(createHistory(blocks));
    const isUndoRedoAction = useRef(false);
    const historyDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    // 6. INTERACTION STATE MACHINE
    const [canvasState, setCanvasState] = useState<'IDLE' | 'DRAGGING' | 'RESIZING' | 'SELECTING'>('IDLE');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // 7. PERSISTENCE LOGIC
    const scheduleBackendSave = useCallback((id: string) => {
        if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
        saveTimers.current[id] = setTimeout(async () => {
            setIsSaving(true);
            const mergedUpdates = { ...pendingUpdates.current[id] };
            delete pendingUpdates.current[id];

            try {
                const sanitizedUpdates = Object.fromEntries(
                    Object.entries(mergedUpdates)
                        .filter(([k, v]) => {
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

    const updateBlocks = useCallback((ids: string[], updates: Partial<MoodBlock> | ((block: MoodBlock) => Partial<MoodBlock>)) => {
        setBlocks(prev => {
            captureHistory(prev);

            return prev.map(block => {
                if (!ids.includes(block.id)) return block;

                const blockUpdates = typeof updates === 'function' ? updates(block) : updates;
                const updatedBlock = { ...block, ...blockUpdates };

                if (blockUpdates.content) {
                    updatedBlock.content = { ...(block.content || {}), ...blockUpdates.content };
                }

                epochRef.current[block.id] = (epochRef.current[block.id] || 0) + 1;
                const currentPending = pendingUpdates.current[block.id] || {};
                const newPending = { ...currentPending, ...blockUpdates };

                if (blockUpdates.content && currentPending.content) {
                    newPending.content = { ...(currentPending.content as any), ...(blockUpdates.content as any) };
                }

                pendingUpdates.current[block.id] = newPending;
                return updatedBlock;
            });
        });

        ids.forEach(id => {
            scheduleBackendSave(id);
        });
    }, [captureHistory, scheduleBackendSave]);

    // 8. LAYER MANAGEMENT (Z-Index)
    const maxZ = useMemo(() => {
        if (blocks.length === 0) return 20;
        return Math.max(20, ...blocks.map(b => b.zIndex || 0));
    }, [blocks]);

    const bringToFront = useCallback((id: string) => {
        updateBlocks([id], { zIndex: maxZ + 1 });
    }, [maxZ, updateBlocks]);

    const sendToBack = useCallback((id: string) => {
        const minZ = Math.min(...blocks.map(b => b.zIndex || 10));
        updateBlocks([id], { zIndex: Math.max(1, minZ - 1) });
    }, [blocks, updateBlocks]);

    const bringForward = useCallback((id: string) => {
        const currentBlock = blocks.find(b => b.id === id);
        if (!currentBlock) return;
        const currentZ = currentBlock.zIndex || 0;
        const above = blocks
            .filter(b => (b.zIndex || 0) > currentZ)
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        
        if (above.length > 0) {
            updateBlocks([id], { zIndex: (above[0].zIndex || 0) + 1 });
        } else {
            bringToFront(id);
        }
    }, [blocks, bringToFront, updateBlocks]);

    const sendBackward = useCallback((id: string) => {
        const currentBlock = blocks.find(b => b.id === id);
        if (!currentBlock) return;
        const currentZ = currentBlock.zIndex || 0;
        const below = blocks
            .filter(b => (b.zIndex || 0) < currentZ)
            .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
        
        if (below.length > 0) {
            updateBlocks([id], { zIndex: Math.max(1, (below[0].zIndex || 10) - 1) });
        } else {
            sendToBack(id);
        }
    }, [blocks, sendToBack, updateBlocks]);

    // 9. HISTORY CONTROL
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

        const syncPromises = nextState.map(async (nextBlock) => {
            const currBlock = currentBlocks.find(b => b.id === nextBlock.id);
            if (!currBlock) {
                await safeRestore(nextBlock.id);
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
                await safeDelete(currBlock.id);
            });

        await Promise.all([...syncPromises, ...deletePromises]);
        setTimeout(() => { isUndoRedoAction.current = false; }, 100);
    }, [history, scheduleBackendSave]);

    const undo = useCallback(() => applyHistoryAction('undo'), [applyHistoryAction]);
    const redo = useCallback(() => applyHistoryAction('redo'), [applyHistoryAction]);

    // 10. SMART SELECTION
    const setSmartSelectedIds = useCallback((newIdsOrFn: string[] | ((prev: string[]) => string[])) => {
        setSelectedIds(prev => {
            const next = typeof newIdsOrFn === 'function' ? newIdsOrFn(prev) : newIdsOrFn;
            if (next.length === 0) return [];

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

    // 11. ACTIONS
    const updateBlock = useCallback((id: string, updates: Partial<MoodBlock>) => {
        updateBlocks([id], updates);
    }, [updateBlocks]);

    const moveBlock = useCallback((id: string, x: number, y: number) => {
        updateBlock(id, { x, y });
    }, [updateBlock]);

    const removeBlocks = useCallback((ids: string[]) => {
        if (ids.length === 0) return;

        setBlocks(prev => {
            captureHistory(prev);
            return prev.filter(b => !ids.includes(b.id));
        });

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

        const actualUpdates = updates.filter(update => {
            const block = blocks.find(b => b.id === update.id);
            if (!block) return false;
            const xDelta = update.x !== undefined ? Math.abs(update.x - block.x) : 0;
            const yDelta = update.y !== undefined ? Math.abs(update.y - block.y) : 0;
            return xDelta > 0.0001 || yDelta > 0.0001;
        });

        if (actualUpdates.length === 0) return;

        const updatesById: Record<string, Partial<MoodBlock>> = {};
        actualUpdates.forEach(u => {
            const { id, ...clean } = u;
            updatesById[id] = clean;
        });

        updateBlocks(actualUpdates.map(u => u.id), (block) => updatesById[block.id] || {});
    }, [selectedIds, blocks, getCanvasDimensions, updateBlocks]);

    const alignSelected = useCallback((type: AlignmentType) => {
        applyTransform(2, (selected, w, h) => calculateAlignment(selected as any, type, w, h));
    }, [applyTransform]);

    const distributeSelected = useCallback((axis: DistributionType) => {
        applyTransform(3, (selected, w, h) => calculateDistribution(selected as any, axis, w, h));
    }, [applyTransform]);

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

        const groupsToDissolve = new Set(
            blocks.filter(b => selectedIdArray.includes(b.id) && b.groupId).map(b => b.groupId)
        );

        if (groupsToDissolve.size === 0) return;

        const blockIdsToUpdate = blocks
            .filter(b => b.groupId && groupsToDissolve.has(b.groupId))
            .map(b => b.id);

        updateBlocks(blockIdsToUpdate, { groupId: null });
        toast('Grupos desfeitos');
    }, [selectedIds, blocks, updateBlocks]);

    // SAFEGUARD (DIRTY TRACKING)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isSaving || Object.keys(pendingUpdates.current).length > 0) {
                e.preventDefault();
                e.returnValue = '';
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
                const currentEpoch = epochRef.current[initial.id] || 0;
                if (currentEpoch > 0) return current;

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
        ungroupSelected,
        maxZ,
        bringToFront,
        sendToBack,
        bringForward,
        sendBackward
    };
}
