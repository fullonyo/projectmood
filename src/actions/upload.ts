"use server"

import { generatePresignedUrl } from "@/lib/r2"
import { auth } from "@/auth"

/**
 * Server Action para gerar uma Presigned URL para upload direto pro Cloudflare R2
 * Garante que apenas usuários autenticados possam requisitar a URL de upload.
 */
export async function getUploadUrl(contentType: string, prefix: string = "uploads") {
    try {
        const session = await auth()
        if (!session?.user) {
            return { error: "Não autorizado" }
        }

        const { uploadUrl, key, publicUrl } = await generatePresignedUrl(contentType, prefix)

        return { success: true, uploadUrl, key, publicUrl }
    } catch (error) {
        console.error("Erro ao gerar URL de upload:", error)
        return { error: "Falha ao gerar URL de upload seguro" }
    }
}
