"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Upload, 
    ExternalLink, 
    Loader2, 
    ShieldCheck, 
    Globe, 
    Trash2, 
    Plus, 
    Settings, 
    History,
    Layout,
    Link2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import imageCompression from "browser-image-compression"

import { useTranslation } from "@/i18n/context"
import { Room, MoodBlock } from "@/types/database"
import { cn } from "@/lib/utils"
import { updateProfile } from "@/actions/profile"
import { publishRoom } from "@/actions/publish"

import { LanguageSwitcher } from "./language-switcher"
import { ShareProfileButton } from "./share-profile-button"
import { IdentitySection } from "./IdentitySection"
import { UniversalIdentityEditor } from "./UniversalIdentityEditor"
import { VersionHistoryPanel } from "./version-history-panel"
import { EditorHeader } from "./EditorUI"
import { MinimalTooltip } from "@/components/ui/minimal-tooltip"
import { ConfirmModal } from "@/components/ui/confirm-modal"

interface ActionsSidebarProps {
    username: string
    name: string | null
    profile: Room
    publishedAt?: string | null
    hasUnpublishedChanges?: boolean
    isAdmin?: boolean
    setPreviewData: (data: { blocks: MoodBlock[], profile: Room } | null) => void
    isPreview?: boolean
    allRooms?: any[]
    userAvatar?: string | null
    onForceReset?: (blocks: MoodBlock[]) => void
    blocksCount?: number
}

// ─── SPACES PANEL ──────────────────────────────────────────────────────────

