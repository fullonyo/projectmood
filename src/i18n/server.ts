import { cookies } from 'next/headers';
import { dictionaries, Locale } from './context';

export async function getServerTranslation() {
    const cookieStore = await cookies();
    const locale = (cookieStore.get('mood_locale')?.value as Locale) || 'pt';
    const dict = dictionaries[locale] || dictionaries.pt;

    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = dict;
        for (const key of keys) {
            if (!current || current[key] === undefined) return path;
            current = current[key];
        }
        return current as string;
    };

    return { t, dict, locale };
}
