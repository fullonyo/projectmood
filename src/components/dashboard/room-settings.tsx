"use client"

import { useTranslation } from "@/i18n/context"
import { ThemeEditor } from "./theme-editor"
import { ColorPaletteExtractor } from "./color-palette-extractor"
import { EffectsEditor } from "./effects-editor"
import { Button } from "../ui/button"
import { Bomb, Trash2 } from "lucide-react"

interface RoomSettingsProps {
    profile: any
    onUpdateProfile: (data: any) => void
    onClearWall: () => void
}

export function RoomSettings({ profile, onUpdateProfile, onClearWall }: RoomSettingsProps) {
    const { t } = useTranslation()

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-left-2 duration-300">
            <header>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 bg-black dark:bg-white" />
                    <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">{t('sidebar.style.atmosphere_title')}</h3>
                </div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest">{t('sidebar.style.atmosphere_desc')}</p>
            </header>

            <ThemeEditor
                currentTheme={profile.theme}
                currentPrimaryColor={profile.primaryColor || '#000'}
                currentFontStyle={profile.fontStyle || 'sans'}
                currentCustomFont={profile.customFont}
                onUpdate={onUpdateProfile}
            />

            <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

            <ColorPaletteExtractor onApplyPalette={async (colors) => {
                // Apply first color as primary
                if (colors[0]) {
                    await onUpdateProfile({ primaryColor: colors[0] })
                }
            }} />

            <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

            <header>
                <h3 className="text-[10px] font-black tracking-tighter uppercase">{t('sidebar.style.magic_fx_title')}</h3>
                <p className="text-[11px] text-zinc-500 italic mt-1">{t('sidebar.style.magic_fx_desc')}</p>
            </header>

            <EffectsEditor profile={profile} />

            <div className="pt-12 space-y-6">
                <header className="border-t border-zinc-100 dark:border-zinc-900 pt-8">
                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Bomb className="w-3 h-3" />
                        {t('sidebar.style.danger_title')}
                    </h3>
                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">{t('sidebar.style.danger_desc')}</p>
                </header>

                <Button
                    variant="outline"
                    className="w-full border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 gap-2 h-12 rounded-xl text-xs font-bold"
                    onClick={onClearWall}
                >
                    <Trash2 className="w-4 h-4" />
                    {t('sidebar.style.clear_wall_btn')}
                </Button>
            </div>
        </div>
    )
}
