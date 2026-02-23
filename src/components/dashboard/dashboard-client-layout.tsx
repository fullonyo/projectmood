"use client"

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { ActionsSidebar } from "./actions-sidebar";
import { MoodCanvas } from "./mood-canvas";
import { CustomCursor } from "../effects/custom-cursor";
import { MouseTrails } from "../effects/mouse-trails";
import { MoodBlock, Profile } from "@/types/database";
import { useCanvasManager } from "@/hooks/use-canvas-manager";
import { updateMoodBlocksZIndex } from "@/actions/profile";
import { CanvasInteractionProvider, useCanvasInteraction } from "./canvas-interaction-context";
import { FullscreenDoodleOverlay } from "./fullscreen-doodle-overlay";

interface DashboardClientLayoutProps {
    profile: Profile;
    moodBlocks: MoodBlock[];
    username: string;
    publishedAt?: string | null;
    hasUnpublishedChanges?: boolean;
    isAdmin?: boolean;
    systemFlags?: Record<string, boolean>;
}

export function DashboardClientLayout({ profile, moodBlocks, username, publishedAt, hasUnpublishedChanges, isAdmin, systemFlags }: DashboardClientLayoutProps) {
    return (
        <CanvasInteractionProvider>
            <DashboardClientLayoutInner profile={profile} moodBlocks={moodBlocks} username={username} publishedAt={publishedAt} hasUnpublishedChanges={hasUnpublishedChanges} isAdmin={isAdmin} systemFlags={systemFlags} />
        </CanvasInteractionProvider>
    )
}

function DashboardClientLayoutInner({ profile, moodBlocks, username, publishedAt, hasUnpublishedChanges, isAdmin, systemFlags }: DashboardClientLayoutProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [localProfile, setLocalProfile] = useState(profile);
    const { isDrawingMode } = useCanvasInteraction();

    // 🧠 CENTRAL CORTEX: Sovereign management of blocks and persistence
    const { blocks, setBlocks, updateBlock, updateBlocks, removeBlocks, isSaving, undo, redo, canUndo, canRedo } = useCanvasManager(moodBlocks);

    const normalizeZIndexes = useCallback(async () => {
        const sorted = [...blocks].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        const updates: { id: string, zIndex: number }[] = []

        const newBlocks = blocks.map(block => {
            const index = sorted.findIndex(b => b.id === block.id)
            const targetZ = index + 10
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


    // 📱 Mobile detection: auto-hide sidebars on small screens
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

    // Close sidebars when selecting a canvas item on mobile
    const handleMobileClose = useCallback(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
            setIsRightSidebarOpen(false);
        }
    }, [isMobile]);

    useEffect(() => {
        setLocalProfile(profile);
    }, [profile]);

    const handleUpdateLocalProfile = (data: any) => {
        setLocalProfile((prev: any) => ({ ...prev, ...data }));
    };

    const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id));

    return (
        <main className="flex-1 relative overflow-hidden flex flex-col focus:outline-none">
            <CustomCursor type={localProfile.customCursor || 'auto'} />
            <MouseTrails type={localProfile.mouseTrails || 'none'} />

            {/* Fullscreen Canvas as Base Layer (layer 0) */}
            <div className="absolute inset-0 z-0">
                <MoodCanvas
                    blocks={blocks}
                    profile={localProfile}
                    backgroundEffect={localProfile.backgroundEffect || 'none'}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    onUpdateBlock={updateBlock}
                    onUpdateBlocks={updateBlocks}
                    removeBlocks={removeBlocks}
                    undo={undo}
                    redo={redo}
                />

            </div>

            {/* Drawing Layer (z-index between Canvas and Sidebars) */}
            <AnimatePresence>
                {isDrawingMode && <FullscreenDoodleOverlay />}
            </AnimatePresence>

            {/* Mobile Backdrop — closes sidebars on tap */}
            {isMobile && (isSidebarOpen || isRightSidebarOpen) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm"
                    onClick={handleMobileClose}
                />
            )}

            {/* Floating Sidebar Container (layer 20) */}
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
                    <DashboardSidebar
                        profile={localProfile}
                        blocks={blocks}
                        selectedBlocks={selectedBlocks}
                        setSelectedIds={setSelectedIds}
                        onUpdateBlock={updateBlock}
                        removeBlocks={removeBlocks}
                        onUpdateProfile={handleUpdateLocalProfile}
                        systemFlags={systemFlags}
                        onNormalize={normalizeZIndexes}
                    />


                    {/* Inner Collapse Button */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-white dark:bg-zinc-950 border border-black dark:border-white rounded-none flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors pointer-events-auto shadow-none group"
                    >
                        <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </button>
                </div>
            </motion.div>

            {/* Floating Expand Button (Visible when sidebar is closed) */}
            {!isSidebarOpen && (
                <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-none border border-black dark:border-white flex items-center justify-center shadow-none z-30 hover:scale-110 transition-transform"
                >
                    <Menu className="w-5 h-5" />
                </motion.button>
            )}

            {/* Floating Actions Sidebar Container (Right Side - layer 20) */}
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
                    <ActionsSidebar username={username} profile={localProfile} publishedAt={publishedAt} hasUnpublishedChanges={hasUnpublishedChanges} isAdmin={isAdmin} />

                    {/* Inner Collapse Button */}
                    <button
                        onClick={() => setIsRightSidebarOpen(false)}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-white dark:bg-zinc-950 border border-black dark:border-white rounded-none flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors pointer-events-auto shadow-none group"
                    >
                        <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </button>
                </div>
            </motion.div>

            {/* Floating Expand Button Right (Visible when right sidebar is closed) */}
            {!isRightSidebarOpen && (
                <motion.button
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={() => setIsRightSidebarOpen(true)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-none border border-black dark:border-white flex items-center justify-center shadow-none z-30 hover:scale-110 transition-transform"
                >
                    <Menu className="w-5 h-5" />
                </motion.button>
            )}
        </main>
    )
}