function SpacesPanel({ rooms, currentRoomId, username, onClose }: { rooms: any[], currentRoomId: string, username: string, onClose: () => void }) {
    const { dict } = useTranslation()
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
                            <span className="w-1 h-1 rounded-full bg-amber-400" />
                            {dict.multiverse.pocket_dimension}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mt-4">
                <span className={cn(
                    "text-[8px] font-bold tracking-widest uppercase opacity-40",
                    room.id === currentRoomId ? "text-white opacity-60" : "text-zinc-500"
                )}>
                    {room.slug ? `/${room.slug}` : `/@${username}`}
                </span>
                {!room.isPrimary && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setRoomToDelete(room.id)
                        }}
                        className={cn(
                            "p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-red-500",
                            room.id === currentRoomId && "text-white hover:bg-white/10"
                        )}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    )

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <EditorHeader 
                title={dict.multiverse.control_title} 
                onClose={onClose}
            />

            <div className="flex-1 overflow-y-auto px-1 pt-6 custom-scrollbar space-y-10">
                {/* Primary Space */}
                {primaryRoom && (
                    <div className="space-y-4">
                        <div className="px-1 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{dict.multiverse.core_identity}</div>
                        <RoomCard room={primaryRoom} />
                    </div>
                )}

                {/* Pocket Dimensions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between pr-2">
                        <div className="px-1 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{dict.multiverse.pocket_dimensions}</div>
                        <button 
                            onClick={() => setIsCreatingForm(true)}
                            className="p-1.5 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 transition-all active:scale-90"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid gap-3">
                        {secondaryRooms.length > 0 ? (
                            secondaryRooms.map(room => <RoomCard key={room.id} room={room} />)
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800/50 rounded-3xl opacity-40">
                                <Globe className="w-8 h-8 mb-4 stroke-[1px]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center px-8 leading-relaxed">
                                    {dict.multiverse.pocket_dimensions}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <ConfirmModal
                    isOpen={isCreatingForm}
                    onClose={() => setIsCreatingForm(false)}
                    onConfirm={handleCreateSpace}
                    title={dict.multiverse.modal_title}
                    message={dict.multiverse.modal_message}
                    confirmText={dict.multiverse.create_btn}
                    cancelText={dict.common.cancel}
                    isLoading={isCreating}
                >
                    <div className="space-y-6 pt-4">
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
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">{dict.multiverse.field_type}</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setNewType('PERMANENT')}
                                    className={cn(
                                        "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        newType === 'PERMANENT' ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    )}
                                >
                                    {dict.multiverse.type_permanent}
                                </button>
                                <button 
                                    onClick={() => setNewType('TEMPORARY')}
                                    className={cn(
                                        "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        newType === 'TEMPORARY' ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    )}
                                >
                                    {dict.multiverse.type_temporary}
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
                    confirmText={dict.common.delete}
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
    onForceReset,
    blocksCount = 0
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
    const [currentAvatar, setCurrentAvatar] = useState<string | null>(
        allRooms.find(r => r.isPrimary)?.avatarUrl || userAvatar || null
    )
    
    useEffect(() => {
        setCurrentName(initialName)
        setCurrentUsername(initialUsername)
        setMounted(true)
    }, [initialName, initialUsername])

    useEffect(() => {
        const primaryAvatar = allRooms.find(r => r.isPrimary)?.avatarUrl || userAvatar || null
        setCurrentAvatar(primaryAvatar)
    }, [userAvatar, allRooms])

    const fileInputRef = useRef<HTMLInputElement>(null)
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
                const primaryRoom = allRooms.find(r => r.isPrimary)
                const targetRoomId = primaryRoom?.id || profile.id
                await updateProfile({ avatarUrl: base64 }, targetRoomId)
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

                        <div className="px-8 pb-4 pt-12">
                            <div className="flex items-center justify-between mb-10">
                                <Link href="/" className="flex flex-col hover:opacity-70 transition-all active:scale-95">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 leading-none mb-1.5">Mood Space</span>
                                    <div className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                        Studio
                                    </div>
                                </Link>
                            </div>

                            <div className="relative group transition-all duration-500 py-4 mb-2">
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

                            <div className="flex items-center justify-center gap-6 py-6 border-b border-zinc-50 dark:border-zinc-800/50">
                                <MinimalTooltip content={t('publish.button')}>
                                    <button
                                        onClick={() => setShowPublishModal(true)}
                                        disabled={isPending}
                                        className={cn(
                                            "relative p-2 transition-all duration-500 group",
                                            isDraft 
                                                ? "text-amber-500 hover:text-amber-600" 
                                                : "text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 rounded-full blur-lg transition-all" />
                                        {isPending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Upload className={cn("w-5 h-5 relative z-10", isDraft && "animate-pulse")} />
                                        )}
                                        {isDraft && (
                                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white dark:border-zinc-900 z-20" />
                                        )}
                                    </button>
                                </MinimalTooltip>

                                <div className="w-px h-4 bg-zinc-100 dark:bg-zinc-800" />

                                <MinimalTooltip content={t('common.view')}>
                                    <Link 
                                        href={profile.isPrimary ? `/@${currentUsername.toLowerCase()}` : `/@${currentUsername.toLowerCase()}/${profile.slug}`} 
                                        target="_blank"
                                        className="p-2 text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all duration-500 hover:scale-110 active:scale-95"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </Link>
                                </MinimalTooltip>

                                <div className="w-px h-4 bg-zinc-100 dark:bg-zinc-800" />

                                <ShareProfileButton 
                                    username={currentUsername} 
                                    isPrimary={profile.isPrimary}
                                    slug={profile.slug || undefined}
                                    minimal
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-6 custom-scrollbar space-y-10">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setActiveTab('identity')}
                                        className="h-14 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-1 group hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                                    >
                                        <Settings className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('leftSidebar.identity_tab')}</span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('history')}
                                        className="h-14 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-1 group hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                                    >
                                        <History className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('leftSidebar.history_tab')}</span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('spaces')}
                                        className="h-14 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-1 group hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all col-span-2"
                                    >
                                        <Layout className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{dict.multiverse.control_title}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Session Insights - Human Edition */}
                            <div className="mt-auto pt-10 pb-6">
                                <div className="px-1 space-y-8">
                                    <div className="flex items-center gap-3 opacity-60">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Alterações Salvas</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Total de Itens</p>
                                            <p className="text-sm font-black text-zinc-900 dark:text-white tabular-nums leading-none italic">
                                                {blocksCount || 0}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Tipo de Espaço</p>
                                            <p className="text-[9px] font-black uppercase text-zinc-900 dark:text-white leading-none tracking-widest italic">
                                                {profile.type === 'TEMPORARY' ? 'Efêmero' : 'Permanente'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 text-center">
                                        <span className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-300 dark:text-zinc-700 italic">
                                            MoodSpace Studio
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                onConfirm={handlePublish}
                title={t('publish.modal_title')}
                message={t('publish.modal_description')}
                confirmText={isPending ? t('common.loading') : t('publish.confirm_button')}
                cancelText={dict.common.cancel}
                isLoading={isPending}
            >
                <div className="space-y-4 py-4">
                    <input
                        type="text"
                        value={versionLabel}
                        onChange={(e) => setVersionLabel(e.target.value)}
                        placeholder={t('publish.label_placeholder')}
                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none text-[12px] font-bold tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none"
                    />
                </div>
            </ConfirmModal>
        </aside>
    )
}
