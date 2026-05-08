import { pt, Dictionary } from './dictionaries/pt';
import { en } from './dictionaries/en';

export type Locale = 'pt' | 'en';

export const dictionaries: Record<Locale, Dictionary> = { pt, en };

export const defaultLocale: Locale = 'pt';
