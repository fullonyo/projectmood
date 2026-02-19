"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { ActionsSidebar } from "./actions-sidebar";
import { MoodCanvas } from "./mood-canvas";
import { CustomCursor } from "../effects/custom-cursor";
import { MouseTrails } from "../effects/mouse-trails";
import { BackgroundEffect } from "../effects/background-effect";
import { FontLoader } from "./font-loader";

interface DashboardClientLayoutProps {
    profile: any;
    moodBlocks: any[];
    username: string;
}

export function DashboardClientLayout({ profile, moodBlocks, username }: DashboardClientLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [localBlocks, setLocalBlocks] = useState(moodBlocks);
    const [localProfile, setLocalProfile] = useState(profile);

    // Sync with server data (Smart Merge Strategy)
    useEffect(() => {
        setLocalBlocks(prevLocalBlocks => {
            const now = Date.now();
            const localMap = new Map(prevLocalBlocks.map(b => [b.id, b]));

            // Se o servidor trouxe novos blocos, vamos mesclar
            const mergedBlocks = moodBlocks.map(serverBlock => {
                const localBlock = localMap.get(serverBlock.id);

                // Se não temos localmente (novo do servidor), aceitamos
                if (!localBlock) return serverBlock;

                // Verificamos se houve edição local recente (Soberania Local - 5s)
                const lastEdit = (localBlock as any)._localUpdatedAt || 0;
                const isRecentlyEdited = (now - lastEdit) < 5000;

                if (isRecentlyEdited) {
                    // Mantemos a versão local para evitar "pulo" visual
                    return localBlock;
                }

                // Se não foi editado recentemente, aceitamos a verdade do servidor (Sync)
                // Mas preservamos o _localUpdatedAt para não perder referência num ciclo rápido
                return {
                    ...serverBlock,
                    _localUpdatedAt: lastEdit
                };
            });

            // Precisamos garantir que blocos criados otimistamente (ainda não no servidor) não sumam?
            // A lógica anterior substituía tudo: setLocalBlocks(moodBlocks).
            // Isso significava que criações otimistas dependiam de revalidate rápido ou eram adicionadas ao array moodBlocks antes.
            // Vamos manter o comportamento de "fonte da verdade é o servidor" para adição/remoção,
            // focando o Smart Merge apenas na ATUALIZAÇÃO de propriedades.

            return mergedBlocks;
        });
    }, [moodBlocks]);

    useEffect(() => {
        setLocalProfile(profile);
    }, [profile]);

    const handleUpdateLocalBlock = (id: string, updates: any) => {
        setLocalBlocks(prev => prev.map(block => {
            if (block.id !== id) return block;

            // Injeta timestamp de modificação local para o Smart Merge
            const updatedBlock = {
                ...block,
                ...updates,
                _localUpdatedAt: Date.now()
            };

            // Se updates contém 'content', fazemos merge profundo do content
            if (updates.content) {
                updatedBlock.content = { ...((block.content as any) || {}), ...updates.content };
            }

            return updatedBlock;
        }));
    };

    const handleUpdateLocalProfile = (data: any) => {
        setLocalProfile((prev: any) => ({ ...prev, ...data }));
    };

    const selectedBlock = localBlocks.find(b => b.id === selectedId);

    return (
        <main className="flex-1 relative overflow-hidden flex flex-col focus:outline-none">
            <FontLoader fontFamily={localProfile.customFont} />
            <CustomCursor type={localProfile.customCursor || 'auto'} />
            <MouseTrails type={localProfile.mouseTrails || 'none'} />

            {/* Fullscreen Canvas as Base Layer (layer 0) */}
            <div className="absolute inset-0 z-0">
                <MoodCanvas
                    blocks={localBlocks}
                    profile={localProfile}
                    backgroundEffect={localProfile.backgroundEffect || 'none'}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    onUpdateBlock={handleUpdateLocalBlock}
                />
            </div>

            {/* Floating Sidebar Container (layer 20) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: -320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -320, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                        className="absolute top-0 left-0 bottom-0 z-20 pointer-events-none"
                    >
                        <div className="pointer-events-auto h-full shadow-2xl relative">
                            <DashboardSidebar
                                profile={localProfile}
                                selectedBlock={selectedBlock}
                                setSelectedId={setSelectedId}
                                onUpdateBlock={handleUpdateLocalBlock}
                                onUpdateProfile={handleUpdateLocalProfile}
                            />

                            {/* Inner Collapse Button */}
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-r-xl flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors pointer-events-auto shadow-md group"
                            >
                                <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Expand Button (Visible when sidebar is closed) */}
            {!isSidebarOpen && (
                <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-2xl z-30 hover:scale-110 transition-transform"
                >
                    <Menu className="w-5 h-5" />
                </motion.button>
            )}

            {/* Floating Actions Sidebar Container (Right Side - layer 20) */}
            <AnimatePresence>
                {isRightSidebarOpen && (
                    <motion.div
                        initial={{ x: 320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 320, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                        className="absolute top-0 right-0 bottom-0 z-20 pointer-events-none"
                    >
                        <div className="pointer-events-auto h-full shadow-2xl relative">
                            <ActionsSidebar username={username} profile={localProfile} />

                            {/* Inner Collapse Button */}
                            <button
                                onClick={() => setIsRightSidebarOpen(false)}
                                className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-l-xl flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors pointer-events-auto shadow-md group"
                            >
                                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Expand Button Right (Visible when right sidebar is closed) */}
            {!isRightSidebarOpen && (
                <motion.button
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={() => setIsRightSidebarOpen(true)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-2xl z-30 hover:scale-110 transition-transform"
                >
                    <Menu className="w-5 h-5" />
                </motion.button>
            )}
        </main>
    )
}
