"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
// ... keep other imports ...
import {
    Layout,
    Plus,
    ChevronLeft,
    Box,
    Sparkles,
    Loader2
} from "lucide-react"

import { TextEditor } from "./text-editor"
import { PhraseEditor } from "./phrase-editor"
import { ArtTools } from "./art-tools"
import { DoodlePad } from "./doodle-pad"
import { SocialLinksEditor } from "./social-links-editor"
import { GifPicker } from "./gif-picker"
import { SpotifySearch } from "./spotify-search"
import { YoutubeEditor } from "./youtube-editor"
import { GuestbookEditor } from "./guestbook-editor"
import { QuoteEditor } from "./quote-editor"
import { PhotoEditor } from "./photo-editor"
import { MoodStatusEditor } from "./mood-status-editor"
import { CountdownEditor } from "./countdown-editor"
import { BlockLibrary } from "./block-library"
import { RoomSettings } from "./room-settings"
import { clearMoodBlocks, addMoodBlock } from "@/actions/profile"
import { Button } from "../ui/button"
import { ConfirmModal } from "../ui/confirm-modal"
import { useTranslation } from "@/i18n/context"

type TopLevelTab = 'elements' | 'room'

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
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<TopLevelTab>('elements')
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [isClearing, setIsClearing] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const handleAddBlock = async (type: string) => {
        let defaultContent = {}
        // Criar conteúdo inicial dependendo do tipo para instanciar rápido
        if (type === 'text') defaultContent = { text: "" }
        if (type === 'phrase') defaultContent = { text: "", style: 'vhs' }
        if (type === 'moodStatus') defaultContent = { status: '' }
        if (type === 'countdown') defaultContent = { title: '', date: '' }

        const result = await addMoodBlock(type, defaultContent, {
            x: Math.random() * 40 + 30, // Centro aproximado
            y: Math.random() * 40 + 30
        })

        if (result?.success && result?.block?.id) {
            setSelectedId(result.block.id)
        }
    }

    useEffect(() => {
        // Se houver um bloco selecionado, forçamos a aba para "Elementos"
        // para exibir o inspector correspondente
        if (selectedBlock && activeTab !== 'elements') {
            setActiveTab('elements')

            // Um leve delay pro DOM da Sidebar desenhar o componente inspector 
            // antes de focar
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    })
                }
            }, 50)
        }
    }, [selectedBlock])

    const tabs = [
        { id: 'elements', label: t('sidebar.tabs.elements'), icon: Box, description: t('sidebar.tabs.elements_desc') },
        { id: 'room', label: t('sidebar.tabs.room'), icon: Sparkles, description: t('sidebar.tabs.room_desc') },
    ]

    return (
        <aside className="w-80 h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50 overflow-hidden">
            {/* Sidebar Header - Studio Identity */}
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-30 leading-none mb-1">{t('sidebar.header_subtitle')}</span>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic">{t('sidebar.header_title')}</h1>
                    </div>
                    {selectedBlock && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedId(null)}
                            className="h-7 px-3 text-[8px] font-black uppercase tracking-widest border-black dark:border-white rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                        >
                            <Plus className="w-3 h-3 mr-1 rotate-45" />
                            {t('sidebar.discard_changes')}
                        </Button>
                    )}
                </div>
            </div>
            {/* Top Categories Navigation */}
            <nav className="grid grid-cols-2 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as TopLevelTab)
                            setSelectedId(null) // Reset selection when changing tabs
                        }}
                        className={cn(
                            "flex flex-col items-center justify-center py-4 transition-all relative group",
                            activeTab === tab.id
                                ? "text-black dark:text-white"
                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4 mb-1.5 opacity-40 transition-all", activeTab === tab.id && "opacity-100 scale-110")} />
                        <span className="text-[7px] font-black uppercase tracking-[0.2em]">{tab.label}</span>

                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white" />
                        )}
                    </button>
                ))}
            </nav>

            {/* Scrollable Editor Area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar space-y-8 animate-in fade-in slide-in-from-left-2 duration-300"
            >

                {activeTab === 'room' && (
                    <RoomSettings
                        profile={profile}
                        onUpdateProfile={onUpdateProfile}
                        onClearWall={() => setShowClearConfirm(true)}
                    />
                )}

                {activeTab === 'elements' && (
                    <>
                        {!selectedBlock ? (
                            <BlockLibrary onAddBlock={handleAddBlock} />
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedId(null)}
                                    className="w-full justify-start h-10 px-0 hover:bg-transparent hover:opacity-70 transition-opacity text-zinc-500 rounded-none mb-6 relative group"
                                >
                                    <div className="w-6 h-6 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mr-3 group-hover:-translate-x-1 transition-transform bg-white dark:bg-zinc-950">
                                        <ChevronLeft className="w-3 h-3 text-black dark:text-white" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black dark:text-white">{t('sidebar.library.inspector_back')}</span>
                                </Button>

                                {/* Inspector Condicional */}
                                {selectedBlock.type === 'text' && (
                                    <TextEditor block={selectedBlock} onUpdate={onUpdateBlock} />
                                )}
                                {['ticker', 'subtitle', 'floating'].includes(selectedBlock.type) && (
                                    <PhraseEditor block={selectedBlock} onUpdate={onUpdateBlock} />
                                )}
                                {selectedBlock.type === 'quote' && (
                                    <QuoteEditor
                                        onAdd={() => { }} // It's already added, we'd need to adapt QuoteEditor for update in the future, simulating for now
                                    />
                                )}
                                {selectedBlock.type === 'video' && (
                                    <YoutubeEditor />
                                )}
                                {selectedBlock.type === 'music' && (
                                    <SpotifySearch />
                                )}
                                {selectedBlock.type === 'photo' && (
                                    <PhotoEditor onAdd={() => { }} />
                                )}
                                {selectedBlock.type === 'gif' && (
                                    <GifPicker />
                                )}
                                {selectedBlock.type === 'guestbook' && (
                                    <GuestbookEditor />
                                )}
                                {['tape', 'weather', 'media'].includes(selectedBlock.type) && (
                                    <ArtTools />
                                )}
                                {selectedBlock.type === 'doodle' && (
                                    <DoodlePad />
                                )}
                                {selectedBlock.type === 'social' && (
                                    <SocialLinksEditor block={selectedBlock} onUpdate={onUpdateBlock} />
                                )}
                                {selectedBlock.type === 'moodStatus' && (
                                    <MoodStatusEditor onAdd={() => { }} />
                                )}
                                {selectedBlock.type === 'countdown' && (
                                    <CountdownEditor onAdd={() => { }} />
                                )}
                            </div>
                        )}
                    </>
                )}

            </div>

            <ConfirmModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={async () => {
                    setIsClearing(true)
                    await clearMoodBlocks()
                    setIsClearing(false)
                    setShowClearConfirm(false)
                }}
                isLoading={isClearing}
                title={t('modals.clear_wall.title')}
                message={t('modals.clear_wall.message')}
                confirmText={t('modals.clear_wall.confirm_btn')}
                type="danger"
            />

            {/* Bottom Tip Overlay (Conditional) */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                <p className="text-[9px] text-zinc-400 text-center uppercase tracking-widest leading-relaxed">
                    {t('sidebar.bottom_tip')}
                </p>
            </div>
        </aside>
    )
}
