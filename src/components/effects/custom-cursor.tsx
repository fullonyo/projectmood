"use client"

import { useEffect } from 'react'

interface CustomCursorProps {
    type: string
}

export function CustomCursor({ type }: CustomCursorProps) {
    useEffect(() => {
        if (!type || type === 'auto') {
            document.body.style.cursor = 'auto'
            return
        }

        let cursorUrl = ''

        switch (type) {
            case 'retro':
                // Pixel arrow
                cursorUrl = 'url(https://cur.cursors-4u.net/cursors/cur-2/cur116.cur), auto'
                break
            case 'heart':
                // Cute heart
                cursorUrl = 'url(https://cur.cursors-4u.net/symbols/sym-1/sym49.cur), auto'
                break
            case 'pixel':
                // Pixel hand
                cursorUrl = 'url(https://cur.cursors-4u.net/cursors/cur-2/cur117.cur), auto'
                break
            case 'ghost':
                // Ghost icon
                cursorUrl = 'url(https://cur.cursors-4u.net/user/use-1/use15.cur), auto'
                break
            default:
                cursorUrl = 'auto'
        }

        document.body.style.cursor = cursorUrl

        // Apply to all clickable elements for consistency
        const style = document.createElement('style')
        style.innerHTML = `
            a, button, [role="button"], input, select, textarea {
                cursor: ${cursorUrl} !important;
            }
        `
        style.id = 'custom-cursor-style'
        document.head.appendChild(style)

        return () => {
            document.body.style.cursor = 'auto'
            const existingStyle = document.getElementById('custom-cursor-style')
            if (existingStyle) existingStyle.remove()
        }
    }, [type])

    return null
}
