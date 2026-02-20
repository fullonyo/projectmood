"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import imageCompression from 'browser-image-compression'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Image as ImageIcon, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { toast } from "sonner"

interface PhotoEditorProps {
    onAdd: (content: any) => void
}

export function PhotoEditor({ onAdd }: PhotoEditorProps) {
    const { t } = useTranslation()
    const [imageUrl, setImageUrl] = useState<string>("")
    const [alt, setAlt] = useState("")
    const [caption, setCaption] = useState("")
    const [filter, setFilter] = useState<'none' | 'vintage' | 'bw' | 'warm' | 'cool'>('none')
    const [frame, setFrame] = useState<'none' | 'polaroid' | 'border' | 'shadow'>('none')
    const [isUploading, setIsUploading] = useState(false)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setIsUploading(true)

        try {
            // Opções de compressão
            const options = {
                maxSizeMB: 1, // (max 1MB)
                maxWidthOrHeight: 1200,
                useWebWorker: true
            }

            const compressedFile = await imageCompression(file, options)

            // Convert to base64
            const reader = new FileReader()
            reader.onload = () => {
                setImageUrl(reader.result as string)
                setIsUploading(false)
            }
            reader.onerror = () => {
                toast.error(t('editors.photo.error_load'))
                setIsUploading(false)
            }
            reader.readAsDataURL(compressedFile)
        } catch (error) {
            console.error("Erro na compressão:", error)
            toast.error(t('editors.photo.error_process'))
            setIsUploading(false)
        }
    }, [t])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
        },
        maxFiles: 1
    })

    const handleAdd = () => {
        if (!imageUrl) return

        onAdd({
            imageUrl,
            alt: alt || undefined,
            filter,
            frame,
            caption: caption || undefined
        })

        // Reset form
        setImageUrl("")
        setAlt("")
        setCaption("")
        setFilter('none')
        setFrame('none')
    }

    const handleRemoveImage = () => {
        setImageUrl("")
    }

    const getFilterClass = () => {
        switch (filter) {
            case 'vintage':
                return 'sepia(50%) contrast(110%)'
            case 'bw':
                return 'grayscale(100%)'
            case 'warm':
                return 'saturate(130%) hue-rotate(-10deg)'
            case 'cool':
                return 'saturate(110%) hue-rotate(10deg)'
            default:
                return 'none'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <ImageIcon className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.photo.title')}</h3>
            </div>

            <div className="space-y-4">
                {!imageUrl ? (
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border border-dashed p-10 text-center transition-all cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/20",
                            isDragActive
                                ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-800/50'
                                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                        )}
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-8 h-8 mx-auto mb-4 text-zinc-400 opacity-40" />
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">
                            {isDragActive ? t('editors.photo.drop_link') : t('editors.photo.inject_visual')}
                        </p>
                        <p className="text-[7px] text-zinc-400 font-mono mt-2">{t('editors.photo.format_hint')}</p>
                        {isUploading && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <div className="w-1 h-3 bg-black dark:bg-white animate-pulse" />
                                <p className="text-[7px] text-black dark:text-white font-black uppercase tracking-widest">{t('editors.photo.processing')}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="relative border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900 group/preview">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full h-56 object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                style={{ filter: getFilterClass() }}
                            />
                            {/* Technical scanline overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

                            <button
                                onClick={handleRemoveImage}
                                className="absolute top-4 right-4 w-8 h-8 bg-black/80 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center transition-all"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>

                            <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10">
                                <span className="text-[7px] font-black uppercase tracking-widest text-white/70">{t('editors.photo.live_preview')}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-3">
                                <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.photo.caption')}</Label>
                                <Input
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder={t('editors.photo.caption_placeholder')}
                                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none text-[10px] uppercase font-mono h-11 focus-visible:ring-0"
                                    maxLength={100}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.photo.alt_text')}</Label>
                                <Input
                                    value={alt}
                                    onChange={(e) => setAlt(e.target.value)}
                                    placeholder={t('editors.photo.alt_placeholder')}
                                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none text-[10px] uppercase font-mono h-11 focus-visible:ring-0"
                                    maxLength={200}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.photo.filter')}</Label>
                            <div className="grid grid-cols-5 border border-zinc-200 dark:border-zinc-800">
                                {(['none', 'vintage', 'bw', 'warm', 'cool'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-3 border-r last:border-r-0 border-zinc-100 dark:border-zinc-900 transition-all",
                                            filter === f
                                                ? "bg-black text-white dark:bg-white dark:text-black"
                                                : "bg-white dark:bg-zinc-950 opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <div
                                            className="w-full aspect-square border border-current opacity-20"
                                            style={{
                                                backgroundImage: `url(${imageUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                filter: f === 'vintage' ? 'sepia(50%) contrast(110%)' : f === 'bw' ? 'grayscale(100%)' : f === 'warm' ? 'saturate(130%) hue-rotate(-10deg)' : f === 'cool' ? 'saturate(110%) hue-rotate(10deg)' : 'none'
                                            }}
                                        />
                                        <span className="text-[7px] font-black uppercase tracking-tighter">
                                            {f === 'none' ? 'RAW' : f.toUpperCase()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.photo.geometry')}</Label>
                            <div className="grid grid-cols-4 border border-zinc-200 dark:border-zinc-800">
                                {(['none', 'polaroid', 'border', 'shadow'] as const).map((frm) => (
                                    <button
                                        key={frm}
                                        onClick={() => setFrame(frm)}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-3 border-r last:border-r-0 border-zinc-100 dark:border-zinc-900 transition-all",
                                            frame === frm
                                                ? "bg-black text-white dark:bg-white dark:text-black"
                                                : "bg-white dark:bg-zinc-950 opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 border flex items-center justify-center border-current opacity-30",
                                            frm === 'polaroid' && "border-b-4",
                                            frm === 'border' && "border-2",
                                        )}>
                                            <div className="w-full h-full bg-current opacity-10" />
                                        </div>
                                        <span className="text-[7px] font-black uppercase tracking-tighter">
                                            {frm.toUpperCase()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleAdd}
                            className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-14 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all border border-black dark:border-white"
                        >
                            {t('editors.photo.deploy')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
