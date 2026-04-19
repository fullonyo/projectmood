"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import imageCompression from 'browser-image-compression'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Image as ImageIcon, Upload, X, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { toast } from "sonner"

import { MoodBlock, PhotoContent } from "@/types/database"

interface PhotoEditorProps {
    block?: MoodBlock | null
    onUpdate?: (id: string, updates: Partial<MoodBlock>) => void
    onAdd?: (content: PhotoContent) => Promise<void>
    onClose?: () => void
}

import { EditorHeader, EditorSection, GridSelector, EditorActionButton, PillSelector } from "./EditorUI"

export function UniversalPhotoEditor({ block, onUpdate, onAdd, onClose }: PhotoEditorProps) {
    const { t } = useTranslation()
    const defaultContent = block?.content || {}
    const [imageUrl, setImageUrl] = useState<string>(defaultContent.imageUrl || "")
    const [alt, setAlt] = useState(defaultContent.alt || "")
    const [caption, setCaption] = useState(defaultContent.caption || "")
    const [filter, setFilter] = useState<'none' | 'vintage' | 'bw' | 'warm' | 'cool'>(defaultContent.filter || 'none')
    const [frame, setFrame] = useState<'none' | 'polaroid' | 'polaroid-dark' | 'frame' | 'minimal' | 'round' | 'border' | 'shadow' | 'glass'>(defaultContent.frame || 'none')
    const [isUploading, setIsUploading] = useState(false)
    const [isPending, setIsPending] = useState(false)

    // 2. Real-time Preview
    useEffect(() => {
        if (!block?.id || !onUpdate) return

        const content = {
            imageUrl,
            alt: alt || undefined,
            filter,
            frame,
            caption: caption || undefined
        }

        onUpdate(block.id, { content })
    }, [imageUrl, alt, caption, filter, frame, block?.id, onUpdate])

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setIsUploading(true)

        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1200,
                useWebWorker: true
            }

            const compressedFile = await imageCompression(file, options)

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

    const handleAdd = async () => {
        if (!imageUrl && !block?.id) return

        setIsPending(true)
        const content = {
            imageUrl,
            alt: alt || undefined,
            filter,
            frame,
            caption: caption || undefined
        }

        if (block?.id) {
            if (onClose) onClose()
        } else if (onAdd) {
            await onAdd(content)
            setImageUrl("")
            setAlt("")
            setCaption("")
            setFilter('none')
            setFrame('none')
        }
        setIsPending(false)
    }

    const handleRemoveImage = () => {
        setImageUrl("")
    }

    const getFilterClass = () => {
        switch (filter) {
            case 'vintage': return 'sepia(50%) contrast(110%)'
            case 'bw': return 'grayscale(100%)'
            case 'warm': return 'saturate(130%) hue-rotate(-10deg)'
            case 'cool': return 'saturate(110%) hue-rotate(10deg)'
            default: return 'none'
        }
    }

    return (
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={t('editors.photo.title')}
                subtitle={t('editors.photo.subtitle')}
            />

            <EditorSection title="Imagem">
                {!imageUrl ? (
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed p-12 text-center transition-all cursor-pointer rounded-3xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/50 group",
                            isDragActive && "border-blue-500 bg-blue-50/50"
                        )}
                    >
                        <input {...getInputProps()} />
                        <Upload className={cn("w-10 h-10 mx-auto mb-4 text-zinc-400 transition-transform group-hover:scale-110", isDragActive && "text-blue-500")} />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                            {isDragActive ? t('editors.photo.drop_link') : t('editors.photo.inject_visual')}
                        </p>
                        <p className="text-[9px] text-zinc-400 font-medium mt-2">JPEG, PNG, WEBP (MAX. 10MB)</p>
                        {isUploading && (
                            <div className="mt-6 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="relative rounded-3xl overflow-hidden shadow-lg group">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full h-64 object-cover transition-all duration-700"
                                style={{ filter: getFilterClass() }}
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-black/90 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all scale-0 group-hover:scale-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 px-1">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('editors.photo.caption')}</Label>
                                <Input
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder={t('editors.photo.caption_placeholder')}
                                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl text-base h-11 focus-visible:ring-blue-500/20"
                                />
                            </div>
                            <div className="space-y-2 px-1">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('editors.photo.alt_text')}</Label>
                                <Input
                                    value={alt}
                                    onChange={(e) => setAlt(e.target.value)}
                                    placeholder={t('editors.photo.alt_placeholder')}
                                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl text-base h-11 focus-visible:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        <EditorSection title="Filtro Profissional">
                            <PillSelector
                                variant="scroll"
                                options={[
                                    { id: 'none', label: 'RAW' },
                                    { id: 'vintage', label: 'Vintage' },
                                    { id: 'bw', label: 'B&W' },
                                    { id: 'warm', label: 'Warm' },
                                    { id: 'cool', label: 'Cool' },
                                ]}
                                activeId={filter}
                                onChange={(id) => setFilter(id as any)}
                            />
                        </EditorSection>

                        <EditorSection title="Geometria / Moldura">
                            <PillSelector
                                variant="scroll"
                                options={[
                                    { id: 'none', label: 'None' },
                                    { id: 'polaroid', label: 'Polaroid' },
                                    { id: 'minimal', label: 'Minimal' },
                                    { id: 'glass', label: 'Glass' },
                                    { id: 'round', label: 'Round' },
                                    { id: 'shadow', label: 'Shadow' },
                                    { id: 'border', label: 'Border' },
                                    { id: 'frame', label: 'Classic' },
                                ]}
                                activeId={frame}
                                onChange={(id) => setFrame(id as any)}
                            />
                        </EditorSection>

                        <EditorActionButton 
                            onClick={handleAdd} 
                            isLoading={isPending} 
                            disabled={isUploading || (!imageUrl && !block?.id)}
                            label={block?.id ? t('common.close') : t('editors.photo.deploy')}
                        />
                    </div>
                )}
            </EditorSection>
        </div>
    )
}
