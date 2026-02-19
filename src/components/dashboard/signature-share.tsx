"use client"

import { useState } from "react"
import { Share2, Check, Link as LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SignatureShareProps {
    username: string
}

export function SignatureShare({ username }: SignatureShareProps) {
    const [status, setStatus] = useState<'idle' | 'copied'>('idle')

    const handleCopy = async () => {
        const url = `${window.location.origin}/${username}`
        try {
            await navigator.clipboard.writeText(url)
            setStatus('copied')
            setTimeout(() => setStatus('idle'), 3000)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto">
            <button
                onClick={handleCopy}
                className={cn(
                    "flex items-center gap-3 px-6 py-2.5 rounded-full transition-all duration-500",
                    "bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-lg group",
                    "hover:bg-white/10 dark:hover:bg-black/20 hover:scale-105 hover:border-white/20",
                    status === 'copied' && "bg-green-500/20 border-green-500/50"
                )}
            >
                <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500",
                    status === 'copied' ? "bg-green-500 text-white" : "bg-white/10 text-current group-hover:rotate-12"
                )}>
                    {status === 'copied' ? <Check className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                </div>

                <div className="flex flex-col items-start min-w-[100px]">
                    <span className="text-[7px] font-black uppercase tracking-[0.3em] opacity-40 leading-none mb-1">
                        Secure Studio URL
                    </span>
                    <span className="text-[10px] font-black tracking-widest uppercase leading-none">
                        {status === 'copied' ? "Signature Secured" : "Copy Signature"}
                    </span>
                </div>

                <Share2 className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
            </button>
        </div>
    )
}
