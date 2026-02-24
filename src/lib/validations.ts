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
    'music',
    'quote',
    'photo',
    'moodStatus',
    'countdown',
    'shape'
])

// Validação de conteúdo de bloco (JSON flexível)
export const MoodBlockContentSchema = z.any()

// Validação de posicionamento no canvas
export const CanvasPositionSchema = z.object({
    x: z.number().min(0).max(100).optional(),
    y: z.number().min(0).max(100).optional(),
    width: z.number().positive().int().max(2000).optional(),
    height: z.number().positive().int().max(2000).optional()
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
    width: z.number().positive().int().max(2000).optional(),
    height: z.number().positive().int().max(2000).optional(),
    zIndex: z.number().int().optional(),
    rotation: z.number().optional(),
    isLocked: z.boolean().optional(),
    isHidden: z.boolean().optional(),
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
    fontStyle: z.enum(['sans', 'serif', 'mono']).optional(),
    customCursor: z.enum(['auto', 'retro', 'heart', 'pixel', 'ghost']).optional(),
    mouseTrails: z.enum(['none', 'sparkles', 'ghost', 'pixel-dust', 'emoji']).optional(),
    backgroundEffect: z.enum(['none', 'noise', 'aurora', 'liquid', 'mesh-gradient', 'metaballs', 'hyperspeed', 'grid-move', 'stars', 'rain', 'rhythm', 'vintage', 'universe']).optional(),
    staticTexture: z.enum(['none', 'museum-paper', 'raw-canvas', 'fine-sand']).optional(),
    customFont: z.string().optional(),
    avatarUrl: z.string().optional()
})

// Validação específica para Quote Block
export const QuoteBlockContentSchema = z.object({
    text: z.string().min(1, "Citação não pode ser vazia").max(500, "Citação muito longa"),
    author: z.string().max(100).optional(),
    style: z.enum(['minimal', 'bold', 'serif', 'modern']).default('minimal'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    showQuotes: z.boolean().default(true)
})

// Validação específica para Photo Block
export const PhotoBlockContentSchema = z.object({
    imageUrl: z.string().min(1, "Imagem é obrigatória"),
    alt: z.string().max(200).optional(),
    filter: z.enum(['none', 'vintage', 'bw', 'warm', 'cool']).default('none'),
    frame: z.enum(['none', 'polaroid', 'polaroid-dark', 'frame', 'minimal', 'round']).default('none'),
    caption: z.string().max(100).optional()
})

// Validação específica para Mood Status Block
export const MoodStatusBlockContentSchema = z.object({
    emoji: z.string().min(1, "Emoji é obrigatório"),
    text: z.string().min(1, "Texto não pode ser vazio").max(50, "Máximo 50 caracteres"),
    timestamp: z.string().optional()
})

// Validação específica para Countdown Block
export const CountdownBlockContentSchema = z.object({
    title: z.string().min(1, "Título é obrigatório").max(50, "Máximo 50 caracteres"),
    targetDate: z.string().min(1, "Data é obrigatória"),
    emoji: z.string().optional(),
    style: z.enum(['minimal', 'bold', 'neon']).default('minimal')
})

// Validação específica para Guestbook Block
export const GuestbookBlockContentSchema = z.object({
    title: z.string().min(1, "Título é obrigatório").max(50, "Máximo 50 caracteres"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    style: z.enum(['glass', 'vhs', 'cyber', 'paper']).default('glass'),
    layoutMode: z.enum(['classic', 'scattered', 'cloud']).default('classic'),
    density: z.number().min(0.5).max(2).default(1),
    opacity: z.number().min(0).max(1).default(1),
    blendMode: z.string().default('normal')
})

// Types exportados
export type MoodBlockType = z.infer<typeof MoodBlockTypeSchema>
export type CreateMoodBlockInput = z.infer<typeof CreateMoodBlockSchema>
export type UpdateMoodBlockLayoutInput = z.infer<typeof UpdateMoodBlockLayoutSchema>
export type GuestbookMessageInput = z.infer<typeof GuestbookMessageSchema>
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>
export type QuoteBlockContent = z.infer<typeof QuoteBlockContentSchema>
export type PhotoBlockContent = z.infer<typeof PhotoBlockContentSchema>
export type MoodStatusBlockContent = z.infer<typeof MoodStatusBlockContentSchema>
export type CountdownBlockContent = z.infer<typeof CountdownBlockContentSchema>
export type GuestbookBlockContent = z.infer<typeof GuestbookBlockContentSchema>
