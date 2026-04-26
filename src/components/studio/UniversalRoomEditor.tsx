import { useTranslation } from "@/i18n/context"
import { UniversalThemeEditor } from "./UniversalThemeEditor"
import { UniversalEffectsEditor } from "./UniversalEffectsEditor"
import { Palette, Bomb, Activity, Clock, Eye, Shield } from "lucide-react"
import { useState, useTransition } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { EditorSection, PillSelector, EditorActionButton } from "./EditorUI"
import { deleteRoom } from "@/actions/profile"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ConfirmModal } from "../ui/confirm-modal"

interface UniversalRoomEditorProps {
    profile: any
    username: string
    onUpdateProfile: (data: any) => void
    onClearWall: () => void
}

export function UniversalRoomEditor({ profile, username, onUpdateProfile, onClearWall }: UniversalRoomEditorProps) {
    const { t, dict } = useTranslation()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState<'vibe' | 'kinetics'>('vibe')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [roomTitle, setRoomTitle] = useState(profile.title || "")
    const [roomSlug, setRoomSlug] = useState(profile.slug || "")

    const handleDelete = () => {
        startTransition(async () => {
            const res = await deleteRoom(profile.id)
            if (res.success) {
                toast.success(dict.multiverse.destroy_success)
                router.push("/studio")
                router.refresh()
            } else {
                toast.error(res.error || dict.multiverse.destroy_error)
            }
        })
    }

    return (
        <div className="space-y-10 pb-20">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <PillSelector
                        options={[
                            { id: 'vibe', label: 'VIBE', icon: Palette },
                            { id: 'kinetics', label: 'MOTION', icon: Activity },
                        ]}
                        activeId={activeTab}
                        onChange={(id) => setActiveTab(id as any)}
                    />
                </div>
                <button
                    onClick={onClearWall}
                    title={t('sidebar.style.clear_wall_btn')}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 group"
                >
                    <Bomb className="w-5 h-5 transition-transform group-hover:rotate-12" />
                </button>
            </div>

            <div className="min-h-[400px]">
                <EditorSection title={dict.multiverse.editor_title}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">{dict.multiverse.field_title}</label>
                            <input 
                                value={roomTitle}
                                onChange={(e) => setRoomTitle(e.target.value)}
                                onBlur={() => {
                                    if (roomTitle !== profile.title) {
                                        onUpdateProfile({ title: roomTitle })
                                    }
                                }}
                                placeholder={dict.multiverse.field_title_placeholder}
                                className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-none text-[12px] font-bold tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm"
                            />
                        </div>

                        {!profile.isPrimary && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">{dict.multiverse.field_slug}</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">
                                        mood.space/@{username.toLowerCase()}/
                                    </div>
                                    <input 
                                        value={roomSlug}
                                        onChange={(e) => setRoomSlug(e.target.value)}
                                        onBlur={() => {
                                            if (roomSlug !== profile.slug) {
                                                onUpdateProfile({ slug: roomSlug })
                                            }
                                        }}
                                        placeholder={dict.multiverse.field_slug_placeholder}
                                        className="w-full h-12 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-none text-[12px] font-bold tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm"
                                        style={{ paddingLeft: `${(username.length + 13) * 7.5}px` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </EditorSection>

                <div className="h-8" />

                <EditorSection title={dict.multiverse.protocol_label}>
                    <div className="space-y-6">
                        <PillSelector
                            options={[
                                { id: 'PERMANENT', label: dict.multiverse.protocol_eternal, icon: Shield },
                                { id: 'TEMPORARY', label: dict.multiverse.protocol_ephemeral, icon: Clock },
                            ]}
                            activeId={profile.type}
                            onChange={(id) => onUpdateProfile({ type: id })}
                        />

                        {profile.type === 'TEMPORARY' && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6 pt-2"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1 pl-1">
                                        <Clock className="w-3 h-3 text-zinc-400" />
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{dict.multiverse.field_expiration}</label>
                                    </div>
                                    <input 
                                        type="datetime-local"
                                        value={profile.expiresAt ? new Date(new Date(profile.expiresAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => onUpdateProfile({ expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-none text-[12px] font-bold tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm dark:color-scheme-dark"
                                    />
                                    <p className="text-[8px] font-bold text-zinc-400/50 uppercase tracking-widest pl-1">
                                        {dict.multiverse.existence_protocol_desc}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1 pl-1">
                                        <Eye className="w-3 h-3 text-zinc-400" />
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{dict.multiverse.field_max_views}</label>
                                    </div>
                                    <input 
                                        type="number"
                                        value={profile.maxViews || ""}
                                        onChange={(e) => onUpdateProfile({ maxViews: e.target.value ? parseInt(e.target.value) : null })}
                                        placeholder={dict.multiverse.field_max_views_placeholder}
                                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-none text-[12px] font-bold tracking-widest focus:ring-1 focus:ring-blue-500/20 outline-none shadow-sm"
                                    />
                                    <p className="text-[8px] font-bold text-zinc-400/50 uppercase tracking-widest pl-1">
                                        {dict.multiverse.view_limit_desc}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </EditorSection>

                <div className="h-10" />

                {activeTab === 'vibe' && (
                    <div className="space-y-12">
                        <UniversalThemeEditor
                            currentTheme={profile.theme}
                            currentPrimaryColor={profile.primaryColor || '#000'}
                            currentStaticTexture={profile.staticTexture || 'none'}
                            onUpdate={onUpdateProfile}
                        />
                    </div>
                )}

                {activeTab === 'kinetics' && (
                    <div className="space-y-12">
                        <UniversalEffectsEditor profile={profile} onUpdateProfile={onUpdateProfile} />
                    </div>
                )}

                {!profile.isPrimary && (
                    <div className="pt-20 pb-10">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full h-14 rounded-2xl border-2 border-dashed border-red-100 dark:border-red-900/30 text-red-500/60 hover:text-red-500 hover:border-red-500/50 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                            {dict.multiverse.destroy_btn}
                        </button>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title={dict.multiverse.destroy_confirm_title}
                message={dict.multiverse.destroy_confirm_message}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
                isLoading={isPending}
            />
        </div>
    )
}
