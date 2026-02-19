import { MoodStatusBlockContent } from "@/lib/validations"
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

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="bg-white/10 dark:bg-zinc-900/10 backdrop-blur-xl rounded-2xl p-4 px-6 shadow-2xl border border-white/10 flex items-center gap-4 transition-all hover:scale-105 group">
                <div className="text-zinc-900 dark:text-white animate-bounce group-hover:animate-none group-hover:scale-125 transition-transform">
                    <Icon className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <div className="h-8 w-[1px] bg-zinc-400/20" />
                <p className="text-base font-black tracking-tight text-current uppercase italic">
                    {text}
                </p>
            </div>
        </div>
    )
}
