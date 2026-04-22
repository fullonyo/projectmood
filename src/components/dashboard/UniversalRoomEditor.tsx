import { useTranslation } from "@/i18n/context"
import { UniversalThemeEditor } from "./UniversalThemeEditor"
import { UniversalEffectsEditor } from "./UniversalEffectsEditor"
import { Palette, Bomb, Activity } from "lucide-react"
import { useState } from "react"
import { EditorSection, PillSelector, EditorActionButton } from "./EditorUI"

interface UniversalRoomEditorProps {
    profile: any
    onUpdateProfile: (data: any) => void
    onClearWall: () => void
}

export function UniversalRoomEditor({ profile, onUpdateProfile, onClearWall }: UniversalRoomEditorProps) {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<'vibe' | 'kinetics'>('vibe')

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
                        <UniversalEffectsEditor profile={profile} />
                    </div>
                )}
            </div>
        </div>
    )
}
