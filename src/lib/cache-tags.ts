/**
 * cache-tags.ts
 * 
 * Centraliza todas as chaves e tags de cache do sistema para evitar 
 * "magic strings" espalhadas pelo código e garantir que a invalidação 
 * ocorra de forma consistente.
 */

export const CACHE_TAGS = {
    // Perfis públicos
    profile: (username: string) => `profile:${username}`,

    // Lista de blocos do usuário (draft)
    blocks: (userId: string) => `blocks:${userId}`,

    // Configurações globais do sistema
    systemConfig: "system-config",

    // Analytics
    analytics: "admin-analytics",

    // Guestbook
    guestbook: (blockId: string) => `guestbook:${blockId}`,
} as const;

export const CACHE_KEYS = {
    profile: (username: string) => `profile-${username}`,
    systemConfig: "system-config-data",
} as const;
