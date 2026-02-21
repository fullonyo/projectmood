import { MoodStatusBlockContent } from "@/lib/validations"
import { useViewportScale } from "@/lib/canvas-scale"
import { Smile, Meh, Frown, Sparkles, Flame, Coffee, PartyPopper, Moon, Heart, Ghost } from "lucide-react"

const ICON_MAP = {
    Smile, Meh, Frown, Sparkles, Flame, Coffee, PartyPopper, Moon, Heart, Ghost
}

interface MoodStatusBlockPublicProps {
    content: MoodStatusBlockContent
}

export function MoodStatusBlockPublic({ content }: MoodStatusBlockPublicProps) {
    const { emoji: iconName, text } = content
    const Icon = ICON_MAP[iconName as keyof typeof ICON_MAP] || Smile
    const scale = useViewportScale()

    return (
        <div className="w-full h-full flex items-center justify-center" style={{ padding: Math.round(16 * scale) }}>
            <div className="bg-white/10 dark:bg-zinc-900/10 backdrop-blur-xl shadow-2xl border border-white/10 flex items-center transition-all hover:scale-105 group" style={{ padding: `${Math.round(16 * scale)}px ${Math.round(24 * scale)}px`, gap: Math.round(16 * scale), borderRadius: Math.round(16 * scale) }}>
                <div className="text-zinc-900 dark:text-white animate-bounce group-hover:animate-none group-hover:scale-125 transition-transform">
                    <Icon strokeWidth={2.5} style={{ width: Math.round(32 * scale), height: Math.round(32 * scale) }} />
                </div>
                <div className="bg-zinc-400/20" style={{ height: Math.round(32 * scale), width: Math.max(1, Math.round(1 * scale)) }} />
                <p className="font-black tracking-tight text-current uppercase italic" style={{ fontSize: Math.round(16 * scale) }}>
                    {text}
                </p>
            </div>
        </div>
    )
}
