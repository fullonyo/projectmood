"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
/* eslint-disable @typescript-eslint/no-unused-vars */
import { LayersPanel } from "./layers-panel"

import {
    Layout,
    Plus,
    ChevronLeft,
    Box,
    Sparkles,
    Loader2,
    Trash2
} from "lucide-react"

import { BlockLibrary } from "./block-library"
import { UniversalRoomEditor } from "./universal-room-editor"
import { BlockEditorRegistry } from "./block-editor-registry"
import { SidebarBackButton } from "./sidebar-back-button"
import { SidebarRoomInsight } from "./sidebar-room-insight"
import { clearMoodBlocks, addMoodBlock } from "@/actions/profile"
import { Button } from "../ui/button"
import { ConfirmModal } from "../ui/confirm-modal"
import { useTranslation } from "@/i18n/context"
import { AnimatePresence, motion } from "framer-motion"
import {
    Maximize2,
    Link2,
    ArrowRight,
    GripHorizontal,
    MoreHorizontal
} from "lucide-react"

type TopLevelTab = 'elements' | 'layers' | 'room'

import { MoodBlock, Profile } from "@/types/database"

export function DashboardSidebar({
    profile,
    selectedBlocks,
    setSelectedIds,
    onUpdateBlock,
    removeBlocks, // Added removeBlocks prop
    onUpdateProfile,
    blocks,
    systemFlags,
    publishedAt
}: {
    profile: Profile;
    selectedBlocks: MoodBlock[];
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    onUpdateBlock: (id: string, updates: Partial<MoodBlock>) => void;
    removeBlocks: (ids: string[]) => void;
    onUpdateProfile: (data: Partial<Profile>) => void;
    blocks: MoodBlock[];
    systemFlags?: Record<string, boolean>;
    publishedAt?: string | null;
    onNormalize?: () => void;
}) {

    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<TopLevelTab>('elements')
    const [draftBlockType, setDraftBlockType] = useState<string | null>(null)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [isClearing, setIsClearing] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const handleAddBlock = async (type: string) => {
        setDraftBlockType(type)
        setSelectedIds([])
    }

    useEffect(() => {
        if (selectedBlocks.length > 0 && activeTab !== 'elements') {
            setActiveTab('elements')
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    })
                }
            }, 50)
        }
    }, [selectedBlocks, activeTab])

    const tabs = [
        { id: 'elements', label: t('sidebar.tabs.elements'), icon: Plus, description: t('sidebar.tabs.elements_desc') },
        { id: 'layers', label: t('sidebar.tabs.layers') || 'Camadas', icon: Layout, description: t('sidebar.tabs.layers_desc') },
        { id: 'room', label: t('sidebar.tabs.room'), icon: Sparkles, description: t('sidebar.tabs.room_desc') },
    ]

    return (
        <aside className="w-80 h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50 overflow-hidden relative">
            {/* HUD Status Line - Ultra thin top bar */}
            <div className="h-0.5 w-full flex overflow-hidden opacity-20">
                <div className="h-full w-1/3 bg-black dark:bg-white animate-pulse" />
                <div className="h-full w-2/3 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <div className="p-10 border-b border-zinc-100 dark:border-zinc-900 relative bg-zinc-50/30 dark:bg-zinc-950/20">
                <AnimatePresence mode="wait">
                    {selectedBlocks.length > 1 ? (
                        <motion.div
                            key="multi-select"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-blue-500 leading-none mb-1">Multi-Selection</span>
                                    <h1 className="text-xl font-black tracking-tighter uppercase italic">{selectedBlocks.length} {t('common.items')}</h1>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedIds([])}
                                        className="h-8 w-8 p-0 border-zinc-200 dark:border-zinc-800 rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                                    >
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            removeBlocks(selectedBlocks.map(b => b.id))
                                            setSelectedIds([])
                                        }}
                                        className="h-8 w-8 p-0 border-red-200 dark:border-red-900/30 text-red-500 rounded-none hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Quick HUD Metrics for Selection */}
                            <div className="flex gap-4 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                                <div className="flex-1 space-y-1">
                                    <p className="text-[6px] font-black uppercase tracking-widest opacity-40 italic">Global Sync</p>
                                    <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            className="h-full bg-black dark:bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1 text-right">
                                    <p className="text-[6px] font-black uppercase tracking-widest opacity-40 italic">Precision</p>
                                    <p className="text-[8px] font-mono font-black italic">0.02% DEV</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle-header"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex items-center justify-between"
                        >
                            <div className="flex flex-col">
                                <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-30 leading-none mb-1">{t('sidebar.header_subtitle')}</span>
                                <h1 className="text-2xl font-black tracking-tighter uppercase italic tracking-[-0.05em]">{t('sidebar.header_title')}</h1>
                            </div>

                            {selectedBlocks.length === 1 && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedIds([])}
                                        className="h-7 px-3 text-[8px] font-black uppercase tracking-widest border-black dark:border-white rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                                    >
                                        <ChevronLeft className="w-3 h-3 mr-1" />
                                        {t('common.close')}
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <nav className="grid grid-cols-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-950">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as TopLevelTab)
                            setSelectedIds([])
                            setDraftBlockType(null)
                        }}
                        className={cn(
                            "flex flex-col items-center justify-center py-5 transition-all relative group",
                            activeTab === tab.id
                                ? "text-black dark:text-white"
                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <div className="flex items-center gap-1.5 mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                            <tab.icon className={cn("w-3 h-3 transition-transform", activeTab === tab.id && "opacity-100 scale-110")} />
                        </div>
                        <span className="text-[7.5px] font-black uppercase tracking-[0.2em]">{tab.label}</span>

                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="sidebar-active-tab"
                                className="absolute bottom-0 left-0 right-0 h-[3px] bg-black dark:bg-white"
                            />
                        )}

                        {/* Tab Indicator Dots */}
                        <div className={cn(
                            "absolute top-2 right-2 w-1 h-1 rounded-full opacity-0 transition-opacity",
                            activeTab === tab.id && "opacity-20 bg-current"
                        )} />
                    </button>
                ))}
            </nav>

            <div
                ref={scrollContainerRef}
                className={cn(
                    "flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar animate-in fade-in slide-in-from-left-2 duration-300",
                    activeTab === 'layers' ? "p-0" : "p-6 space-y-8"
                )}
            >
                {activeTab === 'room' && (
                    <UniversalRoomEditor
                        profile={profile}
                        onUpdateProfile={onUpdateProfile}
                        onClearWall={() => setShowClearConfirm(true)}
                    />
                )}

                {activeTab === 'layers' && (
                    <LayersPanel
                        blocks={blocks}
                        selectedIds={selectedBlocks.map(b => b.id)}
                        setSelectedIds={setSelectedIds}
                        onUpdateBlock={onUpdateBlock}
                        onDeleteRequest={(id) => removeBlocks([id])}
                    />
                )}

                {activeTab === 'elements' && (
                    <>
                        {selectedBlocks.length === 0 && !draftBlockType ? (
                            <div className="space-y-12 pb-10">
                                <SidebarRoomInsight blocks={blocks} profile={profile} publishedAt={publishedAt} />
                                <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-900/50" />
                                <BlockLibrary onAddBlock={handleAddBlock} systemFlags={systemFlags} />
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                                <SidebarBackButton
                                    onClick={() => {
                                        setSelectedIds([])
                                        setDraftBlockType(null)
                                    }}
                                />

                                <BlockEditorRegistry
                                    selectedBlock={selectedBlocks[0]}
                                    draftBlockType={draftBlockType}
                                    onUpdateBlock={onUpdateBlock}
                                    onClose={() => {
                                        setSelectedIds([])
                                        setDraftBlockType(null)
                                    }}
                                    setDraftBlockType={setDraftBlockType}
                                />
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

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                <p className="text-[9px] text-zinc-400 text-center uppercase tracking-widest leading-relaxed">
                    {t('sidebar.bottom_tip')}
                </p>
            </div>
        </aside>
    )
}
