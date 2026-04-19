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
import { EditorHeader } from "./EditorUI"

interface BlockLibraryProps {
    onAddBlock: (type: string) => void
    systemFlags?: Record<string, boolean>
}

export function UniversalBlockLibrary({ onAddBlock, systemFlags = {} }: BlockLibraryProps) {
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
                { id: 'media', type: 'media', icon: Play, tk: 'universal_media' },
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
                { id: 'shape', type: 'shape', icon: Palette, tk: 'shape' },
                { id: 'rorschach', type: 'rorschach', icon: Sparkles, tk: 'rorschach' },
            ]
        }
    ]

    return (
        <div className="space-y-10">
            <EditorHeader 
                title={t('sidebar.library.title')}
                subtitle={t('sidebar.library.subtitle')}
            />

            <div className="space-y-10">
                {categories.map((group, groupIdx) => {
                    const visibleItems = group.items.filter(item => {
                        const flagKey = `block_${item.id}`;
                        if (systemFlags[flagKey] === false) return false;
                        return true;
                    });

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={groupIdx} className="space-y-4">
                            <div className="flex items-center gap-3 px-1">
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">Grupo 0{groupIdx + 1}</span>
                                <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {visibleItems.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => onAddBlock(item.type)}
                                            className="flex flex-col items-center justify-center p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all group relative overflow-hidden"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-3 text-zinc-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300">
                                                <Icon className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" />
                                            </div>

                                            <h4 className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide text-center">
                                                {t(`sidebar.library.items.${item.tk}.title`)}
                                            </h4>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] text-center font-medium text-zinc-400 uppercase tracking-widest">
                    {t('sidebar.library.more_coming')}
                </p>
            </div>
        </div>
    )
}
