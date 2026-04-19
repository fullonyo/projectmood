"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin, revalidateProfile } from "@/lib/action-helpers"

export async function getAuditFeed(page = 1, pageSize = 20) {
    await requireAdmin()

    try {
        const skip = (page - 1) * pageSize

        const [blocks, total] = await Promise.all([
            prisma.moodBlock.findMany({
                where: { deletedAt: null },
                take: pageSize,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            role: true,
                            isBanned: true
                        }
                    }
                }
            }),
            prisma.moodBlock.count({ where: { deletedAt: null } })
        ])

        return {
            blocks,
            pagination: {
                total,
                pages: Math.ceil(total / pageSize),
                currentPage: page
            }
        }
    } catch (error) {
        console.error("[getAuditFeed] Error:", error)
        throw new Error("Failed to fetch audit feed")
    }
}

export async function adminDeleteBlock(blockId: string) {
    const session = await requireAdmin()

    try {
        const block = await prisma.moodBlock.findUnique({
            where: { id: blockId },
            include: { user: true }
        });

        await prisma.moodBlock.update({
            where: { id: blockId },
            data: { deletedAt: new Date() }
        })

        await prisma.auditLog.create({
            data: {
                adminId: session.user.id,
                action: "DELETE_BLOCK",
                targetId: blockId,
                targetType: "MoodBlock",
                metadata: block ? { type: block.type, content: block.content, author: block.user.username } : {}
            }
        });

        revalidateProfile(block?.user?.username, ["/admin/audit", `/${block?.user?.username}`])
        return { success: true }
    } catch (error) {
        console.error("[adminDeleteBlock] Error:", error)
        return { error: "Failed to delete block" }
    }
}

export async function adminBanUser(userId: string, isBanned: boolean) {
    const session = await requireAdmin()

    try {
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true }
        })

        await prisma.user.update({
            where: { id: userId },
            data: { isBanned }
        })

        await prisma.auditLog.create({
            data: {
                adminId: session.user.id,
                action: isBanned ? "BAN_USER" : "UNBAN_USER",
                targetId: userId,
                targetType: "User",
                metadata: { username: targetUser?.username }
            }
        });

        revalidateProfile(targetUser?.username, ["/admin/audit", "/admin/users", ...(targetUser ? [`/${targetUser.username}`] : [])])

        return { success: true }
    } catch (error) {
        console.error("[adminBanUser] Error:", error)
        return { error: "Failed to update ban status" }
    }
}

export async function adminVerifyUser(userId: string, isVerified: boolean, type: string = "verified") {
    const session = await requireAdmin()

    try {
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true }
        })

        await prisma.user.update({
            where: { id: userId },
            data: {
                isVerified,
                verificationType: isVerified ? type : null
            }
        })

        await prisma.auditLog.create({
            data: {
                adminId: session.user.id,
                action: isVerified ? "VERIFY_USER" : "UNVERIFY_USER",
                targetId: userId,
                targetType: "User",
                metadata: {
                    type,
                    username: targetUser?.username
                }
            }
        });

        revalidateProfile(targetUser?.username, ["/admin/users", ...(targetUser ? [`/${targetUser.username}`] : [])])
        return { success: true }
    } catch (error) {
        console.error("[adminVerifyUser] Error:", error)
        return { error: "Failed to update verification status" }
    }
}

export async function getAuditLogs(page = 1, pageSize = 30, filters?: { action?: string; targetId?: string }) {
    await requireAdmin()

    try {
        const skip = (page - 1) * pageSize
        const where: import("@prisma/client").Prisma.AuditLogWhereInput = {}

        if (filters?.action) where.action = filters.action
        if (filters?.targetId) where.targetId = { contains: filters.targetId, mode: 'insensitive' }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                take: pageSize,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    admin: {
                        select: {
                            username: true,
                            role: true
                        }
                    }
                }
            }),
            prisma.auditLog.count({ where })
        ])

        return {
            logs,
            pagination: {
                total,
                pages: Math.ceil(total / pageSize),
                currentPage: page
            }
        }
    } catch (error) {
        console.error("[getAuditLogs] Error:", error)
        throw new Error("Failed to fetch audit logs")
    }
}
