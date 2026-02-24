"use client"

import { cn } from "@/lib/utils"
import { Profile } from "@/types/database"
import { themeConfigs } from "@/lib/themes"
import { BackgroundEffect } from "../effects/background-effect"
import { getStaticTextureStyle } from "../effects/static-textures"

interface RoomEnvironmentProps {
    profile: Profile
    backgroundEffect: string
    weatherSync?: string | null
}

export function RoomEnvironment({ profile, backgroundEffect, weatherSync }: RoomEnvironmentProps) {
    const themeConfig = themeConfigs[profile.theme as keyof typeof themeConfigs] || themeConfigs.light
    const bgColor = profile.backgroundColor || themeConfig.bg || "#ffffff"
    const resolvedPrimaryColor = profile.primaryColor || themeConfig.primary || "#000000"
    const textureStyles = getStaticTextureStyle(profile.staticTexture || 'none', resolvedPrimaryColor)

    // Detecção de clima para atmosfera automática (sutil)
    // Se não houver efeito de fundo, sintoniza com o clima detectado no canvas (chuva, neve, vento)
    const weatherEffects = ['rain', 'snow', 'wind']
    const activeAtmosphere = backgroundEffect !== 'none'
        ? backgroundEffect
        : (weatherSync && weatherEffects.includes(weatherSync) ? weatherSync : 'none')

    const atmosphereOpacity = backgroundEffect === 'none' && weatherSync && weatherEffects.includes(weatherSync)
        ? 'opacity-20' // Clima sutil se for automático
        : 'opacity-100' // Opacidade total se for efeito escolhido

    return (
        <div
            className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[var(--room-bg)] transition-colors duration-700"
            style={{
                '--room-bg': bgColor,
                filter: themeConfig.filter || 'none',
                ...textureStyles // Injecting --room-texture variables
            } as React.CSSProperties}
        >
            {/* Layer 1: Animated Effects (The aura) */}
            <div className={cn("absolute inset-0 z-[1] transition-opacity duration-1000", atmosphereOpacity)}>
                <BackgroundEffect
                    type={activeAtmosphere}
                    primaryColor={resolvedPrimaryColor}
                />
            </div>

            {/* Layer 2: Grid Structure (Injected SVGs or gradients) */}
            <div
                className={cn(
                    "absolute inset-0 transition-opacity duration-1000 z-[2]",
                    themeConfig.blend || 'mix-blend-normal',
                    themeConfig.gridOpacity || 'opacity-10'
                )}
                style={{
                    backgroundImage: themeConfig.grid,
                    backgroundSize: themeConfig.bgSize,
                    color: profile.primaryColor || themeConfig.primary
                }}
            />

            {/* Layer 3: Skin/Material (Pseudo-element behavior but rendered cleanly via inline background) */}
            {profile.staticTexture && profile.staticTexture !== 'none' && (
                <div
                    className="absolute inset-0 z-[3] transition-opacity duration-1000"
                    style={{
                        backgroundImage: `var(--room-texture-img)`,
                        opacity: `var(--room-texture-opacity)`,
                        filter: `var(--room-texture-filter)`,
                        mixBlendMode: `var(--room-texture-blend)` as any,
                        color: profile.primaryColor || themeConfig.primary
                    }}
                />
            )}
        </div>
    )
}
