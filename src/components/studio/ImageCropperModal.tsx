"use client"

import { useState, useCallback, useEffect } from "react"
import Cropper from "react-easy-crop"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { X, Crop, ZoomIn, ZoomOut } from "lucide-react"

interface ImageCropperModalProps {
    file: File
    onCropComplete: (croppedBlob: Blob) => void
    onCancel: () => void
}

export function ImageCropperModal({ file, onCropComplete, onCancel }: ImageCropperModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

    const [imageUrl, setImageUrl] = useState<string>("")
    
    useEffect(() => {
        if (!file) return
        const url = URL.createObjectURL(file)
        setImageUrl(url)
        console.log("[ImageCropperModal] Created URL:", url)
        return () => {
            console.log("[ImageCropperModal] Revoking URL:", url)
            URL.revokeObjectURL(url)
        }
    }, [file])

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createCroppedImage = async () => {
        try {
            const canvas = document.createElement("canvas")
            const image = new Image()
            image.src = imageUrl

            await new Promise((resolve) => {
                image.onload = resolve
            })

            canvas.width = croppedAreaPixels.width
            canvas.height = croppedAreaPixels.height

            const ctx = canvas.getContext("2d")
            if (!ctx) return

            // Alta qualidade de interpolação
            ctx.imageSmoothingQuality = "high"
            ctx.imageSmoothingEnabled = true

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            )

            canvas.toBlob((blob) => {
                if (blob) {
                    onCropComplete(blob)
                }
            }, file.type, 1)
        } catch (e) {
            console.error("Error cropping image", e)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Crop className="w-5 h-5 text-blue-500" />
                        <div>
                            <h3 className="text-sm font-bold tracking-tight">Recortar Imagem</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Ajuste o enquadramento</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="relative w-full h-[50vh] min-h-[400px] bg-zinc-900 overflow-hidden">
                    {imageUrl ? (
                        <Cropper
                            image={imageUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropCompleteHandler}
                            onZoomChange={setZoom}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomOut className="w-4 h-4 text-zinc-400" />
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(val) => setZoom(val[0])}
                            className="flex-1"
                        />
                        <ZoomIn className="w-4 h-4 text-zinc-400" />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={createCroppedImage}
                            className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Confirmar Recorte
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
