import { cn } from "@/lib/utils"

interface StaticTexturesProps {
    type: string
}

export function StaticTextures({ type }: StaticTexturesProps) {
    if (type === 'none') return null

    const textures: Record<string, string> = {
        'museum-paper': 'bg-[url("https://www.transparenttextures.com/patterns/cream-paper.png")] opacity-20',
        'raw-canvas': 'bg-[url("https://www.transparenttextures.com/patterns/canvas-orange.png")] opacity-10 grayscale',
        'fine-sand': 'bg-[url("https://www.transparenttextures.com/patterns/pollen.png")] opacity-15'
    }

    const textureClass = textures[type] || ''

    return (
        <div
            className={cn(
                "w-full h-full pointer-events-none mix-blend-soft-light opacity-[0.8]",
                textureClass
            )}
        />
    )
}
