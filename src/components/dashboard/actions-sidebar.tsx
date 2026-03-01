"use client"

import { LogOut, ExternalLink, User, Settings, Camera, Loader2, Upload, Clock, History, ChevronDown, RotateCcw, Sparkles, Activity, Volume2, VolumeX } from "lucide-react"
import { Button } from "../ui/button"
import { ShareProfileButton } from "./share-profile-button"
import { ConfirmModal } from "../ui/confirm-modal"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useState, useRef, useTransition } from "react"
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

import { Profile } from "@/types/database"

interface ActionsSidebarProps {
    username: string
    profile: Profile
    publishedAt?: Date | string | null
    hasUnpublishedChanges?: boolean
    isAdmin?: boolean
}

export function ActionsSidebar({ username, profile, publishedAt, hasUnpublishedChanges, isAdmin }: ActionsSidebarProps) {
    const { t } = useTranslation()
    const [isUploading, setIsUploading] = useState(false)
    const [showPublishModal, setShowPublishModal] = useState(false)
    const [isPending, startTransition] = useTransition()
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

    const firstName = username
    const avatarSrc = profile.avatarUrl || `https://avatar.vercel.sh/${username}`
    const isDraft = hasUnpublishedChanges ?? !publishedAt

    return (
        <aside className="relative w-80 h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shadow-none z-50 overflow-hidden">
            <LanguageSwitcher className="absolute top-3 right-6" />

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
            />

            <div className="p-8 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center justify-between mb-2">
                    <Link href="/" className="flex flex-col hover:opacity-70 transition-opacity">
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-30 leading-none mb-1">{t('leftSidebar.system_node')}</span>
                        <div className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                            MoodSpace
                        </div>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 border border-black dark:border-white mr-10 relative z-10">
                        <span className="text-[8px] font-black uppercase tracking-widest">{t('leftSidebar.active_studio')}</span>
                    </div>
                </div>
            </div>

            <div className="px-6 py-10">
                <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative group transition-all duration-500">
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-zinc-300 dark:border-zinc-700" />
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-zinc-300 dark:border-zinc-700" />

                    <div className="flex items-center gap-5 mb-6">
                        <div className="relative">
                            <button
                                onClick={handleAvatarClick}
                                disabled={isUploading}
                                className="relative w-14 h-14 overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-500 group/avatar disabled:opacity-50 grayscale hover:grayscale-0"
                            >
                                <img
                                    src={avatarSrc}
                                    alt={username}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                                {isUploading ? (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                                        <Camera className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </button>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-30 leading-none mb-1.5">{t('leftSidebar.identity_protocol')}</span>
                            <h4 className="text-xl font-black italic tracking-tighter dark:text-white uppercase">{firstName}</h4>
                            <span className="text-[7px] font-mono text-zinc-400 mt-1 uppercase">Node // studio://{username.toLowerCase()}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-zinc-100 dark:border-zinc-900">
                        <div className="flex flex-col">
                            <p className="text-[7px] uppercase font-black text-zinc-400 tracking-[0.3em] mb-1">{t('leftSidebar.access_level')}</p>
                            <p className="text-[9px] font-black uppercase text-black dark:text-white">{t('leftSidebar.studio_free')}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-[7px] uppercase font-black text-zinc-400 tracking-[0.3em] mb-1">{t('leftSidebar.system_status')}</p>
                            <div className="flex items-center gap-1.5">
                                <div className={cn(
                                    "w-1 h-1 animate-pulse",
                                    isDraft ? "bg-amber-500" : "bg-black dark:bg-white"
                                )} />
                                <p className={cn(
                                    "text-[9px] font-black uppercase",
                                    isDraft ? "text-amber-500" : "text-black dark:text-white"
                                )}>
                                    {isDraft ? t('publish.unpublished_changes') : t('publish.synced')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6 custom-scrollbar space-y-10 animate-in fade-in slide-in-from-right-2 duration-500">
                <div className="space-y-6">
                    <header className="flex flex-col gap-2 opacity-30 px-1">
                        <div className="flex items-center gap-2">
                            <Activity className="w-2.5 h-2.5" />
                            <h3 className="text-[7.5px] font-black tracking-[0.4em] uppercase">{t('leftSidebar.deployment_area')}</h3>
                        </div>
                    </header>
                    <div className="flex flex-col border-l border-zinc-100 dark:border-zinc-900 pl-4 py-1 mb-6">
                        <p className="text-[10px] font-black italic tracking-tighter uppercase">{t('leftSidebar.external_visibility')}</p>
                    </div>

                    <div className="grid gap-4">
                        <Button
                            onClick={() => setShowPublishModal(true)}
                            disabled={isPending}
                            className="w-full justify-between h-14 rounded-none text-[7.5px] font-black uppercase tracking-[0.4em] bg-black dark:bg-white text-white dark:text-black transition-all group shadow-none border-2 border-black dark:border-white relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-30 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-3">
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 transition-transform" />
                                )}
                                {t('publish.button')}
                            </div>
                            <div className="flex items-center gap-2">
                                {publishedAt && (
                                    <span className="text-[7px] font-mono opacity-40 flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        {getRelativeTime(publishedAt, t)}
                                    </span>
                                )}
                                <div className={cn(
                                    "w-1.5 h-1.5",
                                    isDraft ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                                )} />
                            </div>
                        </Button>

                        <Link href={`/${username}`} target="_blank" className="w-full">
                            <Button
                                variant="outline"
                                className="w-full justify-between h-14 rounded-none text-[7.5px] font-black uppercase tracking-[0.4em] bg-transparent text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all group shadow-none border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-30 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-3">
                                    <ExternalLink className="w-4 h-4 transition-transform" />
                                    {t('leftSidebar.launch_public_space')}
                                </div>
                                <div className="flex gap-1.5 opacity-30">
                                    <div className="w-1 h-1 bg-black dark:bg-white animate-pulse" />
                                    <div className="w-1 h-1 bg-black dark:bg-white animate-pulse delay-75" />
                                    <div className="w-1 h-1 bg-black dark:bg-white animate-pulse delay-150" />
                                </div>
                            </Button>
                        </Link>

                        <div className="transition-all duration-300">
                            <ShareProfileButton username={username} />
                        </div>

                        {isAdmin && (
                            <Link href="/admin" className="w-full mt-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-between h-14 rounded-none text-[7.5px] font-black uppercase tracking-[0.4em] bg-[#1a0505] text-red-500 hover:bg-red-500 hover:text-white transition-all group shadow-none border border-red-900/50 hover:border-red-500 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-30 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                        {t('leftSidebar.command_center')}
                                    </div>

                                    <div className="w-1.5 h-1.5 bg-red-500 animate-pulse glow" />
                                </Button>
                            </Link>
                        )}

                        <VersionHistoryPanel onRollbackComplete={() => router.refresh()} />
                    </div>
                </div>

                <div className="space-y-4">
                    <header className="flex items-center gap-2 opacity-30 px-1 mb-2">
                        <Volume2 className="w-2.5 h-2.5" />
                        <h3 className="text-[7.5px] font-black tracking-[0.4em] uppercase">{t('leftSidebar.system_ux')}</h3>
                    </header>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            onClick={toggleGlobalMute}
                            className={cn(
                                "w-full justify-start gap-4 h-12 rounded-none text-[9px] font-black uppercase tracking-widest border transition-all duration-500 relative overflow-hidden",
                                isGlobalMuted
                                    ? "border-red-500/50 bg-red-500/5 text-red-500 hover:bg-red-500/10"
                                    : "border-zinc-200 dark:border-zinc-800 bg-transparent hover:border-black dark:hover:border-white"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 border transition-colors",
                                isGlobalMuted ? "border-red-500/20 bg-red-500/10" : "border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950"
                            )}>
                                {isGlobalMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </div>
                            {isGlobalMuted ? t('common.unmute_audio') : t('common.mute_audio')}

                            {isGlobalMuted && (
                                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 animate-pulse" />
                            )}
                        </Button>

                        {!isGlobalMuted && (
                            <div className="flex items-center gap-3 px-1 animate-in fade-in slide-in-from-top-1">
                                <span className="text-[7px] font-black uppercase tracking-widest opacity-30">Vol</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={globalVolume}
                                    onChange={(e) => setGlobalVolume(parseFloat(e.target.value))}
                                    className="flex-1 h-[2px] appearance-none bg-zinc-100 dark:bg-zinc-800 accent-black dark:accent-white cursor-pointer"
                                />
                                <span className="text-[7px] font-mono opacity-40 w-6">{Math.round(globalVolume * 100)}%</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <header className="flex items-center gap-2 opacity-30 px-1 mb-2">
                        <Activity className="w-2.5 h-2.5" />
                        <h3 className="text-[7.5px] font-black tracking-[0.4em] uppercase">{t('leftSidebar.system_configuration')}</h3>
                    </header>
                    <div className="grid gap-2 opacity-30 grayscale cursor-not-allowed">
                        <Button variant="outline" className="justify-start gap-4 h-12 rounded-none text-[9px] font-black uppercase tracking-widest border border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent">
                            <div className="p-1.5 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950">
                                <User className="w-3.5 h-3.5" />
                            </div>
                            {t('leftSidebar.identity_registry')}
                        </Button>
                        <Button variant="outline" className="justify-start gap-4 h-12 rounded-none text-[9px] font-black uppercase tracking-widest border border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent">
                            <div className="p-1.5 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950">
                                <Settings className="w-3.5 h-3.5" />
                            </div>
                            {t('leftSidebar.system_ux')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-8 border-t border-zinc-100 dark:border-zinc-900 shrink-0">
                <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full justify-between h-14 rounded-none text-[7.5px] font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-red-500 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-30 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3">
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {t('leftSidebar.terminate_session')}
                    </div>
                    <span className="text-[8px] opacity-20 font-mono">{t('leftSidebar.exit_hex')}</span>
                </Button>
            </div>

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
