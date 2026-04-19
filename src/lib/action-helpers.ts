// Server Action Helpers — importado por módulos com "use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import { CACHE_TAGS } from "@/lib/cache-tags"

// ─── Error Types ──────────────────────────────────────────────────────────────

/**
 * Erro de autenticação/autorização nas Server Actions.
 * Permite diferenciar erros de auth de erros genéricos.
 */
export class ActionError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "ActionError"
    }
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

/**
 * Verifica se existe uma sessão autenticada e retorna-a.
 * Lança ActionError se não houver sessão válida.
 *
 * @example
 * const session = await requireAuth()
 * // session.user.id está garantido
 */
export async function requireAuth() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new ActionError("Não autorizado")
    }
    return session
}

/**
 * Verifica se o usuário autenticado é ADMIN.
 * Lança ActionError caso não seja.
 */
export async function requireAdmin() {
    const session = await requireAuth()
    if ((session.user as any)?.role !== "ADMIN") {
        throw new ActionError("Unauthorized Access: Admin role required.")
    }
    return session
}

// ─── User Lookup ──────────────────────────────────────────────────────────────

/**
 * Busca o username do usuário pelo ID.
 * Centraliza o `select: { username: true }` que se repete em todas as actions.
 */
export async function getUsernameById(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true }
    })
    return user?.username ?? null
}

// ─── Revalidation ─────────────────────────────────────────────────────────────

/**
 * Revalida cache do perfil e dashboard.
 * Centraliza o padrão de revalidação que se repete em todas as actions.
 *
 * @param username - Username para revalidar cache específico (opcional)
 * @param extraPaths - Paths adicionais para revalidar (ex: "/admin/audit")
 */
export function revalidateProfile(username?: string | null, extraPaths?: string[]) {
    if (username) {
        revalidateTag(CACHE_TAGS.profile(username), 'default')
    }
    revalidatePath("/dashboard")

    if (extraPaths) {
        for (const path of extraPaths) {
            revalidatePath(path)
        }
    }
}

// ─── Action Wrapper ───────────────────────────────────────────────────────────

type ActionResult<T> = T | { error: string }

/**
 * Wrapper para Server Actions com autenticação automática.
 * Encapsula o padrão try/catch + auth + revalidação.
 *
 * Segue o padrão Next.js de Server Actions com retorno seguro
 * (nunca lança exceptions para o cliente — sempre retorna `{ error }` ou `{ success }`).
 *
 * @example
 * export const myAction = withAuth(async (session) => {
 *     // session está garantida
 *     const username = await getUsernameById(session.user.id)
 *     // ... lógica ...
 *     revalidateProfile(username)
 *     return { success: true }
 * })
 */
export function withAuth<TArgs extends any[], TResult>(
    fn: (session: Awaited<ReturnType<typeof auth>> & { user: { id: string } }, ...args: TArgs) => Promise<TResult>
) {
    return async (...args: TArgs): Promise<ActionResult<TResult>> => {
        try {
            const session = await requireAuth()
            return await fn(session as any, ...args)
        } catch (e) {
            if (e instanceof ActionError) {
                return { error: e.message }
            }
            throw e
        }
    }
}
