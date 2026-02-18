import { z } from 'zod'

// Validação de tipos de blocos permitidos
export const MoodBlockTypeSchema = z.enum([
    'text',
    'ticker',
    'subtitle',
    'floating',
    'gif',
    'video',
    'social',
    'guestbook',
    'tape',
    'doodle',
    'weather',
    'media',
    'music'
])

// Validação de conteúdo de bloco (JSON flexível)
export const MoodBlockContentSchema = z.any()

// Validação de posicionamento no canvas
export const CanvasPositionSchema = z.object({
    x: z.number().min(0).max(100).optional(),
    y: z.number().min(0).max(100).optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional()
})

// Validação para criar bloco
export const CreateMoodBlockSchema = z.object({
    type: MoodBlockTypeSchema,
    content: MoodBlockContentSchema,
    options: CanvasPositionSchema.optional()
})

// Validação para atualizar layout de bloco
export const UpdateMoodBlockLayoutSchema = z.object({
    x: z.number().min(0).max(100).optional(),
    y: z.number().min(0).max(100).optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    zIndex: z.number().int().optional(),
    rotation: z.number().optional(),
    content: MoodBlockContentSchema.optional()
})

// Validação de mensagem do guestbook
export const GuestbookMessageSchema = z.object({
    content: z.string().min(1, "Mensagem não pode ser vazia").max(500, "Mensagem muito longa (máx. 500 caracteres)"),
    blockId: z.string().cuid("ID de bloco inválido")
})

// Validação de perfil
export const ProfileUpdateSchema = z.object({
    theme: z.enum(['light', 'dark', 'vintage', 'notebook', 'blueprint', 'canvas', 'cyberpunk']).optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional(),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional(),
    fontStyle: z.enum(['sans', 'serif', 'mono']).optional()
})

// Types exportados
export type MoodBlockType = z.infer<typeof MoodBlockTypeSchema>
export type CreateMoodBlockInput = z.infer<typeof CreateMoodBlockSchema>
export type UpdateMoodBlockLayoutInput = z.infer<typeof UpdateMoodBlockLayoutSchema>
export type GuestbookMessageInput = z.infer<typeof GuestbookMessageSchema>
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>
