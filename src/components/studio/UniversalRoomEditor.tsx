import { useTranslation } from "@/i18n/context"
import { UniversalThemeEditor } from "./UniversalThemeEditor"
import { UniversalEffectsEditor } from "./UniversalEffectsEditor"
import { Palette, Bomb, Activity } from "lucide-react"
import { useState, useTransition } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { EditorSection, PillSelector, EditorActionButton } from "./EditorUI"
import { deleteRoom } from "@/actions/profile"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ConfirmModal } from "../ui/confirm-modal"
import { Room, RoomVisualConfig } from "@/types/database"

interface UniversalRoomEditorProps {
    profile: Room
    username: string
    onUpdateProfile: (data: Partial<RoomVisualConfig>) => void
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
                        onChange={(id) => setActiveTab(id as 'vibe' | 'kinetics')}
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

                <div className="h-10" />


                {activeTab === 'vibe' && (
                    <div className="space-y-12">
                        <UniversalThemeEditor
                            currentTheme={profile.theme}
                            currentBackgroundColor={profile.backgroundColor || '#050505'}
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
