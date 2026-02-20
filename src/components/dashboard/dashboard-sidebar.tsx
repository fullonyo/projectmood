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
import { GuestbookEditor } from "./guestbook-editor"
import { QuoteEditor } from "./quote-editor"
import { PhotoEditor } from "./photo-editor"
import { MoodStatusEditor } from "./mood-status-editor"
import { CountdownEditor } from "./countdown-editor"
import { ColorPaletteExtractor } from "./color-palette-extractor"
import { EffectsEditor } from "./effects-editor"
import { clearMoodBlocks } from "@/actions/profile"
import { Button } from "../ui/button"
import { ConfirmModal } from "../ui/confirm-modal"
import { useTranslation } from "@/i18n/context"

type TabType = 'style' | 'writing' | 'media' | 'art'

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
    const [activeTab, setActiveTab] = useState<TabType>('writing')
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [isClearing, setIsClearing] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Refs for each editor section
    const textEditorRef = useRef<HTMLDivElement>(null)
    const phraseEditorRef = useRef<HTMLDivElement>(null)
    const socialEditorRef = useRef<HTMLDivElement>(null)
    const artToolsRef = useRef<HTMLDivElement>(null)
    const themeEditorRef = useRef<HTMLDivElement>(null)
    const gifPickerRef = useRef<HTMLDivElement>(null)
    const youtubeEditorRef = useRef<HTMLDivElement>(null)
    const guestbookEditorRef = useRef<HTMLDivElement>(null)
    const quoteEditorRef = useRef<HTMLDivElement>(null)
    const photoEditorRef = useRef<HTMLDivElement>(null)
    const moodStatusEditorRef = useRef<HTMLDivElement>(null)
    const countdownEditorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!selectedBlock) return

        let newTab: TabType = activeTab
        let targetRef: React.RefObject<HTMLDivElement | null> | null = null

        if (selectedBlock.type === 'social') {
            newTab = 'art'
            targetRef = socialEditorRef
        } else if (['text'].includes(selectedBlock.type)) {
            newTab = 'writing'
            targetRef = textEditorRef
        } else if (['ticker', 'subtitle', 'floating'].includes(selectedBlock.type)) {
            newTab = 'writing'
            targetRef = phraseEditorRef
        } else if (selectedBlock.type === 'quote') {
            newTab = 'writing'
            targetRef = quoteEditorRef
        } else if (selectedBlock.type === 'gif') {
            newTab = 'media'
            targetRef = gifPickerRef
        } else if (selectedBlock.type === 'video') {
            newTab = 'media'
            targetRef = youtubeEditorRef
        } else if (selectedBlock.type === 'guestbook') {
            newTab = 'media'
            targetRef = guestbookEditorRef
        } else if (selectedBlock.type === 'photo') {
            newTab = 'media'
            targetRef = photoEditorRef
        } else if (['doodle', 'tape', 'weather', 'media'].includes(selectedBlock.type)) {
            newTab = 'art'
            targetRef = artToolsRef
        } else if (selectedBlock.type === 'moodStatus') {
            newTab = 'art'
            targetRef = moodStatusEditorRef
        } else if (selectedBlock.type === 'countdown') {
            newTab = 'art'
            targetRef = countdownEditorRef
        }

        if (newTab !== activeTab) {
            setActiveTab(newTab)
        }

        // Scroll to editor inside the sidebar container without affecting the main page scroll
        if (targetRef && scrollContainerRef.current && targetRef.current) {
            const container = scrollContainerRef.current
            const target = targetRef.current

            // Calculate position relative to container
            const targetTop = target.offsetTop

            setTimeout(() => {
                container.scrollTo({
                    top: targetTop - 20, // 20px margin
                    behavior: 'smooth'
                })
            }, 100)
        }
    }, [selectedBlock])

    const tabs = [
        { id: 'style', label: t('sidebar.tabs.style'), icon: Palette, description: t('sidebar.tabs.style_desc') },
        { id: 'writing', label: t('sidebar.tabs.writing'), icon: Type, description: t('sidebar.tabs.writing_desc') },
        { id: 'media', label: t('sidebar.tabs.media'), icon: Zap, description: t('sidebar.tabs.media_desc') },
        { id: 'art', label: t('sidebar.tabs.art'), icon: Sparkles, description: t('sidebar.tabs.art_desc') },
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

                {activeTab === 'style' && (
                    <div className="space-y-10">
                        <header>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 bg-black dark:bg-white" />
                                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">{t('sidebar.style.atmosphere_title')}</h3>
                            </div>
                            <p className="text-[9px] text-zinc-400 uppercase tracking-widest">{t('sidebar.style.atmosphere_desc')}</p>
                        </header>
                        <ThemeEditor
                            currentTheme={profile.theme}
                            currentPrimaryColor={profile.primaryColor || '#000'}
                            currentFontStyle={profile.fontStyle || 'sans'}
                            currentCustomFont={profile.customFont}
                            onUpdate={onUpdateProfile}
                        />

                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

                        <ColorPaletteExtractor onApplyPalette={async (colors) => {
                            // Apply first color as primary
                            if (colors[0]) {
                                await onUpdateProfile({ primaryColor: colors[0] })
                            }
                        }} />

                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

                        <header>
                            <h3 className="text-[10px] font-black tracking-tighter uppercase">{t('sidebar.style.magic_fx_title')}</h3>
                            <p className="text-[11px] text-zinc-500 italic mt-1">{t('sidebar.style.magic_fx_desc')}</p>
                        </header>
                        <EffectsEditor profile={profile} />

                        <div className="pt-12 space-y-6">
                            <header className="border-t border-zinc-100 dark:border-zinc-900 pt-8">
                                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] flex items-center gap-2">
                                    <Bomb className="w-3 h-3" />
                                    {t('sidebar.style.danger_title')}
                                </h3>
                                <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">{t('sidebar.style.danger_desc')}</p>
                            </header>

                            <Button
                                variant="outline"
                                className="w-full border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 gap-2 h-12 rounded-xl text-xs font-bold"
                                onClick={() => setShowClearConfirm(true)}
                            >
                                <Trash2 className="w-4 h-4" />
                                {t('sidebar.style.clear_wall_btn')}
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'writing' && (
                    <div className="space-y-10">
                        <header>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 bg-black dark:bg-white" />
                                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">{t('sidebar.writing.text_title')}</h3>
                            </div>
                            <p className="text-[9px] text-zinc-400 uppercase tracking-widest">{t('sidebar.writing.text_desc')}</p>
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
                        <div ref={quoteEditorRef}>
                            <QuoteEditor onAdd={async (content) => {
                                const { addMoodBlock } = await import('@/actions/profile')
                                await addMoodBlock('quote', content, {
                                    x: Math.random() * 40 + 30,
                                    y: Math.random() * 40 + 30
                                })
                            }} />
                        </div>
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="space-y-10">
                        <header>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 bg-black dark:bg-white" />
                                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">{t('sidebar.media.atmosphere_nodes_title')}</h3>
                            </div>
                            <p className="text-[9px] text-zinc-400 uppercase tracking-widest">{t('sidebar.media.atmosphere_nodes_desc')}</p>
                        </header>

                        <div ref={youtubeEditorRef}>
                            <YoutubeEditor
                                highlight={selectedBlock?.type === 'video'}
                            />
                        </div>
                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

                        <SpotifySearch />

                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

                        <div ref={photoEditorRef}>
                            <PhotoEditor onAdd={async (content) => {
                                const { addMoodBlock } = await import('@/actions/profile')
                                await addMoodBlock('photo', content, {
                                    x: Math.random() * 40 + 30,
                                    y: Math.random() * 40 + 30,
                                    width: 300,
                                    height: 300
                                })
                            }} />
                        </div>

                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

                        <div ref={gifPickerRef}>
                            <GifPicker
                                highlight={selectedBlock?.type === 'gif'}
                            />
                        </div>

                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

                        <div ref={guestbookEditorRef}>
                            <GuestbookEditor
                                highlight={selectedBlock?.type === 'guestbook'}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'art' && (
                    <div className="space-y-10">
                        <header>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 bg-black dark:bg-white" />
                                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">{t('sidebar.art.creative_assets_title')}</h3>
                            </div>
                            <p className="text-[9px] text-zinc-400 uppercase tracking-widest">{t('sidebar.art.creative_assets_desc')}</p>
                        </header>
                        <div ref={artToolsRef}>
                            <ArtTools highlight={['tape', 'weather', 'media'].includes(selectedBlock?.type)} />
                        </div>
                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />
                        <DoodlePad />
                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />
                        <div ref={socialEditorRef}>
                            <SocialLinksEditor
                                block={selectedBlock}
                                onUpdate={onUpdateBlock}
                                highlight={selectedBlock?.type === 'social'}
                            />
                        </div>

                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

                        <div ref={moodStatusEditorRef}>
                            <MoodStatusEditor onAdd={async (content) => {
                                const { addMoodBlock } = await import('@/actions/profile')
                                await addMoodBlock('moodStatus', content, {
                                    x: Math.random() * 40 + 30,
                                    y: Math.random() * 40 + 30
                                })
                            }} />
                        </div>

                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

                        <div ref={countdownEditorRef}>
                            <CountdownEditor onAdd={async (content) => {
                                const { addMoodBlock } = await import('@/actions/profile')
                                await addMoodBlock('countdown', content, {
                                    x: Math.random() * 40 + 30,
                                    y: Math.random() * 40 + 30
                                })
                            }} />
                        </div>
                    </div>
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
