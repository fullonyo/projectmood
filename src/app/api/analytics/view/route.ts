import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { roomId } = await req.json()

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
        }

        const analytics = await prisma.roomAnalytics.upsert({
            where: { roomId },
            update: {
                views: { increment: 1 },
                lastViewAt: new Date()
            },
            create: {
                roomId,
                views: 1,
                lastViewAt: new Date()
            }
        })

        return NextResponse.json({ success: true, views: analytics.views })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const roomId = searchParams.get('roomId')

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
