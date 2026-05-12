"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, dictionaries } from './config';
import { Dictionary, pt } from './dictionaries/pt';

interface I18nContextProps {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    dict: Dictionary;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('pt');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Run only on client
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setIsMounted(true);
        const storedLocale = localStorage.getItem('mood_locale') as Locale;
        if (storedLocale && dictionaries[storedLocale]) {
            setLocaleState(storedLocale);
        } else {
            // Optional: detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (browserLang === 'en') {
                setLocaleState('en');
            }
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('mood_locale', newLocale);
    };

    // Helper to resolve nested keys like "sidebar.header_title"
    const t = (path: string): string => {
        const keys = path.split('.');
        let current: Record<string, unknown> | string = dictionaries[locale] as unknown as Record<string, unknown>;

        for (const key of keys) {
            const obj = current as Record<string, unknown>;
            if (obj[key] === undefined) {
                console.warn(`Translation key missing: ${path} for locale: ${locale}`);
                return path;
            }
            current = obj[key] as Record<string, unknown> | string;
        }

        return current as string;
    };

    // Hydration mismatch prevention helper. We render in Portuguese during SSR.
    if (!isMounted) {
        return (
            <I18nContext.Provider value={{ locale: 'pt', setLocale, t: (k) => tBase('pt', k), dict: pt }}>
                {children}
            </I18nContext.Provider>
        )
    }

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, dict: dictionaries[locale] }}>
            {children}
        </I18nContext.Provider>
    );
}

// SSR helper
function tBase(locale: 'pt', path: string): string {
    const keys = path.split('.');
    let current: Record<string, unknown> | string = dictionaries[locale] as unknown as Record<string, unknown>;
    for (const key of keys) {
        const obj = current as Record<string, unknown>;
        if (obj[key] === undefined) return path;
        current = obj[key] as Record<string, unknown> | string;
    }
    return current as string;
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
}

