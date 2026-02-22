"use client"

import { cn } from "@/lib/utils"
import { Profile } from "@/types/database"
import { themeConfigs } from "@/lib/themes"
import { BackgroundEffect } from "../effects/background-effect"
import { StaticTextures } from "../effects/static-textures"

interface RoomEnvironmentProps {
    profile: Profile
    backgroundEffect: string
}

export function RoomEnvironment({ profile, backgroundEffect }: RoomEnvironmentProps) {
    const themeConfig = themeConfigs[profile.theme as keyof typeof themeConfigs] || themeConfigs.light
    const bgColor = profile.backgroundColor || themeConfig.bg || "#ffffff"

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Layer 1: Base Color (The foundation) */}
            <div
                className="absolute inset-0 transition-colors duration-700"
                style={{
                    backgroundColor: bgColor,
                    filter: themeConfig.filter || 'none'
                }}
            />

            {/* Layer 2: Animated Effects (The aura) */}
            <div className="absolute inset-0 opacity-100 z-[1]">
                <BackgroundEffect
                    type={backgroundEffect as any}
                    primaryColor={profile.primaryColor || undefined}
                />
            </div>

            {/* Layer 3: Grid (The structure) */}
            <div
                className={cn(
                    "absolute inset-0 transition-opacity duration-1000 z-[2] mix-blend-overlay",
                    themeConfig.gridOpacity || 'opacity-10'
                )}
                style={{
                    backgroundImage: themeConfig.grid,
                    backgroundSize: themeConfig.bgSize,
                }}
            />

            {/* Layer 4: Material (The skin) */}
            <div className="absolute inset-0 z-[3]">
                <StaticTextures type={profile.staticTexture || 'none'} />
            </div>
        </div>
    )
}
