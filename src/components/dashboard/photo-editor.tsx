"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Image as ImageIcon, Upload, X } from "lucide-react"

interface PhotoEditorProps {
    onAdd: (content: any) => void
}

export function PhotoEditor({ onAdd }: PhotoEditorProps) {
    const [imageUrl, setImageUrl] = useState<string>("")
    const [alt, setAlt] = useState("")
    const [caption, setCaption] = useState("")
    const [filter, setFilter] = useState<'none' | 'vintage' | 'bw' | 'warm' | 'cool'>('none')
    const [frame, setFrame] = useState<'none' | 'polaroid' | 'border' | 'shadow'>('none')
    const [isUploading, setIsUploading] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Arquivo muito grande! Máximo 5MB.")
            return
        }

        setIsUploading(true)

        // Convert to base64
        const reader = new FileReader()
        reader.onload = () => {
            setImageUrl(reader.result as string)
            setIsUploading(false)
        }
        reader.onerror = () => {
            alert("Erro ao carregar imagem")
            setIsUploading(false)
        }
        reader.readAsDataURL(file)
    }, [])

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
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <ImageIcon className="w-4 h-4 text-zinc-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Foto</h3>
            </div>

            <div className="space-y-4">
                {!imageUrl ? (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${isDragActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-10 h-10 mx-auto mb-3 text-zinc-400" />
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {isDragActive ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP, GIF (máx. 5MB)</p>
                        {isUploading && <p className="text-xs text-blue-500 mt-2">Carregando...</p>}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full h-48 object-cover"
                                style={{ filter: getFilterClass() }}
                            />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Legenda (opcional)</Label>
                            <Input
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Adicione uma legenda..."
                                maxLength={100}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Texto Alternativo</Label>
                            <Input
                                value={alt}
                                onChange={(e) => setAlt(e.target.value)}
                                placeholder="Descrição da imagem"
                                maxLength={200}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Filtro</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['none', 'vintage', 'bw', 'warm', 'cool'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${filter === f
                                            ? 'bg-black text-white dark:bg-white dark:text-black'
                                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                                            }`}
                                    >
                                        {f === 'none' ? 'Original' : f === 'bw' ? 'P&B' : f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Moldura</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['none', 'polaroid', 'border', 'shadow'] as const).map((frm) => (
                                    <button
                                        key={frm}
                                        onClick={() => setFrame(frm)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${frame === frm
                                            ? 'bg-black text-white dark:bg-white dark:text-black'
                                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                                            }`}
                                    >
                                        {frm === 'none' ? 'Nenhuma' : frm}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleAdd}
                            className="w-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
                        >
                            Adicionar Foto
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
