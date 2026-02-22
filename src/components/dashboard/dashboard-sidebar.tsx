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
    Loader2
} from "lucide-react"

import { BlockLibrary } from "./block-library"
import { UniversalRoomEditor } from "./universal-room-editor"
import { BlockEditorRegistry } from "./block-editor-registry"
import { SidebarBackButton } from "./sidebar-back-button"
import { clearMoodBlocks, addMoodBlock } from "@/actions/profile"
import { Button } from "../ui/button"
import { ConfirmModal } from "../ui/confirm-modal"
import { useTranslation } from "@/i18n/context"

type TopLevelTab = 'elements' | 'layers' | 'room'

export function DashboardSidebar({
    profile,
    selectedBlocks,
    setSelectedIds,
    onUpdateBlock,
    onUpdateProfile,
    onDeleteRequest,
    blocks,
    systemFlags
}: {
    profile: any;
    selectedBlocks: any[];
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    onUpdateBlock: (id: string, content: any) => void;
    onUpdateProfile: (data: any) => void;
    onDeleteRequest: (id: string) => void;
    blocks: any[];
    systemFlags?: Record<string, boolean>;
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
        <aside className="w-80 h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50 overflow-hidden">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-30 leading-none mb-1">{t('sidebar.header_subtitle')}</span>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic">{t('sidebar.header_title')}</h1>
                    </div>
                    {selectedBlocks.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedIds([])}
                            className="h-7 px-3 text-[8px] font-black uppercase tracking-widest border-black dark:border-white rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                        >
                            <Plus className="w-3 h-3 mr-1 rotate-45" />
                            {t('sidebar.discard_changes')}
                        </Button>
                    )}
                </div>
            </div>
            <nav className="grid grid-cols-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as TopLevelTab)
                            setSelectedIds([])
                            setDraftBlockType(null)
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
                        onDeleteRequest={(id) => onDeleteRequest(id)}
                    />
                )}

                {activeTab === 'elements' && (
                    <>
                        {selectedBlocks.length === 0 && !draftBlockType ? (
                            <BlockLibrary onAddBlock={handleAddBlock} systemFlags={systemFlags} />
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
