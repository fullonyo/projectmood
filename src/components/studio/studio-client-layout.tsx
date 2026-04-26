"use client"

import { useState, useEffect, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StudioSidebar } from "./studio-sidebar";
import { ActionsSidebar } from "./actions-sidebar";
import { MoodCanvas } from "./mood-canvas";
import { CustomCursor } from "../effects/custom-cursor";
import { MouseTrails } from "../effects/mouse-trails";
import { MoodBlock, Room } from "@/types/database";
import { useCanvasManager } from "@/hooks/use-canvas-manager";
import { updateMoodBlocksZIndex, addMoodBlock, updateProfile } from "@/actions/profile";
import { cn } from "@/lib/utils";
import { I18nProvider } from "@/i18n/context";
import { CanvasInteractionProvider, useCanvasInteraction } from "./canvas-interaction-context";
import { AudioProvider } from "./audio-context";
import { LyricsProvider } from "./lyrics-context";
import { FullscreenDoodleOverlay } from "./fullscreen-doodle-overlay";
import { GlobalLyricsOverlay } from "./GlobalLyricsOverlay";

interface StudioClientLayoutProps {
    profile: Room; // Agora usamos o tipo Room
    moodBlocks: MoodBlock[];
    username: string;
    name: string | null;
    publishedAt?: string | null;
    hasUnpublishedChanges?: boolean;
    isAdmin?: boolean;
    systemFlags?: Record<string, boolean>;
    allRooms?: any[]; // Lista para o switcher
    userAvatar?: string | null;
}

export interface PreviewData {
    blocks: MoodBlock[];
    profile: Room;
}

export function StudioClientLayout({ 
    profile, 
    moodBlocks, 
    username, 
    name, 
    publishedAt, 
    hasUnpublishedChanges, 
    isAdmin, 
    systemFlags,
    allRooms,
    userAvatar
}: StudioClientLayoutProps) {
    return (
        <I18nProvider>
            <AudioProvider>
                <LyricsProvider>
                    <CanvasInteractionProvider>
                        <StudioClientLayoutInner 
                            key={profile.id}
                            profile={profile} 
                            moodBlocks={moodBlocks} 
                            username={username} 
                            name={name} 
                            publishedAt={publishedAt} 
                            hasUnpublishedChanges={hasUnpublishedChanges} 
                            isAdmin={isAdmin} 
                            systemFlags={systemFlags}
                            allRooms={allRooms}
                            userAvatar={userAvatar}
                        />
                    </CanvasInteractionProvider>
                </LyricsProvider>
            </AudioProvider>
        </I18nProvider>
    )
}

