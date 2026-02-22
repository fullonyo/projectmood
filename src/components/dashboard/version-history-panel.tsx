"use client"

import { useState, useTransition } from "react"
import { History, ChevronDown, RotateCcw, Loader2 } from "lucide-react"
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
                className="w-full flex items-center justify-between h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black dark:hover:text-white border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
            >
                <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5" />
                    {t('publish.version_history')}
                </div>
                <ChevronDown className={cn(
                    "w-3 h-3 transition-transform duration-300",
                    showHistory && "rotate-180"
                )} />
            </button>

            {showHistory && (
                <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-900 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
                    {loadingHistory ? (
                        <div className="p-4 text-center">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto text-zinc-400" />
                            <p className="text-[8px] text-zinc-400 mt-2 uppercase tracking-widest">{t('publish.loading_history')}</p>
                        </div>
                    ) : versions.length === 0 ? (
                        <p className="p-4 text-[8px] text-zinc-400 text-center uppercase tracking-widest">{t('publish.no_versions')}</p>
                    ) : (
                        versions.map((v) => (
                            <div key={v.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black uppercase tracking-wider">{v.label || 'v?'}</span>
                                    <span className="text-[7px] font-mono text-zinc-400">
                                        {getRelativeTime(v.createdAt)}
                                    </span>
                                    {v.isActive && (
                                        <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                                            <span className="w-1 h-1 bg-emerald-400 rounded-full inline-block" />
                                            {t('publish.active_label')}
                                        </span>
                                    )}
                                </div>
                                {!v.isActive && (
                                    <button
                                        onClick={() => handleRollback(v.id)}
                                        disabled={isPending}
                                        className="flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-30"
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
