"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function getAdminAnalytics() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        const now = new Date()
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const last48h = new Date(now.getTime() - 48 * 60 * 60 * 1000)
        const last14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

        const [totalUsers, newUsers24h, prevNewUsers24h, activeProfiles7d, prevActiveProfiles7d, bannedCount] = await Promise.all([
            prisma.user.count({ where: { deletedAt: null } }),
            prisma.user.count({ where: { createdAt: { gte: last24h }, deletedAt: null } }),
            prisma.user.count({ where: { createdAt: { gte: last48h, lt: last24h }, deletedAt: null } }),
            prisma.profile.count({ where: { updatedAt: { gte: last7d }, deletedAt: null } }),
            prisma.profile.count({ where: { updatedAt: { gte: last14d, lt: last7d }, deletedAt: null } }),
            prisma.user.count({ where: { isBanned: true, deletedAt: null } })
        ])

        const viewStats = await prisma.profileAnalytics.aggregate({
            _sum: { views: true },
            _max: { views: true },
            where: { profile: { deletedAt: null } }
        })

        const blockUsage = await prisma.moodBlock.groupBy({
            where: { deletedAt: null },
            by: ['type'],
            _count: { _all: true },
            orderBy: { _count: { type: 'desc' } },
            take: 10
        })

        const registrations = await prisma.user.findMany({
            where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null },
            select: { createdAt: true }
        })

        const growthData = Array.from({ length: 30 }).map((_, i) => {
            const date = new Date(now)
            date.setDate(date.getDate() - (29 - i))
            date.setHours(0, 0, 0, 0)

            const count = registrations.filter((u: { createdAt: Date }) => {
                const userDate = new Date(u.createdAt)
                userDate.setHours(0, 0, 0, 0)
                return userDate.getTime() === date.getTime()
            }).length

            return {
                label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                count
            }
        })

        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            where: { deletedAt: null },
            _count: { _all: true }
        })

        const recentUsers = await prisma.user.findMany({
            where: { deletedAt: null },
            take: 8,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                createdAt: true,
                role: true,
                isBanned: true
            }
        })

        return {
            metrics: {
                totalUsers,
                newUsers24h: {
                    current: newUsers24h,
                    prev: prevNewUsers24h
                },
                activeProfiles7d: {
                    current: activeProfiles7d,
                    prev: prevActiveProfiles7d
                },
                bannedCount,
                totalViews: viewStats._sum.views || 0,
                maxViewsInOneProfile: viewStats._max.views || 0,
            },
            growthData,
            roleDistribution: usersByRole.map((r: { role: string; _count: { _all: number } }) => ({ role: r.role, count: r._count._all })),
            verificationDistribution: await prisma.user.groupBy({
                by: ['verificationType'],
                where: { deletedAt: null, isVerified: true },
                _count: { _all: true }
            }),
            blockUsage: blockUsage.map((b: { type: string; _count: { _all: number } }) => ({
                type: b.type,
                count: b._count._all
            })),
            recentUsers
        }
    } catch (error) {
        console.error("[getAdminAnalytics] Error:", error)
        throw new Error("Failed to fetch analytics")
    }
}
