import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const roomId = searchParams.get('roomId') || searchParams.get('profileId')

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
        }

        const analytics = await prisma.roomAnalytics.findUnique({
            where: { roomId }
        })

        return NextResponse.json({
            views: analytics?.views || 0,
            lastViewAt: analytics?.lastViewAt
        })
    } catch (error) {
        console.error('Analytics fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
