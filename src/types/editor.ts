/**
 * Tipos base compartilhados entre todos os editores de blocos.
 *
 * Centraliza as interfaces de props que antes eram redefinidas
 * independentemente em cada Universal{X}Editor.
 */

import type { MoodBlock } from "./database"

// ─── Props Base ───────────────────────────────────────────────────────────────

/**
 * Interface base para todos os editores de blocos.
 *
 * @property block - Bloco existente (modo edição) ou null/undefined (modo criação)
 * @property onUpdate - Callback para live-preview em tempo real
 * @property onAdd - Callback para criação de novo bloco
 * @property onClose - Callback para fechar o editor
 */
export interface BaseEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (type: string, content: any) => Promise<void>
    onClose?: () => void
}

/**
 * Variante de BaseEditorProps para editores com conteúdo tipado.
 * Permite que `onAdd` receba o content diretamente em vez de `(type, content)`.
 *
 * @example
 * interface CountdownEditorProps extends TypedEditorProps<CountdownContent> {}
 */
export interface TypedEditorProps<TContent = any> {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (content: TContent) => Promise<void>
    onClose?: () => void
}
