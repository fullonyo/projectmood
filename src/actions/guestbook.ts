"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

const ADJECTIVES = [
    "Galáctico", "Vintage", "Grunge", "Punk", "Aesthetic",
    "Radiante", "Místico", "Neon", "Retrô", "Cibernético",
    "Onírico", "Lúdico", "Minimalista", "Efervescente", "Sônico"
]

const NOUNS = [
    "Gato", "Nuvem", "Mural", "Pixel", "Scrapbook",
    "Washi Tape", "Cassete", "Synth", "Doodle", "Satélite",
    "Cometa", "Prisma", "Vibe", "Eco", "Sonho"
]

function generateAnonymousName() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
    return `${noun} ${adj}`
}

export async function addGuestbookMessage(blockId: string, content: string) {
    const session = await auth()

    // Buscar o dono do bloco para marcar se é admin
    const block = await prisma.moodBlock.findUnique({
        where: { id: blockId },
        select: { userId: true }
    })

    if (!block) return { error: "Bloco não encontrado" }

    const author = (session?.user as any)?.name || (session?.user as any)?.username || generateAnonymousName()
    const isAdmin = session?.user?.id === block.userId

    try {
        const message = await (prisma as any).guestbookMessage.create({
            data: {
                content,
                author,
                isAdmin,
                blockId,
                userId: session?.user?.id || null
            }
        })

        revalidatePath("/dashboard")
        revalidatePath("/[username]", "page")

        return { success: true, message }
    } catch (error) {
        return { error: "Falha ao enviar mensagem" }
    }
}

export async function getGuestbookMessages(blockId: string) {
    try {
        const messages = await (prisma as any).guestbookMessage.findMany({
            where: { blockId },
            orderBy: { createdAt: 'desc' }
        })
        return messages
    } catch (error) {
        return []
    }
}
