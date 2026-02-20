"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface CanvasInteractionState {
    isDrawingMode: boolean
    setIsDrawingMode: (val: boolean) => void
    brushColor: string
    setBrushColor: (val: string) => void
    brushSize: number
    setBrushSize: (val: number) => void
}

const CanvasInteractionContext = createContext<CanvasInteractionState | undefined>(undefined)

export function CanvasInteractionProvider({ children }: { children: ReactNode }) {
    const [isDrawingMode, setIsDrawingMode] = useState(false)
    const [brushColor, setBrushColor] = useState("#000000")
    const [brushSize, setBrushSize] = useState(4)

    return (
        <CanvasInteractionContext.Provider
            value={{
                isDrawingMode,
                setIsDrawingMode,
                brushColor,
                setBrushColor,
                brushSize,
                setBrushSize
            }}
        >
            {children}
        </CanvasInteractionContext.Provider>
    )
}

export function useCanvasInteraction() {
    const context = useContext(CanvasInteractionContext)
    if (context === undefined) {
        throw new Error("useCanvasInteraction must be used within a CanvasInteractionProvider")
    }
    return context
}
