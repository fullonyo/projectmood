"use client"

import { useState, useEffect, useRef, useTransition, memo } from "react"
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
    ArrowUpRight,
    ChevronRight
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

const RoomItem = memo(({ room, isActive, onSwitch, onDelete, username }: { room: any, isActive: boolean, onSwitch: (id: string) => void, onDelete: (id: string) => void, username: string }) => {
    return (
        <div 
            onClick={() => onSwitch(room.id)}
            className={cn(
                "group relative flex items-center justify-between py-3 px-3 rounded-2xl transition-all duration-500 cursor-pointer",
                isActive 
                    ? "bg-zinc-50 dark:bg-white/[0.03]" 
                    : "hover:bg-zinc-50/50 dark:hover:bg-white/[0.01]"
            )}
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className={cn(
                    "w-1 h-4 rounded-full transition-all duration-500",
                    isActive ? "bg-blue-500 scale-y-110" : "bg-transparent group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800"
                )} />
                
                <div className="flex flex-col min-w-0">
                    <span className={cn(
                        "text-[11px] font-black uppercase tracking-widest truncate transition-colors",
                        isActive ? "text-zinc-950 dark:text-white" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                    )}>
                        {room.title || "Espaço Sem Nome"}
                    </span>
                    <span className="text-[7px] font-bold tracking-[0.05em] text-zinc-400/60 truncate italic mt-0.5">
                        {room.slug ? `/@${username}/${room.slug}` : `/@${username}`}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                {!room.isPrimary && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(room.id); }}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
                <ArrowUpRight className="w-3 h-3 text-zinc-300" />
            </div>
        </div>
    )
})

RoomItem.displayName = "RoomItem"

