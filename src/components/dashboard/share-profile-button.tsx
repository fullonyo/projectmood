"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, Download, QrCode, Activity } from "lucide-react"
import { useTranslation } from "@/i18n/context"

import { cn } from "@/lib/utils"
import { EditorHeader } from "./EditorUI"

interface ShareProfileButtonProps {
    username: string
}

export function ShareProfileButton({ username }: ShareProfileButtonProps) {
    const { t } = useTranslation()
    const [showQR, setShowQR] = useState(false)
    const [copied, setCopied] = useState(false)

    const profileUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${username}`
        : `https://mood.app/${username}`

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
        <div className="relative">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className="flex-1 h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest gap-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                >
                    {copied ? (
                        <>
                            <Copy className="w-3.5 h-3.5 text-blue-500" />
                            {t('editors.share.copied')}
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            {t('editors.share.link')}
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    onClick={() => setShowQR(!showQR)}
                    className={cn(
                        "h-12 w-12 rounded-2xl border-zinc-100 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 transition-all shadow-sm",
                        showQR && "border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    )}
                    title={t('editors.share.qr_code')}
                >
                    <QrCode className="w-4 h-4" />
                </Button>
            </div>

            {
                showQR && (
                    <div className="absolute top-full right-0 mt-4 p-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-900 z-50 shadow-2xl w-[320px] animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="space-y-8">
                            <EditorHeader 
                                title={t('editors.share.qr_code')}
                                subtitle="Escaneie para acessar o espaço"
                            />

                            <div className="bg-zinc-50 dark:bg-white p-6 rounded-3xl border border-zinc-100 dark:border-zinc-200 shadow-inner flex items-center justify-center">
                                <QRCodeSVG
                                    id="qr-code-svg"
                                    value={profileUrl}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[10px] text-zinc-400 text-center font-medium break-all lowercase tracking-wide leading-relaxed">
                                        {profileUrl}
                                    </p>
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
                )
            }
        </div >
    )
}
