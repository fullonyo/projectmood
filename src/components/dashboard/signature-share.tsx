"use client"

import { useState } from "react"
import { Check, Link as LinkIcon, Fingerprint } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

interface SignatureShareProps {
    username: string
}

export function SignatureShare({ username }: SignatureShareProps) {
    const { t } = useTranslation()
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
        <div className="fixed bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 z-[60] mix-blend-difference pointer-events-auto group">
            <button
                onClick={handleCopy}
                className="flex items-center gap-4 group/btn outline-none"
            >
                {/* Visual Connector Line */}
                <div className="h-[1px] w-6 bg-current opacity-20 group-hover:w-10 transition-all duration-700" />

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                        <Fingerprint className={cn(
                            "w-3 h-3 transition-all duration-500",
                            status === 'copied' ? "text-green-500 scale-125" : "opacity-40 group-hover:rotate-12"
                        )} />
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-40">
                            {t('public_page.share.title')}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "text-[10px] font-mono tracking-[0.2em] uppercase transition-all duration-500",
                            status === 'copied' ? "text-green-500 font-black italic" : "opacity-60 group-hover:opacity-100"
                        )}>
                            {status === 'copied' ? t('public_page.share.copied') : `moodspace.me/${username}`}
                        </span>

                        <div className={cn(
                            "w-4 h-4 rounded-none border border-current flex items-center justify-center transition-all duration-500",
                            status === 'copied' ? "bg-current shadow-none" : "opacity-20 group-hover:opacity-100"
                        )}>
                            {status === 'copied' ? <Check className="w-2 h-2 mix-blend-difference invert" /> : <LinkIcon className="w-2 h-2" />}
                        </div>
                    </div>

                    {/* Technical Barcode Decoration */}
                    <div className="mt-2 flex gap-0.5 opacity-10 group-hover:opacity-30 transition-opacity">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-[1px] bg-current",
                                    i % 3 === 0 ? "h-2" : "h-1"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div className="h-[1px] w-6 bg-current opacity-20 group-hover:w-10 transition-all duration-700" />
            </button>
        </div>
    )
}