function SpacesPanel({ rooms, currentRoomId, username, onClose }: { rooms: any[], currentRoomId: string, username: string, onClose: () => void }) {
    const { dict } = useTranslation()
    const router = useRouter()
    const [isCreating, startCreateTransition] = useTransition()
    const [isCreatingForm, setIsCreatingForm] = useState(false)
    const [roomToDelete, setRoomToDelete] = useState<string | null>(null)
    const [isDeleting, startDeleteTransition] = useTransition()

    // Form State
    const [newTitle, setNewTitle] = useState("")
    const [newType, setNewType] = useState<'PERMANENT' | 'TEMPORARY'>('PERMANENT')
    const [newExpiresAt, setNewExpiresAt] = useState("")
    const [newMaxViews, setNewMaxViews] = useState("")

    const primaryRoom = rooms.find(r => r.isPrimary)
    const secondaryRooms = rooms.filter(r => !r.isPrimary)

    const handleSwitchSpace = (roomId: string) => {
        const targetRoom = rooms.find(r => r.id === roomId)
        if (targetRoom?.isPrimary) router.push('/studio')
        else router.push(`/studio/${targetRoom.slug}`)
        onClose()
    }

    const handleDeleteRoom = (roomId: string) => {
        startDeleteTransition(async () => {
            const { deleteRoom } = await import("@/actions/profile")
            const res = await deleteRoom(roomId)
            if (res.success) {
                toast.success("Espaço removido")
                if (roomId === currentRoomId) router.push('/studio')
                router.refresh()
                setRoomToDelete(null)
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

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
            <EditorHeader 
                title={dict.multiverse.control_title} 
                subtitle={dict.multiverse.control_subtitle}
                onClose={onClose} 
            />

            <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar space-y-16">
                {/* HERO: PRIMARY SPACE */}
                {primaryRoom && (
                    <section className="relative px-2">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className={cn("w-4 h-4", primaryRoom.id === currentRoomId ? "text-blue-500" : "text-zinc-300")} />
                                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400">Espaço Principal</span>
                            </div>
                            {primaryRoom.id === currentRoomId && (
                                <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                            )}
                        </div>

                        <div 
                            onClick={() => handleSwitchSpace(primaryRoom.id)}
                            className={cn(
                                "group cursor-pointer transition-all duration-700 relative",
                                primaryRoom.id === currentRoomId ? "opacity-100" : "opacity-40 hover:opacity-100"
                            )}
                        >
                            <h2 className={cn(
                                "text-4xl font-black italic tracking-tighter leading-none transition-all duration-700",
                                primaryRoom.id === currentRoomId ? "text-zinc-950 dark:text-white scale-105 origin-left" : "text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white"
                            )}>
                                {primaryRoom.title || "Origem"}
                            </h2>
                            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 italic">
                                Sintonizado com a sua Identidade Base
                            </p>
                        </div>
                    </section>
                )}

                {/* LIST: SECONDARY SPACES */}
                <section className="space-y-10 pt-10 border-t border-zinc-50 dark:border-white/[0.03]">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">Espaços Adicionais</span>
                        <button 
                            onClick={() => setIsCreatingForm(true)}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-white/5 text-zinc-400 hover:bg-blue-500 hover:text-white transition-all active:scale-90"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {secondaryRooms.length > 0 ? (
                            secondaryRooms.map(room => (
                                <RoomItem 
                                    key={room.id}
                                    room={room}
                                    isActive={room.id === currentRoomId}
                                    onSwitch={handleSwitchSpace}
                                    onDelete={setRoomToDelete}
                                    username={username}
                                />
                            ))
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center opacity-20">
                                <Globe className="w-8 h-8 mb-4 stroke-[1px]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Nenhum espaço adicional</span>
                            </div>
                        )}
                    </div>
                </section>

                <ConfirmModal
                    isOpen={!!roomToDelete}
                    onClose={() => setRoomToDelete(null)}
                    onConfirm={() => roomToDelete && handleDeleteRoom(roomToDelete)}
                    title="Remover Espaço?"
                    message="Esta ação não pode ser desfeita. Todo o conteúdo deste espaço será permanentemente deletado."
                    confirmText="Remover"
                    cancelText="Manter"
                    type="danger"
                    isLoading={isDeleting}
                />
                
                <ConfirmModal
                    isOpen={isCreatingForm}
                    onClose={() => setIsCreatingForm(false)}
                    onConfirm={handleCreateSpace}
                    title={dict.multiverse.modal_title}
                    message={dict.multiverse.modal_message}
                    confirmText={isCreating ? "Criando..." : dict.multiverse.create_btn}
                    cancelText={dict.common.cancel}
                    isLoading={isCreating}
                >
                    <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">Título do Espaço</label>
                            <input 
                                autoFocus
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Ex: Galeria, Diário..."
                                className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none text-[12px] font-bold tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">Tipo de Espaço</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setNewType('PERMANENT')}
                                    className={cn(
                                        "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        newType === 'PERMANENT' ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400"
                                    )}
                                >
                                    Permanente
                                </button>
                                <button 
                                    onClick={() => setNewType('TEMPORARY')}
                                    className={cn(
                                        "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        newType === 'TEMPORARY' ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400"
                                    )}
                                >
                                    Temporário
                                </button>
                            </div>
                        </div>

                        {newType === 'TEMPORARY' && (
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">Expiração</label>
                                    <input 
                                        type="datetime-local"
                                        value={newExpiresAt}
                                        onChange={(e) => setNewExpiresAt(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none text-[12px] font-bold tracking-widest outline-none shadow-sm dark:color-scheme-dark"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">Limite de Vistas</label>
                                    <input 
                                        type="number"
                                        value={newMaxViews}
                                        onChange={(e) => setNewMaxViews(e.target.value)}
                                        placeholder="Ilimitado se vazio"
                                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none text-[12px] font-bold tracking-widest outline-none shadow-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </ConfirmModal>
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

                        <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-6 custom-scrollbar space-y-10 flex flex-col">
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
                title={dict.publish.modal_title}
                message={dict.publish.modal_description}
                confirmText={isPending ? t('common.loading') : dict.publish.confirm_button}
                cancelText={dict.common.cancel}
                isLoading={isPending}
            >
                <div className="space-y-4 py-4">
                    <input
                        type="text"
                        value={versionLabel}
                        onChange={(e) => setVersionLabel(e.target.value)}
                        placeholder={dict.publish.label_placeholder}
                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none text-[12px] font-bold tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none"
                    />
                </div>
            </ConfirmModal>
        </aside>
    )
}
