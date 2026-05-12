import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from "uuid"

// Verifica se as variáveis de ambiente necessárias existem (mas não falha na compilação, permite fallback)
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ""
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ""
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ""
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || ""
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "" // ex: https://pub-xxxx.r2.dev

export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
})

/**
 * Gera uma Presigned URL (URL assinada temporária) para upload direto para o R2.
 * @param contentType O tipo MIME do arquivo (ex: 'image/jpeg', 'audio/mpeg')
 * @param prefix Um prefixo opcional para organizar as pastas no bucket (ex: 'avatars', 'photos')
 * @returns { url: string, key: string, publicUrl: string }
 */
export async function generatePresignedUrl(contentType: string, prefix: string = "uploads") {
    if (!R2_ACCOUNT_ID || !R2_BUCKET_NAME) {
        throw new Error("Configurações do Cloudflare R2 ausentes no servidor.")
    }

    const extension = contentType.split("/")[1] || "bin"
    const uniqueId = uuidv4()
    const key = `${prefix}/${uniqueId}.${extension}` // ex: avatars/123e4567-e89b-12d3.jpg

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        // O R2 não suporta nativamente ACL 'public-read' via SDK em todos os casos, a exposição é feita via Custom Domain no painel
    })

    // URL válida por 5 minutos (300 segundos) para fazer o PUT
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 })

    const publicUrl = `${R2_PUBLIC_URL}/${key}`

    return { uploadUrl: signedUrl, key, publicUrl }
}
