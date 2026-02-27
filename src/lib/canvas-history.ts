/**
 * canvas-history.ts
 * 
 * Utilitário para gerenciar a pilha de desfazer/refazer do canvas.
 * Mantém um limite de estados para evitar consumo excessivo de memória.
 */

export interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

export const MAX_HISTORY_STEPS = 50;

export function createHistory<T>(initialState: T): HistoryState<T> {
    return {
        past: [],
        present: initialState,
        future: [],
    };
}

export function pushHistory<T>(state: HistoryState<T>, newState: T): HistoryState<T> {
    // Se o novo estado for idêntico ao atual (comparação rasa ou customizada), ignorar
    if (JSON.stringify(state.present) === JSON.stringify(newState)) return state;

    return {
        past: [...state.past.slice(-MAX_HISTORY_STEPS + 1), state.present],
        present: newState,
        future: [], // Limpa o futuro ao realizar nova ação
    };
}

export function undoHistory<T>(state: HistoryState<T>): HistoryState<T> {
    if (state.past.length === 0) return state;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);

    return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
    };
}

export function redoHistory<T>(state: HistoryState<T>): HistoryState<T> {
    if (state.future.length === 0) return state;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
    };
}
