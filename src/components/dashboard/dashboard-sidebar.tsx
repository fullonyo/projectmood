"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
    Palette,
    PlusSquare,
    Sparkles,
    Music,
    Type,
    Image as ImageIcon,
    PenTool,
    Share2,
    CloudSun
} from "lucide-react"

import { ThemeEditor } from "./theme-editor"
import { TextEditor } from "./text-editor"
import { ArtTools } from "./art-tools"
import { DoodlePad } from "./doodle-pad"
import { SocialLinksEditor } from "./social-links-editor"
import { GifPicker } from "./gif-picker"
import { SpotifySearch } from "./spotify-search"

type TabType = 'style' | 'content' | 'art' | 'social'

export function DashboardSidebar({ profile }: { profile: any }) {
    const [activeTab, setActiveTab] = useState<TabType>('content')

    const tabs = [
        { id: 'style', label: 'Estilo', icon: Palette, description: 'Cores e Fontes' },
        { id: 'content', label: 'Blocos', icon: PlusSquare, description: 'Textos e Mídia' },
        { id: 'art', label: 'Arte', icon: Sparkles, description: 'Scrapbook Tools' },
        { id: 'social', label: 'Links', icon: Share2, description: 'Social Connect' },
    ]

    return (
        <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full overflow-hidden z-10">
            {/* Top Categories Navigation */}
            <nav className="grid grid-cols-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={cn(
                            "flex flex-col items-center justify-center py-4 transition-all relative group",
                            activeTab === tab.id
                                ? "text-black dark:text-white"
                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <tab.icon className={cn("w-5 h-5 mb-1", activeTab === tab.id && "animate-in fade-in scale-110")} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>

                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white" />
                        )}
                    </button>
                ))}
            </nav>

            {/* Scrollable Editor Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">

                {activeTab === 'style' && (
                    <div className="space-y-8">
                        <header>
                            <h3 className="text-xl font-black tracking-tighter uppercase">Canvas Style</h3>
                            <p className="text-[11px] text-zinc-500 italic">Defina a atmosfera do seu espaço digital.</p>
                        </header>
                        <ThemeEditor
                            currentTheme={profile.theme}
                            currentPrimaryColor={profile.primaryColor || '#000'}
                            currentFontStyle={profile.fontStyle || 'sans'}
                        />
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-10">
                        <header>
                            <h3 className="text-xl font-black tracking-tighter uppercase">Creativity Block</h3>
                            <p className="text-[11px] text-zinc-500 italic">Adicione elementos fundamentais ao seu mural.</p>
                        </header>
                        <TextEditor />
                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />
                        <GifPicker />
                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />
                        <SpotifySearch />
                    </div>
                )}

                {activeTab === 'art' && (
                    <div className="space-y-10">
                        <header>
                            <h3 className="text-xl font-black tracking-tighter uppercase">The Art Studio</h3>
                            <p className="text-[11px] text-zinc-500 italic">Ferramentas para transformar um mural em Scrapbook.</p>
                        </header>
                        <ArtTools />
                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />
                        <DoodlePad />
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="space-y-10">
                        <header>
                            <h3 className="text-xl font-black tracking-tighter uppercase">Connected</h3>
                            <p className="text-[11px] text-zinc-500 italic">Espalhe suas redes e transforme o mural num hub.</p>
                        </header>
                        <SocialLinksEditor />
                    </div>
                )}

            </div>

            {/* Bottom Tip Overlay (Conditional) */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                <p className="text-[9px] text-zinc-400 text-center uppercase tracking-widest leading-relaxed">
                    Clique nos blocos do mural para <br /> girar ou deletar
                </p>
            </div>
        </aside>
    )
}
