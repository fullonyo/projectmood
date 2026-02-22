import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getRelativeTime(date: Date | string | null | undefined, t?: (key: string) => string): string {
    if (!date) return t ? t('publish.never_published') : 'Never'
    const now = new Date()
    const published = new Date(date)
    const diff = Math.floor((now.getTime() - published.getTime()) / 1000)

    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
}
