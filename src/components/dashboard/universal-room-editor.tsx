"use client"

import { useTranslation } from "@/i18n/context"
import { ThemeEditor } from "./theme-editor"
import { ColorPaletteExtractor } from "./color-palette-extractor"
import { EffectsEditor } from "./effects-editor"
import { Button } from "../ui/button"
import { Bomb, Trash2, Palette, Sparkles, Type, Activity } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface UniversalRoomEditorProps {
    profile: any
    onUpdateProfile: (data: any) => void
    onClearWall: () => void
}

export function UniversalRoomEditor({ profile, onUpdateProfile, onClearWall }: UniversalRoomEditorProps) {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<'vibe' | 'kinetics' | 'danger'>('vibe')

    const sectionHeader = (title: string, desc: string, Icon: any) => (
        <header className="relative mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 backdrop-blur-sm">
                    <Icon className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[11px] font-black tracking-[0.4em] uppercase text-black dark:text-white">{title}</h3>
            </div>
            <p className="text-[8px] text-zinc-400 uppercase tracking-[0.2em] font-medium pl-4">{desc}</p>
        </header>
    )

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* Tab Selector - Symmetric with other Universal Editors */}
            <div className="flex border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-1">
                {[
                    { id: 'vibe', label: 'VIBE', icon: Palette },
                    { id: 'kinetics', label: 'MOTION', icon: Activity },
                    { id: 'danger', label: 'ZONE', icon: Bomb }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-[8px] font-black tracking-[0.2em] transition-all",
                            activeTab === tab.id
                                ? "bg-black text-white dark:bg-white dark:text-black shadow-lg"
                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        )}
                    >
                        <tab.icon className="w-3 h-3" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'vibe' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <section>
                            {sectionHeader(t('sidebar.style.atmosphere_title'), t('sidebar.style.atmosphere_desc'), Palette)}
                            <ThemeEditor
                                currentTheme={profile.theme}
                                currentPrimaryColor={profile.primaryColor || '#000'}
                                currentStaticTexture={profile.staticTexture || 'none'}
                                currentFontStyle={profile.fontStyle || 'sans'}
                                currentCustomFont={profile.customFont}
                                onUpdate={onUpdateProfile}
                            />
                        </section>

                        <div className="h-[1px] bg-gradient-to-r from-transparent via-zinc-100 dark:via-zinc-800 to-transparent" />
                    </div>
                )}

                {activeTab === 'kinetics' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <section>
                            {sectionHeader(t('sidebar.style.magic_fx_title'), t('sidebar.style.magic_fx_desc'), Activity)}
                            <EffectsEditor profile={profile} />
                        </section>
                    </div>
                )}

                {activeTab === 'danger' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pt-10">
                        <header className="text-center">
                            <h3 className="text-[10px] font-black text-red-500/80 uppercase tracking-[0.5em] flex items-center gap-3 justify-center mb-2">
                                <Bomb className="w-3.5 h-3.5" />
                                {t('sidebar.style.danger_title')}
                            </h3>
                            <p className="text-[8px] text-zinc-400 uppercase tracking-widest">{t('sidebar.style.danger_desc')}</p>
                        </header>

                        <Button
                            variant="outline"
                            className="w-full border-red-100 dark:border-red-900/30 text-red-500/70 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all gap-3 h-20 rounded-none text-[10px] font-black uppercase tracking-[0.4em]"
                            onClick={onClearWall}
                        >
                            <Trash2 className="w-5 h-5 opacity-50" />
                            {t('sidebar.style.clear_wall_btn')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
