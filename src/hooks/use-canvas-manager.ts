import { useState, useCallback, useRef, useEffect } from 'react';
import { updateMoodBlockLayout } from '@/actions/profile';
import { toast } from 'sonner';

import { MoodBlock } from '@/types/database';

// Helper type for local state (handling Prisma nulls vs optional)
type CanvasBlock = MoodBlock;

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
        setBlocks(prev => prev.map(block => {
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
        }));

        // Debounced Batch Backend Persistence
        ids.forEach(id => {
            if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
            saveTimers.current[id] = setTimeout(async () => {
                setIsSaving(true);
                const mergedUpdates = { ...pendingUpdates.current[id] };
                delete pendingUpdates.current[id];

                try {
                    const result = await updateMoodBlockLayout(id, mergedUpdates as any);
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
        });
    }, []);

    const updateBlock = useCallback((id: string, updates: Partial<MoodBlock>) => {
        updateBlocks([id], updates);
    }, [updateBlocks]);

    // Helper for direct property updates
    const moveBlock = useCallback((id: string, x: number, y: number) => {
        updateBlock(id, { x, y });
    }, [updateBlock]);

    return {
        blocks,
        setBlocks,
        updateBlock,
        updateBlocks,
        moveBlock,
        isSaving
    };
}
