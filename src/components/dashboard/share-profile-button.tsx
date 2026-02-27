"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, Download, QrCode, Activity } from "lucide-react"
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
                    className="h-10 rounded-none border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase tracking-[0.4em] px-4 gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-current opacity-20 group-hover:opacity-100 transition-opacity" />
                    {copied ? (
                        <>
                            <Copy className="w-3 h-3 text-zinc-400 group-hover:text-white" />
                            {t('editors.share.copied')}
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3" />
                            {t('editors.share.link')}
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQR(!showQR)}
                    className="h-10 rounded-none border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase tracking-[0.4em] px-4 gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-current opacity-20 group-hover:opacity-100 transition-opacity" />
                    <QrCode className="w-3 h-3" />
                    {t('editors.share.qr_code')}
                </Button>
            </div>

            {
                showQR && (
                    <div className="absolute top-full right-0 mt-4 p-8 bg-white dark:bg-zinc-950 rounded-none border border-zinc-200 dark:border-zinc-800 z-50 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden group/qr">
                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-black dark:border-white" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-black dark:border-white opacity-0 group-hover/qr:opacity-100 transition-opacity" />

                        <div className="space-y-6">
                            <header className="flex items-center gap-2 opacity-30 mb-2">
                                <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
                                <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('editors.share.qr_code')}</h3>
                            </header>

                            <div className="bg-white p-6 border border-zinc-100 shadow-inner group-hover/qr:scale-[1.02] transition-transform duration-700">
                                <QRCodeSVG
                                    id="qr-code-svg"
                                    value={profileUrl}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 relative">
                                    <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white opacity-20" />
                                    <p className="text-[7px] text-zinc-400 text-center font-mono break-all uppercase tracking-[0.2em] leading-relaxed">
                                        {profileUrl}
                                    </p>
                                </div>

                                <Button
                                    onClick={handleDownloadQR}
                                    size="sm"
                                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white border border-zinc-100 dark:border-zinc-800 rounded-none text-[9px] font-black uppercase tracking-[0.3em] transition-all relative group/btn overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white" />
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
