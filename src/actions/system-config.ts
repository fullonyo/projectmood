"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// Core blocks definition to map
const CORE_BLOCKS = [
    { key: "block_text", name: "Text Notes", description: "Basic text notes block.", isEnabled: true, isPremium: false },
    { key: "block_phrase", name: "News Ticker", description: "Scrolling text banner (Phrase).", isEnabled: true, isPremium: false },
    { key: "block_quote", name: "Quotes", description: "Stylized quote block.", isEnabled: true, isPremium: false },
    { key: "block_photo", name: "Photo Polaroids", description: "Image upload and display block.", isEnabled: true, isPremium: false },
    { key: "block_youtube", name: "YouTube Player", description: "Embed YouTube videos.", isEnabled: true, isPremium: false },
    { key: "block_spotify", name: "Spotify Player", description: "Embed Spotify tracks and playlists.", isEnabled: true, isPremium: false },
    { key: "block_gif", name: "GIF Picker", description: "Tenor GIF integration.", isEnabled: true, isPremium: false },
    { key: "block_doodle", name: "Doodle Board", description: "Interactive drawing surface.", isEnabled: true, isPremium: false },
    { key: "block_guestbook", name: "Guestbook", description: "Allow visitors to leave messages.", isEnabled: true, isPremium: false },
    { key: "block_countdown", name: "Countdown Timer", description: "Event count-down countdown.", isEnabled: true, isPremium: false },
    { key: "block_moodStatus", name: "Mood Status", description: "Current mood and activity status.", isEnabled: true, isPremium: false },
    { key: "block_weather", name: "Weather Status", description: "Display current location weather.", isEnabled: true, isPremium: false },
    { key: "block_social", name: "Social Links", description: "External social media profile links.", isEnabled: true, isPremium: false },
    { key: "block_media", name: "Media Collection", description: "Books, movies, and games collection.", isEnabled: true, isPremium: false },
    { key: "block_tape", name: "Washi Tape", description: "Decorative decorative tape elements.", isEnabled: true, isPremium: false },
    { key: "block_subtitle", name: "Floating Captions", description: "Small subtitle-style text overlays.", isEnabled: true, isPremium: false },
    { key: "block_floating", name: "Floating Elements", description: "Experimental floating canvas elements.", isEnabled: true, isPremium: false },
]

// 1. Safe Seeder (Run on demand by Admin)
export async function seedFeatureFlags() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }

    try {
        let count = 0
        // 1a. Cleanup orphan flags (old keys that no longer exist in CORE_BLOCKS)
        const validKeys = CORE_BLOCKS.map(b => b.key)
        await prisma.featureFlag.deleteMany({
            where: {
                key: { notIn: validKeys }
            }
        })


        for (const flag of CORE_BLOCKS) {
            await prisma.featureFlag.upsert({
                where: { key: flag.key },
                update: {
                    name: flag.name,
                    description: flag.description
                },
                create: flag
            })
            count++
        }
        revalidatePath("/admin/config")

        // Log the action
        await prisma.auditLog.create({
            data: {
                adminId: session.user.id,
                action: "SYNC_FLAGS",
                targetId: "SYSTEM",
                targetType: "FeatureFlag",
                metadata: { updatedCount: count }
            }
        });

        return { success: true, count }
    } catch (error) {
        console.error("[seedFeatureFlags]", error)
        return { error: "Failed to seed flags" }
    }
}

// 2. Fetcher (Optimized for frontend cache)
export async function getFeatureFlags() {
    try {
        const flags = await prisma.featureFlag.findMany()
        return flags
    } catch (error) {
        // Se a tabela não existir ainda ou erro de BD, assumimos que tudo funciona
        // para não quebrar a plataforma inteira num bug de rede.
        console.error("[getFeatureFlags]", error)
        return []
    }
}

// 3. Toggles (Admin Only)
export async function toggleFeatureFlag(key: string, field: "isEnabled" | "isPremium", currentValue: boolean) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }

    try {
        await prisma.featureFlag.update({
            where: { key },
            data: { [field]: !currentValue }
        })
        revalidatePath("/admin/config")
        revalidatePath("/dashboard")

        // Log the action
        await prisma.auditLog.create({
            data: {
                adminId: session.user.id,
                action: "UPDATE_FLAG",
                targetId: key,
                targetType: "FeatureFlag",
                metadata: { field, value: !currentValue }
            }
        });

        return { success: true }
    } catch (error) {
        console.error("[toggleFeatureFlag]", error)
        return { error: "Failed to toggle flag" }
    }
}
