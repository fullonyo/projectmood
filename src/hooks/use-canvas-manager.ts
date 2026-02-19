import { useState, useCallback, useRef, useEffect } from 'react';
import { updateMoodBlockLayout } from '@/actions/profile';
import { toast } from 'sonner';

interface Block {
    id: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    zIndex?: number;
    rotation?: number;
    content?: any;
    [key: string]: any;
}

export function useCanvasManager(initialBlocks: Block[]) {
    const [isSaving, setIsSaving] = useState(false);

    // 1. SOVEREIGN STATE: Local state is the absolute master.
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

    // 2. EPOCH SYSTEM: Prevent race conditions with server updates
    const epochRef = useRef<Record<string, number>>({});

    // 3. PERSISTENCE QUEUE: Debounce saving
    const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});

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
                    initial.zIndex !== current.zIndex ||
                    initial.rotation !== current.rotation ||
                    JSON.stringify(initial.content) !== JSON.stringify(current.content);

                return hasChanged ? initial : current;
            });
        });
    }, [initialBlocks]);

    const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
        // Increment Epoch (Lock)
        epochRef.current[id] = (epochRef.current[id] || 0) + 1;

        // Optimistic State Update
        setBlocks(prev => prev.map(block => {
            if (block.id !== id) return block;

            const updatedBlock = { ...block, ...updates };

            // Deep merge content if provided
            if (updates.content) {
                updatedBlock.content = { ...(block.content || {}), ...updates.content };
            }

            return updatedBlock;
        }));

        // Debounced Backend Persistence
        if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);

        saveTimers.current[id] = setTimeout(async () => {
            setIsSaving(true);
            try {
                // Here we pick the MOST RECENT values from our reference state
                // But since we are in a closure, we use the values passed to updateBlock
                // as a starting point, but we could also use a ref to the full state.
                const result = await updateMoodBlockLayout(id, updates);
                if (result?.error) throw new Error(result.error);

                // Release lock after stabilization
                setTimeout(() => {
                    epochRef.current[id] = Math.max(0, (epochRef.current[id] || 0) - 1);
                }, 1500);

            } catch (error) {
                console.error("Failed to sync block:", id, error);
                toast.error("Erro de sincronização");
            } finally {
                setIsSaving(false);
            }
        }, 800);
    }, []);

    // Helper for direct property updates
    const moveBlock = useCallback((id: string, x: number, y: number) => {
        updateBlock(id, { x, y });
    }, [updateBlock]);

    return {
        blocks,
        setBlocks,
        updateBlock,
        moveBlock,
        isSaving
    };
}
