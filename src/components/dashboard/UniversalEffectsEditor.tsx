"use client"

import { useState } from 'react'
import { cn } from "@/lib/utils"
import {
    MousePointer2,
    Sparkles,
    Check,
    Activity,
    Loader2,
    ArrowUpRight,
    Heart,
    LayoutGrid,
    Ghost,
    Ban,
    Grid2X2,
    Palette,
    Tv,
    Waves,
    Grid3X3,
    Droplets,
    Wand2,
    Zap,
    CloudRain,
    Music,
    History,
    Telescope
} from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { EditorHeader, EditorSection, ListSelector, GridSelector } from "./EditorUI"

interface EffectsEditorProps {
    profile: any
    onUpdateProfile?: (data: any) => void
    onClose?: () => void
}

export function UniversalEffectsEditor({ profile, onUpdateProfile, onClose }: EffectsEditorProps) {
    const { t } = useTranslation()
    const [showSuccess, setShowSuccess] = useState(false)

    const handleUpdate = (field: string, value: string) => {
        if (onUpdateProfile) {
            onUpdateProfile({ [field]: value })
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 2000)
        }
    }

    const cursors = [
        { id: 'auto', name: t('editors.effects.cursors.auto'), icon: MousePointer2 },
        { id: 'retro', name: t('editors.effects.cursors.retro'), icon: ArrowUpRight },
        { id: 'heart', name: t('editors.effects.cursors.heart'), icon: Heart },
        { id: 'pixel', name: t('editors.effects.cursors.pixel'), icon: Grid2X2 },
        { id: 'ghost', name: t('editors.effects.cursors.ghost'), icon: Ghost },
    ]

    const trails = [
        { id: 'none', name: t('editors.effects.trails.none'), icon: Ban },
        { id: 'sparkles', name: t('editors.effects.trails.sparkles'), icon: Sparkles },
        { id: 'ghost', name: t('editors.effects.trails.ghost'), icon: Ghost },
        { id: 'pixel-dust', name: t('editors.effects.trails.pixel-dust'), icon: Zap },
    ]

    const backgrounds = [
        { id: 'none', name: t('editors.effects.backgrounds.none') },
        { id: 'noise', name: t('editors.effects.backgrounds.noise') },
        { id: 'aurora', name: t('editors.effects.backgrounds.aurora') },
        { id: 'liquid', name: t('editors.effects.backgrounds.liquid') },
        { id: 'metaballs', name: t('editors.effects.backgrounds.metaballs') },
        { id: 'vintage', name: t('editors.effects.backgrounds.vintage') },
        { id: 'universe', name: t('editors.effects.backgrounds.universe') },
        { id: 'grid-move', name: t('editors.effects.backgrounds.grid-move') },
        { id: 'stars', name: t('editors.effects.backgrounds.stars') },
    ]

    return (
        <div className="space-y-12 pb-20">
            <EditorHeader 
                title={t('editors.effects.title') || "Efeitos & Animação"}
                subtitle={t('editors.effects.subtitle') || "Personalize a alma do seu mural"}
                onClose={onClose}
            />

            <EditorSection title={t('editors.effects.cursor_title')}>
                <GridSelector
                    id="cursor-effects"
                    options={cursors.map(c => ({ id: c.id, label: c.name, icon: c.icon }))}
                    activeId={profile.customCursor || 'auto'}
                    onChange={(id) => handleUpdate('customCursor', id)}
                    variant="ghost"
                    columns={5}
                />
            </EditorSection>

            <EditorSection title={t('editors.effects.trails_title')}>
                <GridSelector
                    id="trail-effects"
                    options={trails.map(tInfo => ({ id: tInfo.id, label: tInfo.name, icon: tInfo.icon }))}
                    activeId={profile.mouseTrails || 'none'}
                    onChange={(id) => handleUpdate('mouseTrails', id)}
                    variant="ghost"
                    columns={4}
                />
            </EditorSection>

            <EditorSection title={t('editors.effects.atmosphere_title')}>
                <ListSelector
                    id="atmosphere-effects"
                    options={backgrounds.map(b => ({ id: b.id, label: b.name }))}
                    activeId={profile.backgroundEffect || 'none'}
                    onChange={(id) => handleUpdate('backgroundEffect', id)}
                />
            </EditorSection>

            <div className="h-6 flex items-center justify-center">
                {/* Sincronização gerida pelo Layout Central */}

                {showSuccess && (
                    <div className="flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                        <Check className="w-3.5 h-3.5" />
                        {t('editors.effects.deployed')}
                    </div>
                )}
            </div>
        </div>
    )
}
