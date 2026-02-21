"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, Download, QrCode } from "lucide-react"
import { useTranslation } from "@/i18n/context"

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
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-10 rounded-none border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] px-4 gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                >
                    {copied ? (
                        <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
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
                    size="sm"
                    onClick={() => setShowQR(!showQR)}
                    className="h-10 rounded-none border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] px-4 gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                >
                    <QrCode className="w-3.5 h-3.5" />
                    {t('editors.share.qr_code')}
                </Button>
            </div>

            {showQR && (
                <div className="absolute top-full right-0 mt-4 p-6 bg-white dark:bg-zinc-950 rounded-none border border-black dark:border-white z-50 shadow-2xl">
                    <div className="space-y-4">
                        <div className="bg-white p-4 border border-zinc-100">
                            <QRCodeSVG
                                id="qr-code-svg"
                                value={profileUrl}
                                size={180}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                <p className="text-[8px] text-zinc-400 text-center font-mono break-all uppercase tracking-widest leading-relaxed">
                                    {profileUrl}
                                </p>
                            </div>

                            <Button
                                onClick={handleDownloadQR}
                                size="sm"
                                className="w-full h-12 bg-black dark:bg-white text-white dark:text-black rounded-none text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Download className="w-3.5 h-3.5 mr-2" />
                                {t('editors.share.save_qr')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
