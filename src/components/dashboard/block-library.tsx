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
    Play,
    Palette,
    MoreHorizontal,
    Activity
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
                { id: 'universal_media', type: 'media', icon: Play, tk: 'universal_media' },
                { id: 'gif', type: 'gif', icon: Youtube, tk: 'gif' },
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
                { id: 'shape', type: 'shape', icon: Palette, tk: 'shape' },
                { id: 'rorschach', type: 'rorschach', icon: Sparkles, tk: 'rorschach' },
            ]
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
            <header className="relative mb-8 space-y-3 px-1">
                <div className="flex items-center gap-2 opacity-30">
                    <Activity className="w-2.5 h-2.5" />
                    <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{t('sidebar.library.title')}</h3>
                </div>
                <div className="flex flex-col border-l border-zinc-100 dark:border-zinc-900 pl-4 py-1">
                    <p className="text-sm font-black italic tracking-tighter uppercase leading-tight">{t('sidebar.library.subtitle')}</p>
                </div>
            </header>

            <div className="space-y-12">
                {categories.map((group, groupIdx) => {
                    // Filter items based on systemFlags. Default is true if flag is missing.
                    const visibleItems = group.items.filter(item => {
                        const flagKey = `block_${item.id}`;
                        if (systemFlags[flagKey] === false) return false;
                        return true;
                    });

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={groupIdx} className="space-y-4">
                            <header className="flex items-center justify-between opacity-30">
                                <h4 className="text-[7.5px] font-black uppercase tracking-[0.4em]">Group.0{groupIdx + 1}</h4>
                                <div className="h-[1px] flex-1 mx-4 bg-zinc-200 dark:bg-zinc-800" />
                                <MoreHorizontal className="w-3 h-3" />
                            </header>

                            <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800">
                                {visibleItems.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => onAddBlock(item.type)}
                                            className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all group relative overflow-hidden"
                                        >
                                            <div className="mb-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                                                <Icon className="w-5 h-5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" />
                                            </div>

                                            <h4 className="text-[7.5px] font-black uppercase tracking-[0.4em] text-center">
                                                {t(`sidebar.library.items.${item.tk}.title`)}
                                            </h4>

                                            {/* HUD decorative corner markers */}
                                            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black dark:border-white opacity-0 group-hover:opacity-20 transition-opacity" />
                                        </button>
                                    )
                                })}
                            </div>
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
