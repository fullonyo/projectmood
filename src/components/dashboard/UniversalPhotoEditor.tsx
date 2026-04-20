"use client"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import imageCompression from 'browser-image-compression'
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { toast } from "sonner"
import { MoodBlock, PhotoContent } from "@/types/database"
import { EditorHeader, EditorSection, GridSelector, EditorActionButton, PillSelector } from "./EditorUI"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PhotoEditorProps {
    block?: MoodBlock | null
    onUpdate?: (updates: Partial<MoodBlock>) => void
    onAdd?: (content: PhotoContent) => Promise<void>
    onClose?: () => void
}

export function UniversalPhotoEditor({ block, onUpdate, onAdd, onClose }: PhotoEditorProps) {
    const { t } = useTranslation()
    const defaultContent = (block?.content as PhotoContent) || {}
    
    const [imageUrl, setImageUrl] = useState<string>(defaultContent.imageUrl || "")
    const [alt, setAlt] = useState(defaultContent.alt || "")
    const [caption, setCaption] = useState(defaultContent.caption || "")
    const [filter, setFilter] = useState<'none' | 'vintage' | 'bw' | 'warm' | 'cool'>(defaultContent.filter || 'none')
    const [frame, setFrame] = useState<'none' | 'polaroid' | 'polaroid-dark' | 'frame' | 'minimal' | 'round' | 'border' | 'shadow' | 'glass'>(defaultContent.frame || 'none')
    const [isUploading, setIsUploading] = useState(false)
    const [isPending, setIsPending] = useState(false)

    // Manual update to avoid useEffect loops
    const triggerUpdate = (updates: Partial<PhotoContent>) => {
        if (!onUpdate) return
        onUpdate({
            content: {
                imageUrl,
                alt,
                caption,
                filter,
                frame,
                ...updates
            }
        })
    }

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
                const result = reader.result as string
                setImageUrl(result)
                triggerUpdate({ imageUrl: result })
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
        onDrop: (files) => onDrop(files),
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
        },
        maxFiles: 1
    })

    const handleAction = async () => {
        if (!imageUrl && !block?.id) return

        setIsPending(true)
        const content: PhotoContent = {
            imageUrl,
            alt,
            filter,
            frame,
            caption
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
        triggerUpdate({ imageUrl: "" })
    }

    const getFilterStyle = (f: string) => {
        switch (f) {
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
                onClose={onClose}
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
                        {isUploading && <p className="mt-4 animate-pulse text-[10px] text-blue-500 font-black">Processando...</p>}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="relative rounded-3xl overflow-hidden shadow-lg group bg-zinc-100 dark:bg-zinc-900">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full h-64 object-cover"
                                style={{ filter: getFilterStyle(filter) }}
                            />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-black/90 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 px-1">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('editors.photo.caption')}</Label>
                                <Input
                                    value={caption}
                                    onChange={(e) => {
                                        setCaption(e.target.value)
                                        triggerUpdate({ caption: e.target.value })
                                    }}
                                    placeholder={t('editors.photo.caption_placeholder')}
                                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2 px-1">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('editors.photo.alt_text')}</Label>
                                <Input
                                    value={alt}
                                    onChange={(e) => {
                                        setAlt(e.target.value)
                                        triggerUpdate({ alt: e.target.value })
                                    }}
                                    placeholder={t('editors.photo.alt_placeholder')}
                                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl"
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
                                onChange={(id) => {
                                    setFilter(id as any)
                                    triggerUpdate({ filter: id as any })
                                }}
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
                                onChange={(id) => {
                                    setFrame(id as any)
                                    triggerUpdate({ frame: id as any })
                                }}
                            />
                        </EditorSection>

                        <EditorActionButton 
                            onClick={handleAction} 
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
