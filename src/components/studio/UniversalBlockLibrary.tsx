"use client"

import { useTranslation } from "@/i18n/context"
import { cn } from "@/lib/utils"
import {
    Type,
    Image as ImageIcon,
    Play,
    Activity,
    Cloud,
    Pencil,
    MessageSquare,
    Timer,
    Link2,
    Shapes,
    Sparkles,
    Plus,
    ChevronLeft
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
            title: t('sidebar.library.groups.essentials'),
            items: [
                { id: 'typography', type: 'text', icon: Type, tk: 'typography' },
                { id: 'photo', type: 'photo', icon: ImageIcon, tk: 'photo' },
            ]
        },
        {
            title: t('sidebar.library.groups.atmosphere'),
            items: [
                { id: 'media', type: 'media', icon: Play, tk: 'media' },
                { id: 'gif', type: 'gif', icon: Activity, tk: 'gif' },
                { id: 'weather', type: 'weather', icon: Cloud, tk: 'weather' },
            ]
        },
        {
            title: t('sidebar.library.groups.creative'),
            items: [
                { id: 'doodle', type: 'doodle', icon: Pencil, tk: 'doodle' },
                { id: 'guestbook', type: 'guestbook', icon: MessageSquare, tk: 'guestbook' },
                { id: 'countdown', type: 'countdown', icon: Timer, tk: 'countdown' },
                { id: 'social', type: 'social', icon: Link2, tk: 'social' },
                { id: 'shape', type: 'shape', icon: Shapes, tk: 'shape' },
                { id: 'rorschach', type: 'rorschach', icon: Sparkles, tk: 'rorschach' },
            ]
        }
    ]

    return (
        <div className="space-y-12">
            <EditorHeader 
                title={t('sidebar.library.title')}
                subtitle={t('sidebar.library.subtitle')}
            />

            <div className="space-y-12">
                {categories.map((group, groupIdx) => {
                    const visibleItems = group.items.filter(item => {
                        const flagKey = `block_${item.id}`;
                        if (systemFlags[flagKey] === false) return false;
                        return true;
                    });

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={groupIdx} className="space-y-6">
                            <div className="flex items-center gap-3 px-1">
                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] shrink-0">{group.title}</span>
                                <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800/50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {visibleItems.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => onAddBlock(item.type)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all duration-300 ease-out group relative overflow-hidden",
                                                "bg-zinc-100/50 dark:bg-black/30 shadow-[inset_0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] border border-transparent",
                                                "hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-100 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-black/5 hover:scale-[1.02] active:scale-[0.98]"
                                            )}
                                        >
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-all duration-300">
                                                <Icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                                            </div>

                                            <h4 className="text-[9px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.2em] text-center group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                                {t(`sidebar.library.items.${item.tk}.title`)}
                                            </h4>
                                            
                                            {/* Corner Marker (HUD style) */}
                                            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-zinc-200 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
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
