"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Secure wrapper for admin actions
async function requireAdmin() {
    const session = await auth()
    if ((session?.user as any)?.role !== "ADMIN") {
        throw new Error("Unauthorized Access: Admin role required.")
    }
    return session
}

export async function toggleBanUser(userId: string, currentStatus: boolean) {
    await requireAdmin()

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isBanned: !currentStatus }
        })
        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        console.error("[toggleBanUser]", error)
        return { error: "Failed to update ban status" }
    }
}
