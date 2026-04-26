"use client"

import { useState, useTransition, useEffect, memo } from "react"
import { History, ChevronLeft, RotateCcw, Loader2, Clock, CheckCircle2, Eye, EyeOff, Trash2, Plus } from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { getVersionHistory, rollbackToVersion, getVersionDetails, restoreToDraft, makeVersionActive, deleteVersion } from "@/actions/publish"
import { ConfirmModal } from "../ui/confirm-modal"
import { toast } from "sonner"
import { cn, getRelativeTime } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { PreviewData } from "./studio-client-layout"

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface VersionHistoryPanelProps {
    onRollbackComplete: () => void;
    setPreviewData: (data: PreviewData | null) => void;
    onClose: () => void;
    roomId: string; // Nova prop
}


interface VersionItemProps {
    version: any;
    idx: number;
    previewId: string | null;
    isPending: boolean;
    onPreview: (id: string) => void;
    onRollback: (id: string, type: 'full' | 'draft' | 'live' | 'delete') => void;
    t: any;
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

const VersionItem = memo(({ version, idx, previewId, isPending, onPreview, onRollback, t }: VersionItemProps) => {
    const v = version
    const isActivePreview = previewId === v.id

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx % 10) * 0.03 }}
            className={cn(
                "w-full px-5 py-4 rounded-2xl transition-all flex items-center justify-between group relative border",
                v.isActive 
                    ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20" 
                    : "bg-zinc-50 dark:bg-white/5 border-transparent text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-800",
                isActivePreview && !v.isActive && "ring-2 ring-blue-500/50 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800"
            )}
        >
            <div className="flex flex-col gap-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.15em] truncate",
                        v.isActive ? "text-white" : "text-zinc-900 dark:text-white",
                        isActivePreview && !v.isActive && "text-blue-600 dark:text-blue-400"
                    )}>
                        {v.label || `Build // ${v.id.substring(0, 6)}`}
                    </span>
                    {v.isActive && (
                        <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[7px] font-black uppercase tracking-widest">
                            Active
                        </span>
                    )}
                </div>
                <span className={cn(
                    "text-[8px] font-bold uppercase tracking-widest opacity-60",
                    v.isActive ? "text-white/80" : "text-zinc-500"
                )}>
                    {getRelativeTime(v.createdAt, t)}
                </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={(e) => { e.stopPropagation(); onPreview(v.id); }}
                    className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-xl transition-all",
                        isActivePreview 
                            ? (v.isActive ? "bg-white text-blue-600" : "bg-blue-600 text-white shadow-lg shadow-blue-600/30")
                            : "hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    )}
                    title="Visualizar Versão"
                >
                    {isActivePreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onRollback(v.id, 'draft'); }}
                    disabled={isPending}
                    className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-xl transition-all",
                        v.isActive ? "hover:bg-white/20 text-white/80 hover:text-white" : "hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    )}
                    title={t('publish.restore_to_editor')}
                >
                    <RotateCcw className="w-4 h-4" />
                </button>

                {!v.isActive && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRollback(v.id, 'live'); }}
                            disabled={isPending}
                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-all text-zinc-400 hover:text-blue-500"
                            title={t('publish.make_active')}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRollback(v.id, 'delete'); }}
                            disabled={isPending}
                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-zinc-400 hover:text-red-500"
                            title={t('publish.delete_version')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    )
})

