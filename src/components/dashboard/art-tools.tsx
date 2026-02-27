"use client"

import { useState, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import {
    StickyNote,
    Cloud,
    Book,
    Film,
    Plus,
    Sun,
    CloudRain,
    Snowflake,
    Wind,
    Palette,
    Sparkles,
    Upload,
    Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/i18n/context"

const TAPE_DATA = [
    { id: 'classic_white', color: 'rgba(255, 255, 255, 0.4)', pattern: 'none' },
    { id: 'vintage_paper', color: 'rgba(245, 245, 220, 0.6)', pattern: 'grain' },
    { id: 'sky_blue', color: 'rgba(186, 225, 255, 0.5)', pattern: 'none' },
    { id: 'rose_petal', color: 'rgba(255, 179, 186, 0.5)', pattern: 'none' },
    { id: 'mint_leaf', color: 'rgba(186, 255, 201, 0.5)', pattern: 'none' },
    { id: 'washi_dot', color: 'rgba(255, 255, 255, 0.5)', pattern: 'dots' },
]

export function ArtTools({ highlight }: { highlight?: boolean }) {
    const { t } = useTranslation()
    const [isPending, startTransition] = useTransition()

    // Form states for Weather
    const [weatherLoc, setWeatherLoc] = useState("")
    const [weatherVibe, setWeatherVibe] = useState("")

    // Form states for Media
    const [mediaTitle, setMediaTitle] = useState("")
    const [mediaReview, setMediaReview] = useState("")
    const [mediaCategory, setMediaCategory] = useState<'book' | 'movie'>('book')

    const WEATHER_OPTIONS = [
        { icon: Sun, id: 'sun', vibe: t('editors.art.weather_vibes.sun') },
        { icon: CloudRain, id: 'rain', vibe: t('editors.art.weather_vibes.rain') },
        { icon: Snowflake, id: 'snow', vibe: t('editors.art.weather_vibes.snow') },
        { icon: Cloud, id: 'cloud', vibe: t('editors.art.weather_vibes.cloud') },
        { icon: Wind, id: 'wind', vibe: t('editors.art.weather_vibes.wind') },
    ]

    const addTape = (tapeId: string, color: string, pattern: string) => {
        startTransition(async () => {
            await addMoodBlock('tape', {
                color: color,
                pattern: pattern
            }, { width: 140, height: 35 })
        })
    }

    const handleAddWeather = () => {
        if (!weatherLoc || !weatherVibe) return
        startTransition(async () => {
            await addMoodBlock('weather', {
                location: weatherLoc,
                vibe: weatherVibe
            }, { width: 220, height: 100 })
            setWeatherLoc("")
            setWeatherVibe("")
        })
    }

    const handleAddMedia = () => {
        if (!mediaTitle || !mediaReview) return
        startTransition(async () => {
            await addMoodBlock('media', {
                title: mediaTitle,
                category: mediaCategory,
                review: mediaReview
            }, { width: 200, height: 150 })
            setMediaTitle("")
            setMediaReview("")
        })
    }

    return (
        <div className={cn(
            "space-y-12 transition-all duration-500",
            highlight ? "border-2 border-black dark:border-white p-6 -m-6 bg-zinc-50 dark:bg-zinc-900/50" : ""
        )}>
            {/* Material Substrates Section */}
            <section className="space-y-6">
                <header className="flex items-center gap-2 opacity-30 px-1">
                    <Activity className="w-3 h-3 text-black dark:text-white" />
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em]">{t('editors.art.tape_title')}</h3>
                </header>

                <div className="grid grid-cols-6 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border border-zinc-200 dark:border-zinc-800">
                    {TAPE_DATA.map((tape) => (
                        <button
                            key={tape.id}
                            onClick={() => addTape(tape.id, tape.color, tape.pattern)}
                            disabled={isPending}
                            title={t(`editors.art.tapes.${tape.id as any}`)}
                            className="aspect-square flex items-center justify-center bg-white dark:bg-zinc-950 transition-all group relative overflow-hidden"
                        >
                            <div
                                className="absolute inset-2 border border-black/5 dark:border-white/5 transition-all group-hover:inset-1"
                                style={{
                                    backgroundColor: tape.color,
                                    backgroundImage: tape.pattern === 'dots' ? 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)' : 'none',
                                    backgroundSize: '4px 4px'
                                }}
                            />
                            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </section>


            {/* Curation Manifesto Section */}
            <section className="space-y-6">
                <header className="flex items-center gap-2 opacity-30 px-1">
                    <Activity className="w-3 h-3 text-black dark:text-white" />
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em]">{t('editors.art.media_title')}</h3>
                </header>

                <div className="border border-zinc-200 dark:border-zinc-800 p-0 bg-transparent">
                    <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 gap-[1px] border-b border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setMediaCategory('book')}
                            className={cn(
                                "py-4 text-[7px] font-black uppercase tracking-[0.3em] transition-all relative group",
                                mediaCategory === 'book' ? "bg-white dark:bg-zinc-950 text-black dark:text-white font-black" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                        >
                            {mediaCategory === 'book' && <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black dark:border-white" />}
                            {t('editors.art.media_book')}
                        </button>
                        <button
                            onClick={() => setMediaCategory('movie')}
                            className={cn(
                                "py-4 text-[7px] font-black uppercase tracking-[0.3em] transition-all relative group",
                                mediaCategory === 'movie' ? "bg-white dark:bg-zinc-950 text-black dark:text-white font-black" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                        >
                            {mediaCategory === 'movie' && <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black dark:border-white" />}
                            {t('editors.art.media_movie')}
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="space-y-3">
                            <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">{t('editors.art.media_work_title')}</p>
                            <Input
                                placeholder={t('editors.art.media_work_title_placeholder')}
                                value={mediaTitle}
                                onChange={(e) => setMediaTitle(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none text-[10px] font-mono h-11 uppercase focus-visible:ring-0"
                            />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">{t('editors.art.media_critique')}</p>
                            <Input
                                placeholder={t('editors.art.media_critique_placeholder')}
                                value={mediaReview}
                                onChange={(e) => setMediaReview(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none text-[10px] uppercase font-mono h-11 focus-visible:ring-0"
                            />
                        </div>

                        <Button
                            onClick={handleAddMedia}
                            disabled={isPending || !mediaTitle || !mediaReview}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white rounded-none h-14 font-black uppercase tracking-[0.3em] text-[9px] border border-zinc-100 dark:border-zinc-800 transition-all relative group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black dark:border-white" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            {t('editors.art.media_deploy')}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

