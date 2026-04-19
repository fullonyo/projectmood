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
    const [activeTab, setActiveTab] = useState<'vibe' | 'kinetics' | 'danger'>('vibe')

    return (
        <div className="space-y-12 pb-20">
            <PillSelector
                options={[
                    { id: 'vibe', label: 'VIBE', icon: Palette },
                    { id: 'kinetics', label: 'MOTION', icon: Activity },
                    { id: 'danger', label: 'ZONE', icon: Bomb }
                ]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as any)}
            />

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

                {activeTab === 'danger' && (
                    <div className="space-y-10">
                        <EditorSection 
                            title={t('sidebar.style.danger_title')}
                            subtitle={t('sidebar.style.danger_desc')}
                        >
                            <div className="pt-4">
                                <EditorActionButton
                                    variant="danger"
                                    label={t('sidebar.style.clear_wall_btn')}
                                    onClick={onClearWall}
                                />
                            </div>
                        </EditorSection>
                    </div>
                )}
            </div>
        </div>
    )
}
