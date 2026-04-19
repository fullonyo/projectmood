import { useEffect, useTransition, useCallback, useRef } from "react"
import type { MoodBlock } from "@/types/database"

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseEditorSyncOptions {
    /** Bloco existente (modo edição) ou null (modo criação) */
    block?: MoodBlock | null
    /** Callback para live-preview (atualiza canvas em tempo real) */
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    /** Callback para adicionar novo bloco */
    onAdd?: (type: string, content: any) => Promise<void>
    /** Callback para fechar o editor */
    onClose?: () => void
}

interface UseEditorSyncReturn {
    /** Indica se uma ação assíncrona está em andamento */
    isPending: boolean
    /** Envolve chamadas assíncronas com estado de loading */
    startTransition: ReturnType<typeof useTransition>[1]
    /** Executa live-preview: atualiza o bloco no canvas em tempo real */
    syncPreview: (content: Record<string, any>) => void
    /**
     * Salva/fecha o editor:
     * - Se bloco existente: fecha o editor (preview já foi aplicado via syncPreview)
     * - Se bloco novo: chama onAdd e fecha
     */
    handleSave: (type: string, content: Record<string, any>, addOptions?: { width?: number; height?: number }) => void
    /** Se está editando um bloco existente */
    isEditing: boolean
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook que encapsula o padrão de live-preview + save que se repete
 * em todos os editores de blocos.
 *
 * **Padrão anterior (repetido 7+ vezes):**
 * ```tsx
 * const [isPending, startTransition] = useTransition()
 *
 * useEffect(() => {
 *     if (!block?.id || !onUpdate) return
 *     onUpdate(block.id, { content: { ...updates } })
 * }, [deps...])
 *
 * const handleSave = () => {
 *     startTransition(async () => {
 *         if (block?.id) { if (onClose) onClose() }
 *         else if (onAdd) { await onAdd(type, content); if (onClose) onClose() }
 *     })
 * }
 * ```
 *
 * **Com o hook:**
 * ```tsx
 * const { isPending, syncPreview, handleSave, isEditing } = useEditorSync({ block, onUpdate, onAdd, onClose })
 *
 * useEffect(() => { syncPreview({ color, opacity }) }, [color, opacity])
 *
 * <Button onClick={() => handleSave('shape', { color, opacity })}>
 *     {isEditing ? 'Atualizar' : 'Criar'}
 * </Button>
 * ```
 */
export function useEditorSync({
    block,
    onUpdate,
    onAdd,
    onClose
}: UseEditorSyncOptions): UseEditorSyncReturn {
    const [isPending, startTransition] = useTransition()
    const isEditing = Boolean(block?.id)

    /**
     * Executa live-preview: atualiza o bloco no canvas em tempo real.
     * Só executa se existir um bloco com ID e um callback onUpdate.
     */
    const syncPreview = useCallback((content: Record<string, any>) => {
        if (!block?.id || !onUpdate) return
        onUpdate(block.id, { content })
    }, [block?.id, onUpdate])

    /**
     * Salva ou fecha o editor:
     * - Modo edição: simplesmente fecha (o preview já aplicou as mudanças)
     * - Modo criação: cria o bloco via onAdd e fecha
     */
    const handleSave = useCallback((
        type: string,
        content: Record<string, any>,
        addOptions?: { width?: number; height?: number }
    ) => {
        startTransition(async () => {
            if (isEditing) {
                onClose?.()
            } else if (onAdd) {
                if (addOptions) {
                    // Para editores que usam addMoodBlock diretamente
                    const { addMoodBlock } = await import("@/actions/profile")
                    await addMoodBlock(type, content, addOptions)
                } else {
                    await onAdd(type, content)
                }
                onClose?.()
            }
        })
    }, [isEditing, onAdd, onClose, startTransition])

    return {
        isPending,
        startTransition,
        syncPreview,
        handleSave,
        isEditing
    }
}
