/**
 * URL pública do site para metadados (OG, canonical).
 * NEXTAUTH_URL costuma ser localhost em dev/Docker — crawlers (Discord) precisam de URL absoluta acessível na internet.
 */
export function getPublicSiteUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
    if (explicit) return explicit

    const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "")
    if (vercel) return `https://${vercel}`

    const auth = process.env.NEXTAUTH_URL?.trim().replace(/\/$/, "")
    if (auth && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(auth)) {
        return auth
    }

    return "https://moodspace.com.br"
}
