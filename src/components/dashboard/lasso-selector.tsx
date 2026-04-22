"use client"
import { useState, useEffect, useCallback } from "react"

interface LassoSelectorProps {
    canvasRef: React.RefObject<HTMLDivElement | null>
    onSelectionChange: (selectedIds: string[], isShift: boolean) => void
    isSpacePressed: boolean
}

export function LassoSelector({ canvasRef, onSelectionChange, isSpacePressed }: LassoSelectorProps) {
    const [rect, setRect] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null)

    const handleMouseDown = useCallback((e: MouseEvent) => {
        if (isSpacePressed || e.button !== 0 || e.ctrlKey || e.metaKey) return

        const target = e.target as HTMLElement
        if (target.closest('[data-block-id]') || target.closest('button, .action-toolbar, .context-menu')) return

        setRect({ x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY })
    }, [isSpacePressed])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!rect) return
        setRect(prev => prev ? ({ ...prev, x2: e.clientX, y2: e.clientY }) : null)
    }, [rect])

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (!rect) return

        const bounds = {
            left: Math.min(rect.x1, rect.x2),
            top: Math.min(rect.y1, rect.y2),
            right: Math.max(rect.x1, rect.x2),
            bottom: Math.max(rect.y1, rect.y2)
        }

        const isDrag = Math.abs(bounds.right - bounds.left) > 10 || Math.abs(bounds.bottom - bounds.top) > 10

        if (!isDrag) {
            onSelectionChange([], e.shiftKey)
            setRect(null)
            return
        }

        const newSelectedIds: string[] = []
        const blockElements = document.querySelectorAll('[data-block-id]')

        blockElements.forEach(el => {
            const blockRect = el.getBoundingClientRect()
            const blockId = el.getAttribute('data-block-id')

            if (blockId &&
                blockRect.left < bounds.right &&
                blockRect.right > bounds.left &&
                blockRect.top < bounds.bottom &&
                blockRect.bottom > bounds.top
            ) {
                newSelectedIds.push(blockId)
            }
        })

        onSelectionChange(newSelectedIds, e.shiftKey)
        setRect(null)
    }, [rect, onSelectionChange])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [canvasRef, handleMouseDown, handleMouseMove, handleMouseUp])

    if (!rect) return null

    return (
        <div
            style={{
                position: 'fixed',
                left: Math.min(rect.x1, rect.x2),
                top: Math.min(rect.y1, rect.y2),
                width: Math.abs(rect.x2 - rect.x1),
                height: Math.abs(rect.y2 - rect.y1),
                border: '1.5px solid #3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                zIndex: 99999,
                pointerEvents: 'none',
                borderRadius: '2px'
            }}
        />
    )
}
