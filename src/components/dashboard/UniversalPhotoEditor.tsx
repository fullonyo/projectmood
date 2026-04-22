"use client"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import imageCompression from 'browser-image-compression'
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { toast } from "sonner"
import { MoodBlock, PhotoContent } from "@/types/database"
import { EditorHeader, EditorSection, GridSelector, EditorActionButton, PillSelector, ListSelector } from "./EditorUI"
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
                    <div className="space-y-10">
                        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl group bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                                style={{ filter: getFilterStyle(filter) }}
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={handleRemoveImage}
                                    className="w-12 h-12 bg-white/90 dark:bg-black/90 rounded-full flex items-center justify-center shadow-xl hover:bg-red-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <EditorSection title={t('editors.photo.caption')}>
                                <Input
                                    value={caption}
                                    onChange={(e) => {
                                        setCaption(e.target.value)
                                        triggerUpdate({ caption: e.target.value })
                                    }}
                                    placeholder={t('editors.photo.caption_placeholder')}
                                    className="h-14 bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-2xl px-6 text-[12px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-blue-500/20 placeholder:text-zinc-400"
                                />
                            </EditorSection>
                        </div>

                        <EditorSection title="Filtro Profissional">
                            <ListSelector
                                id="photo-filter"
                                options={[
                                    { id: 'none', label: 'RAW (Sem Filtro)' },
                                    { id: 'vintage', label: 'Vintage (Nostálgico)' },
                                    { id: 'bw', label: 'B&W (Preto e Branco)' },
                                    { id: 'warm', label: 'Warm (Aquecido)' },
                                    { id: 'cool', label: 'Cool (Frio)' },
                                ]}
                                activeId={filter}
                                onChange={(id) => {
                                    setFilter(id as any)
                                    triggerUpdate({ filter: id as any })
                                }}
                            />
                        </EditorSection>

                        <EditorSection title="Geometria / Moldura">
                            <ListSelector
                                id="photo-frame"
                                options={[
                                    { id: 'none', label: 'Original' },
                                    { id: 'polaroid', label: 'Polaroid' },
                                    { id: 'minimal', label: 'Minimalist' },
                                    { id: 'glass', label: 'Glassmorphism' },
                                    { id: 'round', label: 'Rounded Circles' },
                                    { id: 'shadow', label: 'Deep Shadow' },
                                    { id: 'border', label: 'Clean Border' },
                                    { id: 'frame', label: 'Classic Gallery' },
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
