"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

interface BlockErrorBoundaryProps {
    blockType: string
    children: ReactNode
}

interface BlockErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

/**
 * Error Boundary para blocos individuais.
 * Isola falhas de renderização — um bloco corrompido não derruba a página inteira.
 * Implementado como class component porque React hooks não suportam componentDidCatch.
 */
export class BlockErrorBoundary extends Component<BlockErrorBoundaryProps, BlockErrorBoundaryState> {
    constructor(props: BlockErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): BlockErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`[BlockErrorBoundary] Bloco "${this.props.blockType}" crashou:`, error, errorInfo)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full min-h-[60px] flex flex-col items-center justify-center gap-3 p-4 bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 backdrop-blur-sm">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-red-400">
                        {this.props.blockType} · erro
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                    >
                        <RotateCcw className="w-3 h-3" />
                        retry
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
