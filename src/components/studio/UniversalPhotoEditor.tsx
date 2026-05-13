"use client"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import imageCompression from 'browser-image-compression'
import { Upload, X, Search, Globe, Box, Circle, Heart, Star, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"
import { toast } from "sonner"
import { MoodBlock, PhotoContent } from "@/types/database"
import { EditorHeader, EditorSection, EditorActionButton, ListSelector, EditorSwitch } from "./EditorUI"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getUploadUrl } from "@/actions/upload"
import { ImageCropperModal } from "./ImageCropperModal"
import { searchUnsplash } from "@/actions/unsplash"
import { SmartPhoto } from "./SmartPhoto"

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
    const [filter, setFilter] = useState<any>(defaultContent.filter || 'none')
    const [frame, setFrame] = useState<any>(defaultContent.frame || 'none')
    const [mask, setMask] = useState<any>(defaultContent.mask || 'none')
    const [ambientTint, setAmbientTint] = useState<boolean>(!!(defaultContent as any).ambientTint)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [activeTab, setActiveTab] = useState<"upload" | "explore">("upload")
    const [unsplashQuery, setUnsplashQuery] = useState("")
    const [unsplashResults, setUnsplashResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [rawFileToCrop, setRawFileToCrop] = useState<File | null>(null)

    const handleSearchUnsplash = async () => {
        if (!unsplashQuery.trim()) return
        setIsSearching(true)
        const res = await searchUnsplash(unsplashQuery)
        if (res.success) {
            setUnsplashResults(res.photos || [])
            if ((res as any).isMock) {
                toast.info("Usando modo de demonstração (API Key Unsplash não configurada).", { duration: 5000 })
            }
        }
        setIsSearching(false)
    }

    const triggerUpdate = (updates: Partial<PhotoContent>) => {
        if (!onUpdate) return
        onUpdate({
            content: {
                imageUrl,
                alt,
                caption,
                filter,
                frame,
                mask,
                ambientTint,
                ...updates
            } as PhotoContent
        })
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return
        setRawFileToCrop(file)
    }, [])

    const handleCropComplete = async (croppedBlob: Blob) => {
        setRawFileToCrop(null)
        setIsProcessing(true)

        try {
            const fileName = rawFileToCrop?.name || 'cropped-image.jpg'
            const croppedFile = new File([croppedBlob], fileName, { type: croppedBlob.type })
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true }
            const compressedFile = await imageCompression(croppedFile, options)

            const res = await getUploadUrl(compressedFile.type, "photos")
            if (res.error || !res.uploadUrl || !res.publicUrl) throw new Error(res.error || "Erro ao obter URL de upload")

            const uploadResponse = await fetch(res.uploadUrl, { method: "PUT", body: compressedFile, headers: { "Content-Type": compressedFile.type } })
            if (!uploadResponse.ok) throw new Error("Falha no upload")

            setImageUrl(res.publicUrl)
            triggerUpdate({ imageUrl: res.publicUrl })
        } catch (error) {
            toast.error("Erro ao processar imagem")
        } finally {
            setIsProcessing(false)
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        maxFiles: 1
    })

    const handleAction = async () => {
        if (!imageUrl && !block?.id) return
        setIsPending(true)
        const content: PhotoContent = { imageUrl, alt, filter, frame, mask, caption, ambientTint }
        if (block?.id) { if (onClose) onClose() } else if (onAdd) { await onAdd(content); if (onClose) onClose() }
        setIsPending(false)
    }

    const handleRemoveImage = () => {
        setImageUrl("")
        triggerUpdate({ imageUrl: "" })
    }

    const masks = [
        { id: 'none', icon: Box, label: 'Original' },
        { id: 'circle', icon: Circle, label: 'Círculo' },
        { id: 'heart', icon: Heart, label: 'Coração' },
        { id: 'star', icon: Star, label: 'Estrela' },
        { id: 'blob1', icon: Wand2, label: 'Blob 1' },
        { id: 'blob2', icon: Wand2, label: 'Blob 2' },
        { id: 'blob3', icon: Wand2, label: 'Blob 3' },
    ]

    return (
        <div className="space-y-12 pb-20">
            {rawFileToCrop && <ImageCropperModal file={rawFileToCrop} onCropComplete={handleCropComplete} onCancel={() => setRawFileToCrop(null)} />}
            
            <EditorHeader title={t('editors.photo.title')} subtitle={t('editors.photo.subtitle')} onClose={onClose} />

            <EditorSection title="Conteúdo Visual">
                <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-1 mb-4">
                    <button 
                        onClick={() => setActiveTab("upload")}
                        className={cn("flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", activeTab === "upload" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-400")}
                    >
                        <Upload className="w-3 h-3" /> Upload
                    </button>
                    <button 
                        onClick={() => setActiveTab("explore")}
                        className={cn("flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", activeTab === "explore" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-400")}
                    >
                        <Globe className="w-3 h-3" /> Explorar
                    </button>
                </div>

                {activeTab === "upload" ? (
                    <div
                        {...getRootProps()}
                        className={cn(
                            "relative aspect-video rounded-3xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden group",
                            isDragActive ? "border-blue-500 bg-blue-50/5" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600",
                            (imageUrl || isProcessing) && "border-none"
                        )}
                    >
                        <input {...getInputProps()} />
                        
                        {isProcessing ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Processando...</span>
                            </div>
                        ) : imageUrl ? (
                            <div className="relative w-full h-full">
                                <SmartPhoto content={{ imageUrl, filter, frame, mask, ambientTint, caption, alt }} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 shadow-2xl hover:scale-110 transition-transform">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-zinc-300 group-hover:scale-110 transition-transform" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Arraste para injetar visual</p>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar fotos no Unsplash..."
                                    value={unsplashQuery}
                                    onChange={(e) => setUnsplashQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUnsplash()}
                                    className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl pl-10 pr-4 py-4 text-xs border-none focus:ring-1 focus:ring-blue-500/20"
                                />
                            </div>
                            <Button onClick={handleSearchUnsplash} disabled={isSearching} className="rounded-2xl h-12 px-6">
                                {isSearching ? "..." : "Ir"}
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {unsplashResults.map((photo) => (
                                <button
                                    key={photo.id}
                                    onClick={() => { setImageUrl(photo.url); triggerUpdate({ imageUrl: photo.url }); setActiveTab("upload"); }}
                                    className="relative aspect-square rounded-xl overflow-hidden group hover:ring-2 hover:ring-blue-500 transition-all"
                                >
                                    <img src={photo.url} alt={photo.alt} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </EditorSection>

            <EditorSection title="Legenda Criativa">
                <Input
                    value={caption}
                    onChange={(e) => {
                        setCaption(e.target.value)
                        triggerUpdate({ caption: e.target.value })
                    }}
                    placeholder="Escreva algo..."
                    className="h-14 bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-2xl px-6 text-[12px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-blue-500/20"
                />
            </EditorSection>

            <EditorSection title="Filtro Profissional">
                <ListSelector
                    id="photo-filter"
                    options={[
                        { id: 'none', label: 'RAW (Original)' },
                        { id: 'vintage', label: 'Vintage' },
                        { id: 'bw', label: 'B&W' },
                        { id: 'fade', label: 'Faded' },
                        { id: 'cinematic', label: 'Cinematic' },
                        { id: 'warm', label: 'Warm' },
                        { id: 'cool', label: 'Cool' },
                    ]}
                    activeId={filter}
                    onChange={(id) => {
                        setFilter(id)
                        triggerUpdate({ filter: id as any })
                    }}
                />
            </EditorSection>

            <EditorSection title="Máscaras Criativas" description="Corte sua foto em formatos artísticos.">
                <div className="grid grid-cols-4 gap-2">
                    {masks.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => { setMask(m.id); triggerUpdate({ mask: m.id as any }); }}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 gap-2",
                                (mask || 'none') === m.id
                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-105"
                                    : "bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            )}
                        >
                            <m.icon className="w-4 h-4" />
                            <span className="text-[8px] font-bold uppercase tracking-tighter">{m.label}</span>
                        </button>
                    ))}
                </div>
            </EditorSection>

            <EditorSection title="Geometria / Moldura">
                <ListSelector
                    id="photo-frame"
                    options={[
                        { id: 'none', label: 'Original' },
                        { id: 'melt', label: 'Edge Melt' },
                        { id: 'polaroid', label: 'Polaroid' },
                        { id: 'polaroid-dark', label: 'Polaroid Dark' },
                        { id: 'minimal', label: 'Minimal' },
                        { id: 'round', label: 'Round' },
                        { id: 'capsule', label: 'Capsule' },
                        { id: 'shadow', label: 'Shadow' },
                    ]}
                    activeId={frame}
                    onChange={(id) => {
                        setFrame(id)
                        triggerUpdate({ frame: id as any })
                    }}
                />
            </EditorSection>

            <EditorSection title="Integração ao Ambiente">
                <EditorSwitch
                    label="Sincronia Ambiental"
                    value={ambientTint}
                    onChange={(val) => {
                        setAmbientTint(val)
                        triggerUpdate({ ambientTint: val } as any)
                    }}
                />
            </EditorSection>

            <EditorActionButton 
                onClick={handleAction} 
                isLoading={isPending} 
                disabled={isProcessing || (!imageUrl && !block?.id)}
                label={block?.id ? t('common.close') : t('editors.photo.deploy')}
            />
        </div>
    )
}
