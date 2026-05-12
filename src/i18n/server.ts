import { cookies } from 'next/headers';
import { dictionaries, Locale } from './config';

export async function getServerTranslation() {
    const cookieStore = await cookies();
    const locale = (cookieStore.get('mood_locale')?.value as Locale) || 'pt';
    const dict = dictionaries[locale] || dictionaries.pt;

    const t = (path: string): string => {
        const keys = path.split('.');
        let current: Record<string, unknown> | string = dict as unknown as Record<string, unknown>;
        for (const key of keys) {
            const obj = current as Record<string, unknown>;
            if (!obj || obj[key] === undefined) return path;
            current = obj[key] as Record<string, unknown> | string;
        }
        return current as string;
    };

    return { t, dict, locale };
}
