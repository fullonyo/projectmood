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
    Upload
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
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        <StickyNote className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.art.tape_title')}</h3>
                </div>

                <div className="grid grid-cols-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    {TAPE_DATA.map((tape) => (
                        <button
                            key={tape.id}
                            onClick={() => addTape(tape.id, tape.color, tape.pattern)}
                            disabled={isPending}
                            title={t(`editors.art.tapes.${tape.id as any}`)}
                            className="aspect-square border-r last:border-r-0 border-zinc-100 dark:border-zinc-900 transition-all hover:bg-black group relative"
                        >
                            <div
                                className="absolute inset-2 border border-black/10 transition-all group-hover:inset-1"
                                style={{
                                    backgroundColor: tape.color,
                                    backgroundImage: tape.pattern === 'dots' ? 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)' : 'none',
                                    backgroundSize: '4px 4px'
                                }}
                            />
                        </button>
                    ))}
                </div>
            </section>


            {/* Curation Manifesto Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        {mediaCategory === 'book' ? <Book className="w-3.5 h-3.5 text-black dark:text-white" /> : <Film className="w-3.5 h-3.5 text-black dark:text-white" />}
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.art.media_title')}</h3>
                </div>

                <div className="border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950">
                    <div className="grid grid-cols-2 border-b border-zinc-100 dark:border-zinc-900">
                        <button
                            onClick={() => setMediaCategory('book')}
                            className={cn(
                                "py-4 text-[8px] font-black uppercase tracking-widest border-r border-zinc-100 dark:border-zinc-900 transition-all",
                                mediaCategory === 'book' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 hover:text-black dark:hover:text-white"
                            )}
                        >{t('editors.art.media_book')}</button>
                        <button
                            onClick={() => setMediaCategory('movie')}
                            className={cn(
                                "py-4 text-[8px] font-black uppercase tracking-widest transition-all",
                                mediaCategory === 'movie' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 hover:text-black dark:hover:text-white"
                            )}
                        >{t('editors.art.media_movie')}</button>
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
                            className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-14 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all border border-black dark:border-white shadow-none"
                        >
                            {t('editors.art.media_deploy')}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

