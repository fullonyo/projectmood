"use client"

import { useState, useTransition } from "react"
import { History, ChevronDown, RotateCcw, Loader2, Activity } from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { getVersionHistory, rollbackToVersion } from "@/actions/publish"
import { ConfirmModal } from "../ui/confirm-modal"
import { toast } from "sonner"
import { cn, getRelativeTime } from "@/lib/utils"
import { useRouter } from "next/navigation"

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
        <>
            <button
                onClick={handleToggleHistory}
                className={cn(
                    "w-full h-12 px-5 flex items-center justify-between transition-all rounded-2xl border group relative overflow-hidden",
                    showHistory 
                        ? "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 text-blue-600 shadow-sm" 
                        : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm"
                )}
            >
                <div className="flex items-center gap-3">
                    <History className={cn("w-4 h-4 transition-transform", showHistory && "scale-110")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        {t('publish.version_history')}
                    </span>
                </div>
                <ChevronDown className={cn(
                    "w-3.5 h-3.5 transition-transform duration-300 opacity-40",
                    showHistory && "rotate-180 opacity-100"
                )} />
            </button>

            {showHistory && (
                <div className="mt-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-zinc-50 dark:divide-zinc-800/50 max-h-64 overflow-y-auto custom-scrollbar">
                    {loadingHistory ? (
                        <div className="p-8 text-center">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500 mb-3" />
                            <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">{t('publish.loading_history')}</p>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">{t('publish.no_versions')}</p>
                        </div>
                    ) : (
                        versions.map((v) => (
                            <div key={v.id} className="flex items-center justify-between px-6 py-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-blue-500 transition-colors" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">{v.label || 'V.01'}</span>
                                        <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-tight">
                                            {getRelativeTime(v.createdAt)}
                                        </span>
                                    </div>
                                    {v.isActive && (
                                        <div className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                                {t('publish.active_label')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {!v.isActive && (
                                    <button
                                        onClick={() => handleRollback(v.id)}
                                        disabled={isPending}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 border border-zinc-100 dark:border-zinc-700 hover:border-blue-600 shadow-sm"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        {t('publish.rollback')}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

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
        </>
    )
}
