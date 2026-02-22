"use client"

import { useTranslation } from "@/i18n/context"
import { cn } from "@/lib/utils"
import {
    Type,
    Image as ImageIcon,
    Youtube,
    Music,
    Pencil,
    MessageSquare,
    Sparkles,
    Clock,
    Quote,
    Cloud,
    Share2,
    Book,
    Play
} from "lucide-react"

interface BlockLibraryProps {
    onAddBlock: (type: string) => void
    systemFlags?: Record<string, boolean>
}

export function BlockLibrary({ onAddBlock, systemFlags = {} }: BlockLibraryProps) {
    const { t } = useTranslation()

    const categories = [
        {
            items: [
                { id: 'typography', type: 'text', icon: Type, tk: 'typography' },
                { id: 'photo', type: 'photo', icon: ImageIcon, tk: 'photo' },
            ]
        },
        {
            items: [
                { id: 'youtube', type: 'video', icon: Youtube, tk: 'youtube' },
                { id: 'spotify', type: 'music', icon: Music, tk: 'spotify' },
                { id: 'gif', type: 'gif', icon: Play, tk: 'gif' },
                { id: 'weather', type: 'weather', icon: Cloud, tk: 'weather' },
            ]
        },
        {
            items: [
                { id: 'doodle', type: 'doodle', icon: Pencil, tk: 'doodle' },
                { id: 'guestbook', type: 'guestbook', icon: MessageSquare, tk: 'guestbook' },
                { id: 'countdown', type: 'countdown', icon: Clock, tk: 'countdown' },
                { id: 'social', type: 'social', icon: Share2, tk: 'social' },
                { id: 'media', type: 'media', icon: Book, tk: 'media' },
            ]
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
            <header>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 bg-black dark:bg-white" />
                    <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">{t('sidebar.library.title')}</h3>
                </div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest">{t('sidebar.library.subtitle')}</p>
            </header>

            <div className="space-y-6">
                {categories.map((group, groupIdx) => {
                    // Filter items based on systemFlags. Default is true if flag is missing.
                    const visibleItems = group.items.filter(item => {
                        const flagKey = `block_${item.id}`;
                        if (systemFlags[flagKey] === false) return false;
                        return true;
                    });

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={groupIdx} className="grid grid-cols-2 gap-3">
                            {visibleItems.map((item) => {
                                const Icon = item.icon
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onAddBlock(item.type)}
                                        className="flex flex-col items-start p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all group text-left shadow-none"
                                    >
                                        <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50 mb-3 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-wider mb-1">
                                            {t(`sidebar.library.items.${item.tk}.title`)}
                                        </h4>
                                        <p className="text-[8px] text-zinc-400 font-medium leading-relaxed opacity-80 decoration-zinc-300">
                                            {t(`sidebar.library.items.${item.tk}.desc`)}
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    );
                })}
            </div>

            <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-8" />

            <p className="text-[8px] text-center font-mono text-zinc-400 uppercase tracking-widest opacity-50">
                {t('sidebar.library.more_coming')}
            </p>
        </div>
    )
}
