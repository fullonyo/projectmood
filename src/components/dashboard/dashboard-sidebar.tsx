"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
// ... keep other imports ...
import {
    Layout,
    Type,
    Palette,
    Plus,
    Share2,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Music,
    Image as ImageIcon,
    Cloud,
    StickyNote,
    ExternalLink,
    Zap,
    PlusSquare,
    Sparkles,
    Bomb
} from "lucide-react"

import { ThemeEditor } from "./theme-editor"
import { TextEditor } from "./text-editor"
import { PhraseEditor } from "./phrase-editor"
import { ArtTools } from "./art-tools"
import { DoodlePad } from "./doodle-pad"
import { SocialLinksEditor } from "./social-links-editor"
import { GifPicker } from "./gif-picker"
import { SpotifySearch } from "./spotify-search"
import { YoutubeEditor } from "./youtube-editor"
import { clearMoodBlocks } from "@/actions/profile"
import { Button } from "../ui/button"

type TabType = 'style' | 'content' | 'art' | 'social'

export function DashboardSidebar({
    profile,
    selectedBlock,
    setSelectedId,
    onUpdateBlock,
    onUpdateProfile
}: {
    profile: any,
    selectedBlock?: any,
    setSelectedId: (id: string | null) => void,
    onUpdateBlock: (id: string, content: any) => void,
    onUpdateProfile: (data: any) => void
}) {
    const [activeTab, setActiveTab] = useState<TabType>('content')
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Refs for each editor section
    const textEditorRef = useRef<HTMLDivElement>(null)
    const phraseEditorRef = useRef<HTMLDivElement>(null)
    const socialEditorRef = useRef<HTMLDivElement>(null)
    const artToolsRef = useRef<HTMLDivElement>(null)
    const themeEditorRef = useRef<HTMLDivElement>(null)
    const gifPickerRef = useRef<HTMLDivElement>(null)
    const youtubeEditorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!selectedBlock) return

        let newTab: TabType = activeTab
        let targetRef: React.RefObject<HTMLDivElement | null> | null = null

        if (selectedBlock.type === 'social') {
            newTab = 'social'
            targetRef = socialEditorRef
        } else if (['text'].includes(selectedBlock.type)) {
            newTab = 'content'
            targetRef = textEditorRef
        } else if (['ticker', 'subtitle', 'floating'].includes(selectedBlock.type)) {
            newTab = 'content'
            targetRef = phraseEditorRef
        } else if (selectedBlock.type === 'gif') {
            newTab = 'content'
            targetRef = gifPickerRef
        } else if (selectedBlock.type === 'video') {
            newTab = 'content'
            targetRef = youtubeEditorRef
        } else if (['doodle', 'tape', 'weather', 'media'].includes(selectedBlock.type)) {
            newTab = 'art'
            targetRef = artToolsRef
        }

        if (newTab !== activeTab) {
            setActiveTab(newTab)
        }

        // Scroll to editor with a small delay to allow tab switching animation
        if (targetRef) {
            setTimeout(() => {
                targetRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        }
    }, [selectedBlock])

    const tabs = [
        { id: 'style', label: 'Estilo', icon: Palette, description: 'Cores e Fontes' },
        { id: 'content', label: 'Blocos', icon: PlusSquare, description: 'Textos e Mídia' },
        { id: 'art', label: 'Arte', icon: Sparkles, description: 'Scrapbook Tools' },
        { id: 'social', label: 'Links', icon: Share2, description: 'Social Connect' },
    ]

    return (
        <aside className="w-80 h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl z-50">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-black tracking-tighter uppercase italic">Mood Studio</h1>
                    {selectedBlock && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedId(null)}
                            className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                            <Plus className="w-3 h-3 mr-1 rotate-45" />
                            Novo
                        </Button>
                    )}
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400">Curadoria de Estética</p>
            </div>
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
                            onUpdate={onUpdateProfile}
                        />

                        <div className="pt-10 space-y-4">
                            <div className="h-[1px] bg-red-100 dark:bg-red-900/20" />
                            <header>
                                <h3 className="text-sm font-bold text-red-500 uppercase flex items-center gap-2">
                                    <Bomb className="w-4 h-4" />
                                    Danger Zone
                                </h3>
                                <p className="text-[10px] text-zinc-500 mt-1">Ações que não podem ser desfeitas.</p>
                            </header>

                            <Button
                                variant="outline"
                                className="w-full border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 gap-2 h-12 rounded-xl text-xs font-bold"
                                onClick={async () => {
                                    if (confirm("TEM CERTEZA? Isso vai deletar TODOS os blocos do seu mural permanentemente.")) {
                                        await clearMoodBlocks()
                                    }
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                                Limpar Todo o Mural
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-10">
                        <header>
                            <h3 className="text-xl font-black tracking-tighter uppercase">Creativity Block</h3>
                            <p className="text-[11px] text-zinc-500 italic">Adicione elementos fundamentais ao seu mural.</p>
                        </header>
                        <div ref={textEditorRef}>
                            <TextEditor
                                block={selectedBlock}
                                onUpdate={onUpdateBlock}
                                highlight={selectedBlock?.type === 'text'}
                            />
                        </div>
                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />
                        <div ref={phraseEditorRef}>
                            <PhraseEditor
                                block={selectedBlock}
                                onUpdate={onUpdateBlock}
                                highlight={['ticker', 'subtitle', 'floating'].includes(selectedBlock?.type)}
                            />
                        </div>
                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />
                        <div ref={gifPickerRef}>
                            <GifPicker
                                highlight={selectedBlock?.type === 'gif'}
                            />
                        </div>
                        <div ref={youtubeEditorRef}>
                            <YoutubeEditor
                                highlight={selectedBlock?.type === 'video'}
                            />
                        </div>
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
                        <div ref={artToolsRef}>
                            <ArtTools highlight={['tape', 'weather', 'media'].includes(selectedBlock?.type)} />
                        </div>
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
                        <div ref={socialEditorRef}>
                            <SocialLinksEditor
                                block={selectedBlock}
                                onUpdate={onUpdateBlock}
                                highlight={selectedBlock?.type === 'social'}
                            />
                        </div>
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