VersionItem.displayName = "VersionItem"

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export function VersionHistoryPanel({ onRollbackComplete, setPreviewData, onClose, roomId }: VersionHistoryPanelProps) {

    const { t } = useTranslation()
    const router = useRouter()

    const [versions, setVersions] = useState<any[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [previewId, setPreviewId] = useState<string | null>(null)

    const [showRollbackModal, setShowRollbackModal] = useState(false)
    const [rollbackTargetId, setRollbackTargetId] = useState<string | null>(null)
    const [rollbackType, setRollbackType] = useState<'full' | 'draft' | 'live' | 'delete'>('full')
    const [isPending, startTransition] = useTransition()

    const loadHistory = async (pageToLoad: number = 1, append: boolean = false) => {
        if (append) setLoadingMore(true)
        else setLoadingHistory(true)

        try {
            const result = await getVersionHistory(pageToLoad, 10, roomId)

            if (result.error) {
                toast.error(result.error)
            } else if (result.versions) {
                if (append) {
                    setVersions(prev => [...prev, ...result.versions])
                } else {
                    setVersions(result.versions)
                }
                setHasMore(result.hasMore || false)
                setPage(pageToLoad)
            }
        } catch (error) {
            console.error('[loadHistory]', error)
            toast.error(t('publish.history_error'))
        } finally {
            setLoadingHistory(false)
            setLoadingMore(false)
        }
    }

    useEffect(() => {
        loadHistory(1)
        return () => {
            setPreviewId(null)
            setPreviewData(null)
        }
    }, [])

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            loadHistory(page + 1, true)
        }
    }

    const handleRollback = (versionId: string, type: 'full' | 'draft' | 'live' | 'delete' = 'full') => {
        setRollbackTargetId(versionId)
        setRollbackType(type)
        setShowRollbackModal(true)
    }

    const handlePreview = async (versionId: string) => {
        if (previewId === versionId) {
            setPreviewId(null)
            setPreviewData(null)
            return
        }

        const loadingToast = toast.loading("Carregando visualização...")
        try {
            const result = await getVersionDetails(versionId)
            if (result.error || !result.blocks || !result.profile) {
                toast.error(result.error || "Erro ao carregar detalhes")
            } else {
                setPreviewId(versionId)
                setPreviewData({
                    blocks: result.blocks,
                    profile: result.profile
                })
            }
        } catch (error) {
            console.error('[handlePreview]', error)
            toast.error("Erro ao carregar visualização")
        } finally {
            toast.dismiss(loadingToast)
        }
    }

    const confirmRollback = () => {
        if (!rollbackTargetId) return
        startTransition(async () => {
            let result;
            if (rollbackType === 'draft') {
                result = await restoreToDraft(rollbackTargetId)
            } else if (rollbackType === 'live') {
                result = await makeVersionActive(rollbackTargetId)
            } else if (rollbackType === 'delete') {
                result = await deleteVersion(rollbackTargetId)
            } else {
                result = await rollbackToVersion(rollbackTargetId)
            }

            if (result && 'error' in result) {
                toast.error(result.error as string)
            } else {
                const successMsg = rollbackType === 'delete' 
                    ? t('publish.delete_success') 
                    : (rollbackType === 'draft' ? t('publish.restore_success') : t('publish.rollback_success'))
                
                toast.success(successMsg)
                setPreviewId(null)
                setPreviewData(null)
                loadHistory(1, false) // Recarrega do início
                onRollbackComplete()
                router.refresh()
            }
            setShowRollbackModal(false)
            setRollbackTargetId(null)
        })
    }

    const modalContent = {
        title: rollbackType === 'draft' ? t('publish.restore_confirm_title') : 
               rollbackType === 'delete' ? t('publish.delete_confirm_title') :
               t('publish.rollback_confirm_title'),
        message: rollbackType === 'draft' ? t('publish.restore_confirm_message') : 
                 rollbackType === 'delete' ? t('publish.delete_confirm_message') :
                 t('publish.rollback_confirm_message'),
        confirm: rollbackType === 'draft' ? t('publish.restore_to_editor') : 
                 rollbackType === 'delete' ? t('publish.delete_version') :
                 t('publish.rollback')
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 shrink-0">
                <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:scale-105 transition-transform"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
                        {t('publish.version_history')}
                    </h2>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                        Gerencie seus estados anteriores
                    </p>
                </div>
            </div>

            {/* List Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {loadingHistory ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <div className="absolute inset-0 blur-lg bg-blue-500/20 animate-pulse" />
                        </div>
                        <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-black">
                            {t('publish.loading_history')}
                        </p>
                    </div>
                ) : versions.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
                        <Clock className="w-8 h-8 text-zinc-400" />
                        <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-black">
                            {t('publish.no_versions')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 pb-8">
                        {versions.map((v, idx) => (
                            <VersionItem 
                                key={v.id}
                                version={v}
                                idx={idx}
                                previewId={previewId}
                                isPending={isPending}
                                onPreview={handlePreview}
                                onRollback={handleRollback}
                                t={t}
                            />
                        ))}

                        {hasMore && (
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="w-full py-4 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-200 dark:hover:border-zinc-700 transition-all flex items-center justify-center gap-2 group mt-4"
                            >
                                {loadingMore ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Carregar Mais</span>
                                    </>
                                )}
                            </button>
                        )}

                        {!hasMore && versions.length > 0 && (
                            <p className="text-[8px] text-zinc-300 dark:text-zinc-600 text-center uppercase font-bold tracking-widest py-8">
                                Você chegou ao fim do histórico
                            </p>
                        )}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showRollbackModal}
                onClose={() => { setShowRollbackModal(false); setRollbackTargetId(null); }}
                onConfirm={confirmRollback}
                title={modalContent.title}
                message={modalContent.message}
                confirmText={modalContent.confirm}
                cancelText={t('common.cancel')}
                type={rollbackType === 'draft' ? "info" : "danger"}
                isLoading={isPending}
            />
        </div>
    )
}
