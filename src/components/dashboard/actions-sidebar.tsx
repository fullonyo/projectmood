"use client"

import { LogOut, ExternalLink, User, Settings, Camera, Loader2, Upload, Clock, History, ChevronDown, RotateCcw, Sparkles, Activity, Volume2, VolumeX } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { ShareProfileButton } from "./share-profile-button"
import { ConfirmModal } from "../ui/confirm-modal"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useState, useRef, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateProfile } from "@/actions/profile"
import { publishProfile } from "@/actions/publish"
import imageCompression from 'browser-image-compression'
import { useTranslation } from "@/i18n/context"
import { LanguageSwitcher } from "./language-switcher"
import { useAudio } from "./audio-context"
import { toast } from "sonner"
import { getRelativeTime } from "@/lib/utils"
import { VersionHistoryPanel } from "./version-history-panel"
import { EditorHeader, EditorSection, EditorSlider } from "./EditorUI"

import { Profile } from "@/types/database"
import { UniversalIdentityEditor } from "./UniversalIdentityEditor"

interface ActionsSidebarProps {
    username: string
    name: string | null
    profile: Profile
    publishedAt?: Date | string | null
    hasUnpublishedChanges?: boolean
    isAdmin?: boolean
}

export function ActionsSidebar({ username: initialUsername, name: initialName, profile, publishedAt, hasUnpublishedChanges, isAdmin }: ActionsSidebarProps) {
    const { t } = useTranslation()
    const [isUploading, setIsUploading] = useState(false)
    const [showPublishModal, setShowPublishModal] = useState(false)
    const [activeTab, setActiveTab] = useState<'main' | 'identity'>('main')
    const [isPending, startTransition] = useTransition()
    
    // Estados locais para feedback instantâneo após edição
    const [currentName, setCurrentName] = useState(initialName)
    const [currentUsername, setCurrentUsername] = useState(initialUsername)

    // Sincroniza estado local com props do servidor (importante após router.refresh)
    useEffect(() => {
        setCurrentName(initialName)
        setCurrentUsername(initialUsername)
    }, [initialName, initialUsername])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const { isGlobalMuted, toggleGlobalMute, globalVolume, setGlobalVolume } = useAudio()
    const router = useRouter()

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 400,
                useWebWorker: true
            }

            const compressedFile = await imageCompression(file, options)
            const reader = new FileReader()

            reader.onload = async () => {
                const base64 = reader.result as string
                await updateProfile({ avatarUrl: base64 })
                setIsUploading(false)
            }
            reader.readAsDataURL(compressedFile)
        } catch (error) {
            console.error("Erro no upload do avatar:", error)
            setIsUploading(false)
        }
    }

    const handlePublish = () => {
        startTransition(async () => {
            const result = await publishProfile()
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(t('publish.success'))
                router.refresh()
            }
            setShowPublishModal(false)
        })
    }

    const avatarSrc = profile.avatarUrl || `https://avatar.vercel.sh/${currentUsername}`
    const isDraft = hasUnpublishedChanges ?? !publishedAt

    return (
        <aside className="relative w-80 h-full bg-white dark:bg-zinc-900 border-l border-zinc-100 dark:border-zinc-800 flex flex-col shadow-xl z-50 overflow-hidden">
            <AnimatePresence mode="wait">
                {activeTab === 'identity' ? (
                    <motion.div
                        key="identity-editor"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute inset-0 z-50 bg-white dark:bg-zinc-900 p-8"
                    >
                        <UniversalIdentityEditor 
                            currentName={currentName || ""}
                            currentUsername={currentUsername}
                            onClose={() => setActiveTab('main')}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="main-content"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="flex flex-col h-full overflow-hidden"
                    >

            <div className="absolute top-6 right-6 z-20">
                <LanguageSwitcher />
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
            />

            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="flex flex-col hover:opacity-70 transition-all active:scale-95">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 leading-none mb-1.5">MoodSpace Node</span>
                        <div className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white">
                            Studio Studio
                        </div>
                    </Link>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm relative group transition-all duration-500">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="relative">
                            <button
                                onClick={handleAvatarClick}
                                disabled={isUploading}
                                className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-md transition-all duration-500 group/avatar disabled:opacity-50 active:scale-90"
                            >
                                <img
                                    src={avatarSrc}
                                    alt={currentUsername}
                                    className="w-full h-full object-cover"
                                />
                                {isUploading ? (
                                    <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                        <Camera className="w-5 h-5 text-blue-600" />
                                    </div>
                                )}
                            </button>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 leading-none mb-1.5">{t('leftSidebar.identity_protocol')}</span>
                            <h4 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white truncate max-w-[140px]">
                                {currentName || currentUsername}
                            </h4>
                            <span className="text-[9px] font-medium text-blue-500/70 mt-1">studio://{currentUsername.toLowerCase()}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-zinc-50 dark:border-zinc-800/50">
                        <div className="flex flex-col">
                            <p className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest mb-1">{t('leftSidebar.access_level')}</p>
                            <p className="text-[10px] font-bold uppercase text-zinc-900 dark:text-zinc-300">{t('leftSidebar.studio_free')}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest mb-1">{t('leftSidebar.system_status')}</p>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    isDraft ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                )} />
                                <p className={cn(
                                    "text-[10px] font-bold uppercase tracking-wide",
                                    isDraft ? "text-amber-600" : "text-emerald-600"
                                )}>
                                    {isDraft ? t('publish.unpublished_changes') : t('publish.synced')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-6 custom-scrollbar space-y-10">
                <div className="space-y-6">
                    <EditorHeader 
                        title={t('leftSidebar.deployment_area')}
                    />

                    <div className="grid gap-4">
                        <Button
                            onClick={() => setShowPublishModal(true)}
                            disabled={isPending}
                            className="w-full justify-between h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-zinc-900 hover:bg-black dark:bg-white dark:text-black transition-all group shadow-lg shadow-zinc-200 dark:shadow-none border-none relative overflow-hidden px-6"
                        >
                            <div className="flex items-center gap-3">
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                                )}
                                {t('publish.button')}
                            </div>
                            <div className="flex items-center gap-3">
                                {publishedAt && (
                                    <span className="text-[8px] font-medium opacity-60 flex items-center gap-1">
                                        {getRelativeTime(publishedAt, t)}
                                    </span>
                                )}
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    isDraft ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                                )} />
                            </div>
                        </Button>

                        <div className="grid grid-cols-2 gap-3">
                            <Link href={`/${currentUsername}`} target="_blank" className="w-full">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-2xl text-[9px] font-bold uppercase tracking-widest bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                    {t('common.view')}
                                </Button>
                            </Link>
                            <ShareProfileButton username={currentUsername} />
                        </div>

                        {isAdmin && (
                            <Link href="/admin" className="w-full mt-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-between h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-red-50/30 text-red-600 hover:bg-red-50 dark:bg-red-950/10 dark:border-red-900/30 transition-all border-zinc-100 dark:border-zinc-800 shadow-sm px-6"
                                >
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                        {t('leftSidebar.command_center')}
                                    </div>
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                </Button>
                            </Link>
                        )}

                        <VersionHistoryPanel onRollbackComplete={() => router.refresh()} />
                    </div>
                </div>

                <div className="space-y-6">
                    <EditorHeader 
                        title={t('leftSidebar.system_ux')}
                    />
                    
                    <div className="space-y-8 px-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleGlobalMute}
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative group",
                                        isGlobalMuted
                                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                    )}
                                >
                                    {isGlobalMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    {!isGlobalMuted && (
                                        <motion.div 
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-zinc-900" 
                                        />
                                    )}
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white leading-none mb-1.5">
                                        {isGlobalMuted ? "Sistema Mutado" : "Áudio Master"}
                                    </span>
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest opacity-60">
                                        {isGlobalMuted ? "Sons desativados" : "Saída global ativa"}
                                    </span>
                                </div>
                            </div>
                            
                            {!isGlobalMuted && (
                                <span className="text-[11px] font-black tabular-nums text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg">
                                    {Math.round(globalVolume * 100)}%
                                </span>
                            )}
                        </div>

                        {!isGlobalMuted && (
                            <div className="pt-2">
                                <EditorSlider
                                    value={Math.round(globalVolume * 100)}
                                    min={0}
                                    max={100}
                                    onChange={(v) => setGlobalVolume(v / 100)}
                                    variant="ghost"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800/50" />

                {/* Configuration Section */}
                <div className="space-y-6">
                    <div className="flex flex-col gap-1 px-1">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                            configuration
                        </h4>
                    </div>
                    <div className="grid gap-3">
                        <button 
                            onClick={() => setActiveTab('identity')}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/20 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all group/config"
                        >
                            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm group-hover/config:text-blue-500 transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover/config:text-zinc-900 dark:group-hover/config:text-white transition-colors">identity</span>
                                <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-400/40">Gerenciar conta</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8 mt-auto">
                <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full justify-center h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group border border-zinc-100 dark:border-zinc-800 hover:border-red-500 shadow-sm"
                >
                    <LogOut className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
                    {t('leftSidebar.terminate_session')}
                </Button>
            </div>

                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                onConfirm={handlePublish}
                title={t('publish.confirm_title')}
                message={t('publish.confirm_message')}
                confirmText={t('publish.confirm_action')}
                cancelText={t('common.cancel')}
                type="info"
                isLoading={isPending}
            />
        </aside>
    )
}
