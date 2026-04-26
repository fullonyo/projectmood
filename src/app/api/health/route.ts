import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Teste simples de conexão com o banco
        await prisma.$queryRaw`SELECT 1`
        
        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            database: "connected",
            service: "moodspace-api"
        }, { status: 200 })
    } catch (error) {
        console.error("Health check failed:", error)
        return NextResponse.json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            database: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 503 })
    }
}
