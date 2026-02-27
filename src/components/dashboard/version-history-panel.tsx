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
                className="w-full h-11 px-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-800 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 group relative"
            >
                {/* HUD markings */}
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black dark:border-white opacity-20 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-3">
                    <Activity className="w-2.5 h-2.5 opacity-30" />
                    <span className="text-[7.5px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {t('publish.version_history')}
                    </span>
                </div>
                <ChevronDown className={cn(
                    "w-3 h-3 transition-transform duration-300 opacity-20 group-hover:opacity-100",
                    showHistory && "rotate-180"
                )} />
            </button>

            {showHistory && (
                <div className="bg-zinc-100 dark:bg-zinc-900 gap-[1px] grid border-x border-b border-zinc-200 dark:border-zinc-800 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
                    {loadingHistory ? (
                        <div className="p-6 bg-white dark:bg-zinc-950 text-center">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto text-zinc-400 mb-3" />
                            <p className="text-[7px] text-zinc-400 uppercase tracking-[0.4em]">{t('publish.loading_history')}</p>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="p-6 bg-white dark:bg-zinc-950 text-center">
                            <p className="text-[7px] text-zinc-400 uppercase tracking-[0.4em]">{t('publish.no_versions')}</p>
                        </div>
                    ) : (
                        versions.map((v) => (
                            <div key={v.id} className="flex items-center justify-between px-4 py-4 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group relative">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-wider">{v.label || 'V.00'}</span>
                                        <span className="text-[6px] font-mono text-zinc-400 uppercase tracking-tighter">
                                            {getRelativeTime(v.createdAt)}
                                        </span>
                                    </div>
                                    {v.isActive && (
                                        <div className="px-1.5 py-0.5 border border-emerald-500/20 bg-emerald-500/5">
                                            <span className="text-[6px] font-black uppercase tracking-widest text-emerald-500">
                                                {t('publish.active_label')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {!v.isActive && (
                                    <button
                                        onClick={() => handleRollback(v.id)}
                                        disabled={isPending}
                                        className="flex items-center gap-2 px-3 py-1.5 border border-zinc-100 dark:border-zinc-800 hover:border-black dark:hover:border-white text-[7px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-all disabled:opacity-30 relative"
                                    >
                                        <RotateCcw className="w-2.5 h-2.5" />
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