function StudioClientLayoutInner({ 
    profile, 
    moodBlocks, 
    username, 
    name, 
    publishedAt, 
    hasUnpublishedChanges, 
    isAdmin, 
    systemFlags,
    allRooms,
    userAvatar
}: StudioClientLayoutProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    const [localProfile, setLocalProfile] = useState(profile);
    const [isProfilePending, startProfileTransition] = useTransition();
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const { isDrawingMode } = useCanvasInteraction();

    const {
        blocks, setBlocks, updateBlock, updateBlocks, removeBlocks,
        isSaving, undo, redo, canUndo, canRedo,
        selectedIds, setSelectedIds, alignSelected, distributeSelected,
        groupSelected, ungroupSelected,
        maxZ, bringToFront, sendToBack, bringForward, sendBackward,
        forceReset
    } = useCanvasManager(moodBlocks);

    const handleAddNewBlock = useCallback(async (type: string, content: any, shouldSelect = true) => {
        try {
            const actualShouldSelect = type === 'gif' ? false : shouldSelect;
            let options: any = { x: Math.random() * 20 + 40, y: Math.random() * 20 + 40, width: 200, height: 200, roomId: localProfile.id };
            
            if (type === 'gif' || type === 'photo') {
                options = { ...options, width: 250, height: 250 };
            } else if (type === 'text' || type === 'quote') {
                options = { ...options, width: 300, height: 120 };
            }

            const res = await addMoodBlock(type, content, options);
            
            if (res.success && res.block) {
                setBlocks(prev => [...prev, res.block]);
                if (actualShouldSelect) {
                    setSelectedIds([res.block.id]);
                }
            }
        } catch (error) {
            console.error("Failed to add block:", error);
        }
    }, [localProfile.id, setBlocks, setSelectedIds]);

    const normalizeZIndexes = useCallback(async () => {
        const sorted = [...blocks].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        const updates: { id: string, zIndex: number }[] = []
        const idToZ = new Map(sorted.map((b, i) => [b.id, i + 10]))

        const newBlocks = blocks.map(block => {
            const targetZ = idToZ.get(block.id) || 10
            if (block.zIndex !== targetZ) {
                updates.push({ id: block.id, zIndex: targetZ })
                return { ...block, zIndex: targetZ }
            }
            return block
        })

        if (updates.length === 0) return
        setBlocks(newBlocks)
        try {
            await updateMoodBlocksZIndex(updates)
        } catch (error) {
            console.error("Batch z-index sync failed", error)
        }
    }, [blocks, setBlocks])

    useEffect(() => {
        const mql = window.matchMedia('(max-width: 767px)');
        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            const mobile = e.matches;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
                setIsRightSidebarOpen(false);
            }
        };
        handleChange(mql);
        mql.addEventListener('change', handleChange);
        return () => mql.removeEventListener('change', handleChange);
    }, []);

    const handleMobileClose = useCallback(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
            setIsRightSidebarOpen(false);
        }
    }, [isMobile]);

    useEffect(() => {
        setLocalProfile(profile);
    }, [profile]);

    const handleUpdateProfile = useCallback((data: any) => {
        setLocalProfile((prev: any) => ({ ...prev, ...data }));
        startProfileTransition(async () => {
            await updateProfile(data, localProfile.id); // Passando o ID da sala
        });
    }, [localProfile.id]);

    const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id));

    return (
        <main 
            className={cn(
                "flex-1 relative overflow-hidden flex flex-col focus:outline-none",
                localProfile.theme === 'dark' ? 'dark bg-zinc-950' : 'light bg-white'
            )}
        >
            <CustomCursor type={localProfile.customCursor || 'auto'} />
            <MouseTrails type={localProfile.mouseTrails || 'none'} />

            <div className="absolute inset-0 z-0">
                <MoodCanvas
                    blocks={previewData ? previewData.blocks : blocks}
                    profile={previewData ? previewData.profile : localProfile}
                    backgroundEffect={previewData ? (previewData.profile.backgroundEffect || 'none') : (localProfile.backgroundEffect || 'none')}
                    selectedIds={previewData ? [] : selectedIds}
                    setSelectedIds={setSelectedIds}
                    onUpdateBlock={updateBlock}
                    onUpdateBlocks={updateBlocks}
                    removeBlocks={removeBlocks}
                    undo={undo}
                    redo={redo}
                    alignSelected={alignSelected}
                    distributeSelected={distributeSelected}
                    onGroup={groupSelected}
                    onUngroup={ungroupSelected}
                    maxZ={maxZ}
                    bringToFront={bringToFront}
                    sendToBack={sendToBack}
                    bringForward={bringForward}
                    sendBackward={sendBackward}
                    isPreview={!!previewData}
                    onExitPreview={() => setPreviewData(null)}
                />
            </div>

            <AnimatePresence>
                {isDrawingMode && <FullscreenDoodleOverlay />}
            </AnimatePresence>

            {isMobile && (isSidebarOpen || isRightSidebarOpen) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm"
                    onClick={handleMobileClose}
                />
            )}

            <motion.div
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : -320,
                    opacity: isSidebarOpen ? 1 : 0
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="absolute top-0 left-0 bottom-0 z-20 pointer-events-none"
            >
                <div className={`h-full shadow-none relative ${isSidebarOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
                    <StudioSidebar
                        profile={localProfile as any}
                        username={username}
                        blocks={blocks}
                        selectedBlocks={selectedBlocks}
                        setSelectedIds={setSelectedIds}
                        onUpdateBlock={updateBlock}
                        onUpdateBlocks={updateBlocks}
                        removeBlocks={removeBlocks}
                        onAddBlock={handleAddNewBlock}
                        onGroup={groupSelected}
                        onUngroup={ungroupSelected}
                        onUpdateProfile={handleUpdateProfile}
                        systemFlags={systemFlags}
                        publishedAt={publishedAt}
                        onNormalize={normalizeZIndexes}
                    />

                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-32 flex items-center justify-center pointer-events-auto group z-50"
                    >
                        <div className="w-1 h-16 bg-zinc-950/20 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/5 group-hover:h-24 group-hover:w-1.5 transition-all duration-500 flex flex-col items-center justify-between py-2">
                            <div className="w-0.5 h-0.5 bg-zinc-400 opacity-20" />
                            <ChevronLeft className="w-2.5 h-2.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-0.5 h-0.5 bg-zinc-400 opacity-20" />
                        </div>
                    </button>
                </div>
            </motion.div>

            <AnimatePresence>
                {!isSidebarOpen && (
                    <motion.button
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        onClick={() => setIsSidebarOpen(true)}
                        className="absolute top-1/2 left-0 -translate-y-1/2 w-8 h-32 flex items-center justify-start z-30 group"
                    >
                        <div className="w-1 h-16 bg-zinc-950/20 dark:bg-white/5 backdrop-blur-md border border-r border-black/5 dark:border-white/5 group-hover:h-24 group-hover:w-1.5 transition-all duration-500 flex flex-col items-center justify-between py-2">
                            <div className="w-0.5 h-0.5 bg-zinc-400 opacity-20" />
                            <ChevronRight className="w-2.5 h-2.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-0.5 h-0.5 bg-zinc-400 opacity-20" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            <motion.div
                initial={false}
                animate={{
                    x: isRightSidebarOpen ? 0 : 320,
                    opacity: isRightSidebarOpen ? 1 : 0
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="absolute top-0 right-0 bottom-0 z-20 pointer-events-none"
            >
                <div className={`h-full shadow-none relative ${isRightSidebarOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
                    <ActionsSidebar 
                        username={username} 
                        name={name}
                        profile={localProfile as any} 
                        publishedAt={publishedAt} 
                        hasUnpublishedChanges={hasUnpublishedChanges} 
                        isAdmin={isAdmin} 
                        setPreviewData={setPreviewData as any}
                        isPreview={!!previewData}
                        allRooms={allRooms}
                        userAvatar={userAvatar}
                        onForceReset={forceReset}
                    />

                    <button
                        onClick={() => setIsRightSidebarOpen(false)}
                        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-32 flex items-center justify-center pointer-events-auto group z-50"
                    >
                        <div className="w-1 h-16 bg-zinc-950/20 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/5 group-hover:h-24 group-hover:w-1.5 transition-all duration-500 flex flex-col items-center justify-between py-2">
                            <div className="w-0.5 h-0.5 bg-zinc-400 opacity-20" />
                            <ChevronRight className="w-2.5 h-2.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-0.5 h-0.5 bg-zinc-400 opacity-20" />
                        </div>
                    </button>
                </div>
            </motion.div>

            <AnimatePresence>
                {!isRightSidebarOpen && (
                    <motion.button
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        onClick={() => setIsRightSidebarOpen(true)}
                        className="absolute top-1/2 right-0 -translate-y-1/2 w-8 h-32 flex items-center justify-end z-30 group"
                    >
                        <div className="w-1 h-16 bg-zinc-950/20 dark:bg-white/5 backdrop-blur-md border border-l border-black/5 dark:border-white/5 group-hover:h-24 group-hover:w-1.5 transition-all duration-500 flex flex-col items-center justify-between py-2">
                            <div className="w-0.5 h-0.5 bg-zinc-400 opacity-20" />
                            <ChevronLeft className="w-2.5 h-2.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-0.5 h-0.5 bg-zinc-400 opacity-20" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            <GlobalLyricsOverlay />
        </main>
    )
}
