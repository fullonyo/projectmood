"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UniversalLayersPanel } from "./UniversalLayersPanel"

import {
    Layout,
    Plus,
    ChevronLeft,
    Box,
    Sparkles,
    Loader2,
    Trash2
} from "lucide-react"

import { UniversalBlockLibrary } from "./UniversalBlockLibrary"
import { UniversalRoomEditor } from "./UniversalRoomEditor"
import { BlockEditorRegistry } from "./block-editor-registry"
import { UniversalBackButton } from "./UniversalBackButton"
import { UniversalRoomInsight } from "./UniversalRoomInsight"
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
    onUpdateBlocks,
    removeBlocks, // Added removeBlocks prop
    onGroup,
    onUngroup,
    onUpdateProfile,
    blocks,
    systemFlags,
    publishedAt,
    onNormalize,
    onAddBlock
}: {
    profile: Profile;
    selectedBlocks: MoodBlock[];
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    onUpdateBlock: (id: string, updates: Partial<MoodBlock>) => void;
    onUpdateBlocks: (ids: string[], updates: Partial<MoodBlock> | ((block: MoodBlock) => Partial<MoodBlock>)) => void;
    removeBlocks: (ids: string[]) => void;
    onGroup: () => void;
    onUngroup: () => void;
    onUpdateProfile: (data: Partial<Profile>) => void;
    blocks: MoodBlock[];
    systemFlags?: Record<string, boolean>;
    publishedAt?: string | null;
    onNormalize?: () => void;
    onAddBlock?: (type: string, content: any) => Promise<void>;
}) {

    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<TopLevelTab>('elements')
    const [draftBlockType, setDraftBlockType] = useState<string | null>(null)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [isClearing, setIsClearing] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const handleAddBlock = async (type: string, content?: any) => {
        if (content && onAddBlock) {
            await onAddBlock(type, content);
            // O fechamento do draft e seleção do novo bloco agora é gerido 
            // pelo DashboardClientLayout para evitar resets de UI.
        } else {
            setDraftBlockType(type);
            setSelectedIds([]);
        }
    }

    useEffect(() => {
        if (selectedBlocks.length > 0 && draftBlockType) {
            setDraftBlockType(null)
        }
    }, [selectedBlocks.length, draftBlockType])

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
        <aside className="w-80 h-full bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-[#121214] border-r border-zinc-200 dark:border-zinc-800/50 flex flex-col z-50 overflow-hidden relative shadow-xl">
            {/* Header Area */}
            <div className="p-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/50 relative">
                {selectedBlocks.length > 1 ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5">Seleção Múltipla</span>
                                <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">{selectedBlocks.length} {t('common.items')}</h1>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedIds([])}
                                    className="h-8 w-8 p-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-all"
                                >
                                    <Plus className="w-4 h-4 rotate-45" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        removeBlocks(selectedBlocks.map(b => b.id))
                                        setSelectedIds([])
                                    }}
                                    className="h-8 w-8 p-0 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 leading-none mb-1.5">{t('sidebar.header_subtitle')}</span>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{t('sidebar.header_title')}</h1>
                        </div>

                        {(selectedBlocks.length === 1 || draftBlockType) && (
                            <button
                                onClick={() => {
                                    setSelectedIds([])
                                    setDraftBlockType(null)
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-90 group"
                                title={t('common.close')}
                            >
                                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Tab Navigation - Pill Style */}
            <div className="px-4 py-3 bg-white/50 dark:bg-zinc-900/50">
                <nav className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as TopLevelTab)
                                    setSelectedIds([])
                                    setDraftBlockType(null)
                                }}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 relative",
                                    isActive
                                        ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5"
                                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                                )}
                            >
                                <tab.icon className={cn("w-3.5 h-3.5", isActive && "scale-110")} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            <div
                ref={scrollContainerRef}
                className={cn(
                    "flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar",
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
                    <UniversalLayersPanel
                        blocks={blocks}
                        selectedIds={selectedBlocks.map(b => b.id)}
                        setSelectedIds={setSelectedIds}
                        onUpdateBlock={onUpdateBlock}
                        onUpdateBlocks={onUpdateBlocks}
                        onDeleteRequest={(ids) => removeBlocks(ids)}
                        onGroup={onGroup}
                        onUngroup={onUngroup}
                        onNormalize={onNormalize}
                    />
                )}

                {activeTab === 'elements' && (
                    <>
                        {selectedBlocks.length === 0 && !draftBlockType ? (
                            <div className="space-y-12 pb-10">
                                <UniversalRoomInsight blocks={blocks} profile={profile} publishedAt={publishedAt} />
                                <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-900/50" />
                                <UniversalBlockLibrary onAddBlock={handleAddBlock} systemFlags={systemFlags} />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <BlockEditorRegistry
                                    selectedBlocks={selectedBlocks}
                                    draftBlockType={draftBlockType}
                                    onUpdateBlock={onUpdateBlock}
                                    onUpdateBlocks={onUpdateBlocks}
                                    onAddBlock={handleAddBlock}
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
