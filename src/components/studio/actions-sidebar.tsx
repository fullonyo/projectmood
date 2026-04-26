"use client"

import { LogOut, ExternalLink, User, Camera, Loader2, Upload, History, RotateCcw, Sparkles, Volume2, VolumeX, Globe, Plus, Clock, ShieldCheck, Trash2, Link as LinkIcon, ChevronRight } from "lucide-react"
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
import { publishRoom } from "@/actions/publish"
import imageCompression from 'browser-image-compression'
import { useTranslation } from "@/i18n/context"
import { LanguageSwitcher } from "./language-switcher"
import { useAudio } from "./audio-context"
import { toast } from "sonner"
import { getRelativeTime } from "@/lib/utils"
import { VersionHistoryPanel } from "./version-history-panel"
import { EditorHeader, EditorSection, EditorSlider } from "./EditorUI"

import { Room } from "@/types/database"
import { UniversalIdentityEditor } from "./UniversalIdentityEditor"
import { IdentitySection } from "./IdentitySection"

import { PreviewData } from "./studio-client-layout"

interface ActionsSidebarProps {
    username: string
    name: string | null
    profile: Room
    publishedAt?: Date | string | null
    hasUnpublishedChanges?: boolean
    isAdmin?: boolean
    setPreviewData: (data: PreviewData | null) => void
    isPreview?: boolean
    allRooms?: any[]
    userAvatar?: string | null
    /** Escape hatch para resets deliberados (ex: rollback de versão) */
    onForceReset?: (newBlocks: any[]) => void
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function SpacesPanel({ rooms, currentRoomId, username, onClose }: { rooms: any[], currentRoomId: string, username: string, onClose: () => void }) {
    const { t, dict } = useTranslation()
    const router = useRouter()
    const [isCreating, startCreateTransition] = useTransition()

    const handleSwitchSpace = (roomId: string) => {
        const targetRoom = rooms.find(r => r.id === roomId)
        if (targetRoom?.isPrimary) {
            router.push('/studio')
        } else {
            router.push(`/studio/${targetRoom.slug}`)
        }
        onClose()
    }

    const [isCreatingForm, setIsCreatingForm] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [newType, setNewType] = useState<'PERMANENT' | 'TEMPORARY'>('PERMANENT')
    const [newExpiresAt, setNewExpiresAt] = useState<string>("")
    const [newMaxViews, setNewMaxViews] = useState<string>("")
    const [roomToDelete, setRoomToDelete] = useState<string | null>(null)
    const [isDeleting, startDeleteTransition] = useTransition()

    const handleDeleteRoom = (roomId: string) => {
        startDeleteTransition(async () => {
            const { deleteRoom } = await import("@/actions/profile")
            const res = await deleteRoom(roomId)
            if (res.success) {
                toast.success(dict.multiverse.destroy_success)
                if (roomId === currentRoomId) {
                    router.push('/studio')
                }
                router.refresh()
                setRoomToDelete(null)
            } else {
                toast.error(res.error || dict.multiverse.destroy_error)
            }
        })
    }

    const handleCreateSpace = () => {
        if (!newTitle) {
            toast.error("Dê um nome para seu novo espaço")
            return
        }

        startCreateTransition(async () => {
            const { createRoom } = await import("@/actions/profile")
            const res = await createRoom({ 
                title: newTitle, 
                type: newType,
                expiresAt: newExpiresAt ? new Date(newExpiresAt) : undefined,
                maxViews: newMaxViews ? parseInt(newMaxViews) : undefined
            })

            if (res.success && res.room) {
                toast.success("Novo portal aberto com sucesso!")
                router.push(`/studio/${res.room.slug}`)
                onClose()
            } else {
                toast.error(res.error || "Falha ao criar espaço")
            }
        })
    }

    const primaryRoom = rooms.find(r => r.isPrimary)
    const secondaryRooms = rooms.filter(r => !r.isPrimary)

    const RoomCard = ({ room }: { room: any }) => (
        <div 
            key={room.id}
            onClick={() => handleSwitchSpace(room.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSwitchSpace(room.id)
            }}
            className={cn(
                "w-full text-left group p-4 rounded-2xl border transition-all relative overflow-hidden cursor-pointer",
                room.id === currentRoomId 
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-zinc-50 dark:bg-white/5 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {room.isPrimary ? <ShieldCheck className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">
                        {room.title || (room.isPrimary ? dict.multiverse.primary_space : dict.multiverse.pocket_dimension)}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {room.isPrimary && (
                        <span className={cn(
                            "text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full",
                            room.id === currentRoomId 
                                ? "bg-white/20 text-white" 
                                : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}>
                            Principal
                        </span>
                    )}
                    {room.type === 'TEMPORARY' && (
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter opacity-70">
                            <Clock className="w-3 h-3" />
                            Temp
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className={cn(
                    "text-[9px] font-bold opacity-60",
                    room.id === currentRoomId ? "text-white" : "text-zinc-400"
                )}>
                    /@{username.toLowerCase()}{room.isPrimary ? '' : `/${room.slug || '...'}`}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!room.isPrimary && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation()
                                setRoomToDelete(room.id)
                            }}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                room.id === currentRoomId 
                                    ? "bg-white/10 hover:bg-red-500" 
                                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-red-500 hover:text-white"
                            )}
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    )}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation()
                            const path = room.isPrimary ? `/@${username.toLowerCase()}` : `/@${username.toLowerCase()}/${room.slug}`
                            window.open(path, '_blank')
                        }}
                        className={cn(
                            "p-1.5 rounded-lg transition-all",
                            room.id === currentRoomId 
                                ? "bg-white/10 hover:bg-white/20" 
                                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        )}
                    >
                        <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {room.id === currentRoomId && (
                <div className="absolute top-2 right-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
            )}
        </div>
    )

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
            {/* ── Header: padrão EditorHeader ─────────────────────────── */}
            <div className="relative mb-8 pt-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                        <h2 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] text-zinc-900 dark:text-white break-words">
                            {dict.multiverse.control_title}
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500 truncate">
                            {dict.multiverse.active_count.replace('{count}', rooms.length.toString())}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shrink-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-zinc-200 dark:from-zinc-800 to-transparent mt-6" />
            </div>


            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2 -mr-2">

                {/* ── Sala Primária — Pinada no topo ──────────────────────── */}
                {primaryRoom && (
                    <div className="space-y-1.5">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">
                            Identidade Principal
                        </span>
                        <RoomCard room={primaryRoom} />
                    </div>
                )}

                {/* ── Espaços Secundários ──────────────────────────────────── */}
                {secondaryRooms.length > 0 && (
                    <div className="space-y-1.5 pt-3">
                        <div className="flex items-center gap-2 pl-1">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                Portais Dimensionais
                            </span>
                            <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                            <span className="text-[8px] font-bold text-zinc-300 dark:text-zinc-600">
                                {secondaryRooms.length}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {secondaryRooms.map(room => (
                                <RoomCard key={room.id} room={room} />
                            ))}
                        </div>
                    </div>
                )}


                <button 
                    onClick={() => setIsCreatingForm(true)}
                    disabled={isCreating}
                    className="w-full py-6 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-blue-500 hover:border-blue-500/50 transition-all flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                        {dict.multiverse.create_btn}
                    </span>
                </button>

                <ConfirmModal
                    isOpen={isCreatingForm}
                    onClose={() => setIsCreatingForm(false)}
                    onConfirm={handleCreateSpace}
                    title={dict.multiverse.modal_title}
                    message={dict.multiverse.modal_message}
                    confirmText={dict.multiverse.create_confirm}
                    cancelText={dict.common.cancel}
                    isLoading={isCreating}
                >
                    <div className="space-y-4 text-left">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">{dict.multiverse.field_title}</label>
                            <input 
                                autoFocus
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder={dict.multiverse.field_title_placeholder}
                                className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none text-[12px] font-bold tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">{dict.multiverse.protocol_label}</label>
                            <div className="flex gap-2 p-1 bg-zinc-50 dark:bg-zinc-900 rounded-2xl">
                                <button 
                                    onClick={() => setNewType('PERMANENT')}
                                    className={cn(
                                        "flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        newType === 'PERMANENT' ? "bg-white dark:bg-zinc-800 text-blue-500 shadow-sm" : "text-zinc-400"
                                    )}
                                >
                                    {dict.multiverse.protocol_eternal}
                                </button>
                                <button 
                                    onClick={() => setNewType('TEMPORARY')}
                                    className={cn(
                                        "flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        newType === 'TEMPORARY' ? "bg-white dark:bg-zinc-800 text-red-500 shadow-sm" : "text-zinc-400"
                                    )}
                                >
                                    {dict.multiverse.protocol_ephemeral}
                                </button>
                            </div>
                        </div>

                        {newType === 'TEMPORARY' && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 pt-2"
                            >
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">{dict.multiverse.field_expiration}</label>
                                    <input 
                                        type="datetime-local"
                                        value={newExpiresAt}
                                        onChange={(e) => setNewExpiresAt(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none text-[12px] font-bold tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm dark:color-scheme-dark"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">{dict.multiverse.field_max_views}</label>
                                    <input 
                                        type="number"
                                        value={newMaxViews}
                                        onChange={(e) => setNewMaxViews(e.target.value)}
                                        placeholder={dict.multiverse.field_max_views_placeholder}
                                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none text-[12px] font-bold tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </ConfirmModal>

                <ConfirmModal
                    isOpen={!!roomToDelete}
                    onClose={() => setRoomToDelete(null)}
                    onConfirm={() => roomToDelete && handleDeleteRoom(roomToDelete)}
                    title={dict.multiverse.destroy_confirm_title}
                    message={dict.multiverse.destroy_confirm_message}
                    confirmText={t('common.delete')}
                    cancelText={dict.common.cancel}
                    type="danger"
                    isLoading={isDeleting}
                />
            </div>
        </div>
    )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export function ActionsSidebar({ 
    username: initialUsername, 
    name: initialName, 
    profile, 
    publishedAt, 
    hasUnpublishedChanges, 
    isAdmin, 
    setPreviewData, 
    isPreview = false,
    allRooms = [],
    userAvatar,
    onForceReset
}: ActionsSidebarProps) {
    const { t, dict } = useTranslation()
    const [isUploading, setIsUploading] = useState(false)
    const [showPublishModal, setShowPublishModal] = useState(false)
    const [activeTab, setActiveTab] = useState<'main' | 'identity' | 'history' | 'spaces'>('main')
    const [isPending, startTransition] = useTransition()
    const [versionLabel, setVersionLabel] = useState("")
    
    const [currentName, setCurrentName] = useState(initialName)
    const [currentUsername, setCurrentUsername] = useState(initialUsername)
    const [mounted, setMounted] = useState(false)
    // Avatar local state — atualiza otimisticamente após upload
    const [currentAvatar, setCurrentAvatar] = useState<string | null>(
        allRooms.find(r => r.isPrimary)?.avatarUrl || userAvatar || null
    )
    
    useEffect(() => {
        setCurrentName(initialName)
        setCurrentUsername(initialUsername)
        setMounted(true)
    }, [initialName, initialUsername])

    // Sincroniza avatar quando prop externa mudar (ex: troca de espaço)
    useEffect(() => {
        const primaryAvatar = allRooms.find(r => r.isPrimary)?.avatarUrl || userAvatar || null
        setCurrentAvatar(primaryAvatar)
    }, [userAvatar, allRooms])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const { isGlobalMuted, toggleGlobalMute, globalVolume, setGlobalVolume } = useAudio()
    const router = useRouter()

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        try {
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 400, useWebWorker: true }
            const compressedFile = await imageCompression(file, options)
            const reader = new FileReader()
            reader.onload = async () => {
                const base64 = reader.result as string
                // ✅ Sempre salva na sala PRIMÁRIA — avatar é identidade global
                const primaryRoom = allRooms.find(r => r.isPrimary)
                const targetRoomId = primaryRoom?.id || profile.id
                await updateProfile({ avatarUrl: base64 }, targetRoomId)
                // Atualiza estado local otimisticamente
                setCurrentAvatar(base64)
                setIsUploading(false)
            }
            reader.readAsDataURL(compressedFile)
        } catch (error) {
            console.error(error)
            setIsUploading(false)
        }
    }

    const handlePublish = () => {
        startTransition(async () => {
            const result = await publishRoom(profile.id, versionLabel)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(t('publish.success'))
                setVersionLabel("")
                router.refresh()
            }
            setShowPublishModal(false)
        })
    }

    const isDraft = hasUnpublishedChanges ?? !publishedAt

    return (
        <aside className="relative w-80 h-full bg-white dark:bg-zinc-900 border-l border-zinc-100 dark:border-zinc-800 flex flex-col shadow-xl z-50 overflow-hidden">
            <AnimatePresence mode="wait">
                {activeTab === 'identity' && (
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
                )}

                {activeTab === 'history' && (
                    <motion.div
                        key="history-editor"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute inset-0 z-50 bg-white dark:bg-zinc-900 p-8"
                    >
                        <VersionHistoryPanel 
                            onRollbackComplete={() => router.refresh()}
                            setPreviewData={setPreviewData}
                            onClose={() => setActiveTab('main')}
                            roomId={profile.id}
                        />
                    </motion.div>
                )}

                {activeTab === 'spaces' && (
                    <motion.div
                        key="spaces-panel"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute inset-0 z-50 bg-white dark:bg-zinc-900 p-8"
                    >
                        <SpacesPanel 
                            rooms={allRooms} 
                            currentRoomId={profile.id}
                            username={currentUsername}
                            onClose={() => setActiveTab('main')} 
                        />
                    </motion.div>
                )}

                {activeTab === 'main' && (
                    <motion.div
                        key="main-content"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn("flex flex-col h-full overflow-hidden", isPreview && "opacity-60 pointer-events-none")}
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

            <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="flex flex-col hover:opacity-70 transition-all active:scale-95">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 leading-none mb-1.5">Mood Space</span>
                        <div className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white">
                            Studio
                        </div>
                    </Link>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm relative group transition-all duration-500">
                    <IdentitySection 
                        currentName={currentName}
                        currentUsername={currentUsername}
                        profile={profile}
                        userAvatar={currentAvatar}
                        isUploading={isUploading}
                        onAvatarClick={() => fileInputRef.current?.click()}
                        publishedAt={publishedAt}
                        hasUnpublishedChanges={hasUnpublishedChanges}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-6 custom-scrollbar space-y-10">
                <div className="space-y-4">
                    <EditorHeader title={t('leftSidebar.deployment_area')} />

                    <div className="grid gap-3">
                        <Button
                            onClick={() => setShowPublishModal(true)}
                            disabled={isPending}
                            className="w-full justify-between h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-zinc-900 hover:bg-black dark:bg-white dark:text-black transition-all group shadow-lg shadow-zinc-200 dark:shadow-none border-none relative overflow-hidden px-6"
                        >
                            <div className="flex items-center gap-3">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />}
                                {t('publish.button')}
                            </div>
                            <div className="flex items-center gap-3">
                                {mounted && publishedAt && (
                                    <span className="text-[8px] font-medium opacity-60 flex items-center gap-1">
                                        {getRelativeTime(publishedAt, t)}
                                    </span>
                                )}
                                <div className={cn("w-2 h-2 rounded-full", isDraft ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
                            </div>
                        </Button>

                        <div className={cn("grid grid-cols-2 gap-3 mb-2", isPreview && "opacity-50 pointer-events-none")}>
                            <Link href={profile.isPrimary ? `/@${currentUsername.toLowerCase()}` : `/@${currentUsername.toLowerCase()}/${profile.slug}`} target="_blank" className="w-full">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-2xl text-[9px] font-bold uppercase tracking-widest bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                    {t('common.view')}
                                </Button>
                            </Link>
                            <ShareProfileButton 
                                username={currentUsername} 
                                isPrimary={profile.isPrimary}
                                slug={profile.slug || undefined}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <EditorHeader title="Multiverse Management" />
                    <div className="grid gap-2">
                        <button
                            onClick={() => setActiveTab('spaces')}
                            className={cn(
                                "w-full h-14 px-6 flex items-center justify-between transition-all rounded-2xl group",
                                "bg-zinc-100/50 dark:bg-zinc-800/20 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-white dark:bg-zinc-900 shadow-sm text-blue-500">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
                                        Switch Spaces
                                    </span>
                                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                                        {allRooms.length} dimensões ativas
                                    </span>
                                </div>
                            </div>
                            <Plus className="w-4 h-4 text-zinc-300" />
                        </button>

                        <button
                            onClick={() => setActiveTab('history')}
                            className={cn(
                                "w-full h-12 px-6 flex items-center justify-between transition-all rounded-2xl group text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-zinc-100 dark:bg-zinc-800">
                                    <History className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                    {t('publish.version_history')}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <EditorHeader title={t('leftSidebar.system_ux')} />
                    <div className="space-y-8 px-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleGlobalMute}
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative group",
                                        isGlobalMuted ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                    )}
                                >
                                    {isGlobalMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white leading-none mb-1.5">Áudio Master</span>
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
                                <EditorSlider value={Math.round(globalVolume * 100)} min={0} max={100} onChange={(v) => setGlobalVolume(v / 100)} variant="ghost" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-3 pt-4">
                    <button 
                        onClick={() => setActiveTab('identity')}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/20 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all group/config"
                    >
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm group-hover/config:text-blue-500 transition-colors">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover/config:text-zinc-900 dark:group-hover/config:text-white transition-colors">identity</span>
                            <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-400/40">Gerenciar conta</span>
                        </div>
                    </button>
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
            >
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">{t('publish.confirm_title')}</label>
                    <input 
                        type="text"
                        value={versionLabel}
                        onChange={(e) => setVersionLabel(e.target.value)}
                        placeholder="Ex: Layout de Verão, Build com Fotos..."
                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-[11px] font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        autoFocus
                    />
                </div>
            </ConfirmModal>
        </aside>
    )
}
