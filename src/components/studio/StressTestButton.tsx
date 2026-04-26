"use client"

import { useEffect } from "react"
import { toast } from "sonner"

interface StressTestButtonProps {
    onSpawn: (blocks: any[]) => void
}

// Usando export nomeado para consistência com o projeto
export function StressTestButton({ onSpawn }: StressTestButtonProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault()
                toast.promise(async () => {
                    const many = Array.from({ length: 50 }).map((_, i) => ({
                        id: `stress-${Math.random()}`,
                        type: i % 2 === 0 ? 'photo' : 'text',
                        x: Math.random() * 80,
                        y: Math.random() * 80,
                        width: 150 + Math.random() * 100,
                        height: 150 + Math.random() * 100,
                        zIndex: 10 + i,
                        content: { title: `Stress Test ${i}` }
                    }))
                    onSpawn(many)
                }, {
                    loading: 'Injetando 50 blocos para teste de estresse...',
                    success: 'Stress test ativo! Verifique a fluidez do Canvas.',
                    error: 'Erro no teste de estresse'
                })
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onSpawn])

    return null
}
