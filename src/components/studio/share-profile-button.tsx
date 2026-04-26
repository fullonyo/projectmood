"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, Download, QrCode, Activity, Link2 } from "lucide-react"
import { useTranslation } from "@/i18n/context"

import { cn } from "@/lib/utils"
import { EditorHeader } from "./EditorUI"

interface ShareProfileButtonProps {
    username: string
    isPrimary?: boolean
    slug?: string
}

export function ShareProfileButton({ username, isPrimary = true, slug }: ShareProfileButtonProps) {
    const { t } = useTranslation()
    const [showOptions, setShowOptions] = useState(false)
    const [copied, setCopied] = useState(false)

    const path = isPrimary ? `/@${username.toLowerCase()}` : `/@${username.toLowerCase()}/${slug}`
    const profileUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${path}`
        : `https://mood.space${path}`

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(profileUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleDownloadQR = () => {
        const svg = document.getElementById('qr-code-svg')
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)
            const pngFile = canvas.toDataURL('image/png')

            const downloadLink = document.createElement('a')
            downloadLink.download = `${username}-qrcode.png`
            downloadLink.href = pngFile
            downloadLink.click()
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }

    return (
        <div className="relative w-full">
            <Button
                variant="outline"
                onClick={() => setShowOptions(!showOptions)}
                className={cn(
                    "w-full h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm",
                    showOptions && "border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20"
                )}
            >
                <Link2 className="w-3.5 h-3.5" />
                {t('editors.share.link')}
            </Button>

            {showOptions && (
                <div className="absolute bottom-full right-0 mb-4 p-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-900 z-[100] shadow-2xl w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="space-y-8">
                        <EditorHeader 
                            title={t('editors.share.link')}
                            subtitle="Escolha como compartilhar seu espaço"
                            onClose={() => setShowOptions(false)}
                        />

                        <div className="grid grid-cols-1 gap-4">
                            <Button
                                variant="outline"
                                onClick={handleCopyLink}
                                className="w-full h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between px-6 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Copy className="w-4 h-4" />
                                    <span>{copied ? t('editors.share.copied') : "Copiar Link"}</span>
                                </div>
                                {copied && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                            </Button>

                            <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800/50 my-2" />

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 px-1">
                                    <QrCode className="w-4 h-4 text-zinc-400" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{t('editors.share.qr_code')}</span>
                                </div>
                                
                                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-inner flex items-center justify-center">
                                    <QRCodeSVG
                                        id="qr-code-svg"
                                        value={profileUrl}
                                        size={180}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>

                                <Button
                                    onClick={handleDownloadQR}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {t('editors.share.save_qr')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}
