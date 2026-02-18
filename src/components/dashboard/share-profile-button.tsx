"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, Download, QrCode } from "lucide-react"

interface ShareProfileButtonProps {
    username: string
}

export function ShareProfileButton({ username }: ShareProfileButtonProps) {
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
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="gap-2 text-xs"
                >
                    {copied ? (
                        <>
                            <Copy className="w-3.5 h-3.5 text-green-500" />
                            Copiado!
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar Link
                        </>
                    )}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQR(!showQR)}
                    className="gap-2 text-xs"
                >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Code
                </Button>
            </div>

            {showQR && (
                <div className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50">
                    <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg">
                            <QRCodeSVG
                                id="qr-code-svg"
                                value={profileUrl}
                                size={180}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-zinc-500 text-center font-mono break-all px-2">
                                {profileUrl}
                            </p>

                            <Button
                                onClick={handleDownloadQR}
                                size="sm"
                                className="w-full gap-2"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Baixar QR Code
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
