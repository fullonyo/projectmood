"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Menu } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { MoodCanvas } from "./mood-canvas";

interface DashboardClientLayoutProps {
    profile: any;
    moodBlocks: any[];
}

export function DashboardClientLayout({ profile, moodBlocks }: DashboardClientLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <main className="flex-1 relative overflow-hidden flex flex-col">
            {/* Fullscreen Canvas as Base Layer (layer 0) */}
            <div className="absolute inset-0 z-0">
                <MoodCanvas blocks={moodBlocks} profile={profile} />
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
                            <DashboardSidebar profile={profile} />

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
        </main>
    )
}
