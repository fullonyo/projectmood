"use client"

import { useState, useTransition } from "react"
import { History, ChevronDown, RotateCcw, Loader2, Activity, Clock, CheckCircle2 } from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { getVersionHistory, rollbackToVersion } from "@/actions/publish"
import { ConfirmModal } from "../ui/confirm-modal"
import { toast } from "sonner"
import { cn, getRelativeTime } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface VersionHistoryPanelProps {
    onRollbackComplete: () => void;
}

export function VersionHistoryPanel({ onRollbackComplete }: VersionHistoryPanelProps) {
    const { t } = useTranslation()
    const router = useRouter()

    const [showHistory, setShowHistory] = useState(false)
    const [versions, setVersions] = useState<any[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    const [showRollbackModal, setShowRollbackModal] = useState(false)
    const [rollbackTargetId, setRollbackTargetId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const loadHistory = async () => {
        setLoadingHistory(true)
        try {
            const result = await getVersionHistory()
            if (result.error) {
                toast.error(result.error)
            } else if (result.versions) {
                setVersions(result.versions)
            }
        } catch (error) {
            console.error('[loadHistory]', error)
            toast.error(t('publish.history_error'))
        } finally {
            setLoadingHistory(false)
        }
    }

    const handleToggleHistory = () => {
        if (!showHistory) loadHistory()
        setShowHistory(!showHistory)
    }

    const handleRollback = (versionId: string) => {
        setRollbackTargetId(versionId)
        setShowRollbackModal(true)
    }

    const confirmRollback = () => {
        if (!rollbackTargetId) return
        startTransition(async () => {
            const result = await rollbackToVersion(rollbackTargetId)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(t('publish.rollback_success'))
                loadHistory()
                onRollbackComplete()
                router.refresh()
            }
            setShowRollbackModal(false)
            setRollbackTargetId(null)
        })
    }

    return (
        <div className="space-y-3">
            <button
                onClick={handleToggleHistory}
                className={cn(
                    "w-full h-12 px-6 flex items-center justify-between transition-all rounded-2xl group",
                    showHistory 
                        ? "bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white" 
                        : "bg-transparent text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                        showHistory ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-zinc-100 dark:bg-zinc-800"
                    )}>
                        <History className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        {t('publish.version_history')}
                    </span>
                </div>
                <ChevronDown className={cn(
                    "w-3.5 h-3.5 transition-transform duration-500",
                    showHistory && "rotate-180"
                )} />
            </button>

            <AnimatePresence>
                {showHistory && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-1 pr-1 max-h-80 overflow-y-auto custom-scrollbar">
                            {loadingHistory ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-black">{t('publish.loading_history')}</p>
                                </div>
                            ) : versions.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-40">
                                    <Clock className="w-5 h-5 text-zinc-400" />
                                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-black">{t('publish.no_versions')}</p>
                                </div>
                            ) : (
                                versions.map((v) => (
                                    <div 
                                        key={v.id} 
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl transition-all flex items-center justify-between group relative",
                                            v.isActive 
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                                                : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-[0.2em] truncate",
                                                v.isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white"
                                            )}>
                                                {v.label || `Build // ${v.id.substring(0, 4)}`}
                                            </span>
                                            <span className={cn(
                                                "text-[8px] font-bold uppercase tracking-widest opacity-60",
                                                v.isActive ? "text-white/80" : "text-zinc-400"
                                            )}>
                                                {getRelativeTime(v.createdAt, t)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {!v.isActive && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRollback(v.id)
                                                    }}
                                                    disabled={isPending}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                                                    title={t('publish.rollback')}
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            {v.isActive && (
                                                <motion.div 
                                                    layoutId="history-active-dot" 
                                                    className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={showRollbackModal}
                onClose={() => { setShowRollbackModal(false); setRollbackTargetId(null); }}
                onConfirm={confirmRollback}
                title={t('publish.rollback_confirm_title')}
                message={t('publish.rollback_confirm_message')}
                confirmText={t('publish.rollback')}
                cancelText={t('common.cancel')}
                type="danger"
                isLoading={isPending}
            />
        </div>
    )
}
