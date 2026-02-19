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

const TAPES = [
    { name: 'Classic White', color: 'rgba(255, 255, 255, 0.4)', pattern: 'none' },
    { name: 'Vintage Paper', color: 'rgba(245, 245, 220, 0.6)', pattern: 'grain' },
    { name: 'Sky Blue', color: 'rgba(186, 225, 255, 0.5)', pattern: 'none' },
    { name: 'Rose Petal', color: 'rgba(255, 179, 186, 0.5)', pattern: 'none' },
    { name: 'Mint Leaf', color: 'rgba(186, 255, 201, 0.5)', pattern: 'none' },
    { name: 'Washi Dot', color: 'rgba(255, 255, 255, 0.5)', pattern: 'dots' },
]

export function ArtTools({ highlight }: { highlight?: boolean }) {
    const [isPending, startTransition] = useTransition()

    // Form states for Weather
    const [weatherLoc, setWeatherLoc] = useState("")
    const [weatherVibe, setWeatherVibe] = useState("")

    // Form states for Media
    const [mediaTitle, setMediaTitle] = useState("")
    const [mediaReview, setMediaReview] = useState("")
    const [mediaCategory, setMediaCategory] = useState<'book' | 'movie'>('book')

    const addTape = (tape: typeof TAPES[0]) => {
        startTransition(async () => {
            await addMoodBlock('tape', {
                color: tape.color,
                pattern: tape.pattern
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
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Material_Substrates</h3>
                </div>

                <div className="grid grid-cols-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    {TAPES.map((tape) => (
                        <button
                            key={tape.name}
                            onClick={() => addTape(tape)}
                            disabled={isPending}
                            title={tape.name}
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

            {/* Atmospheric Registry Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        <Cloud className="w-3.5 h-3.5 text-black dark:text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Atmospheric_Registry</h3>
                </div>

                <div className="border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950">
                    <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 text-center">Vibe_State_Frequency</p>
                        <div className="grid grid-cols-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            {[
                                { icon: Sun, id: 'sun', vibe: 'Ensolarado e calmo' },
                                { icon: CloudRain, id: 'rain', vibe: 'Chuvoso e reflexivo' },
                                { icon: Snowflake, id: 'snow', vibe: 'Frio e aconchegante' },
                                { icon: Cloud, id: 'cloud', vibe: 'Nublado e urbano' },
                                { icon: Wind, id: 'wind', vibe: 'Ventoso e dinâmico' },
                            ].map((w) => (
                                <button
                                    key={w.id}
                                    onClick={() => setWeatherVibe(w.vibe)}
                                    className={cn(
                                        "aspect-square flex items-center justify-center border-r last:border-r-0 border-zinc-100 dark:border-zinc-900 transition-all",
                                        weatherVibe === w.vibe
                                            ? "bg-black text-white dark:bg-white dark:text-black"
                                            : "opacity-40 hover:opacity-100"
                                    )}
                                    title={w.vibe}
                                >
                                    <w.icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="space-y-3">
                            <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Geographic_Node</p>
                            <Input
                                placeholder="IDENTIFY_LOCATION..."
                                value={weatherLoc}
                                onChange={(e) => setWeatherLoc(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none text-[10px] font-mono h-11 uppercase tracking-tight focus-visible:ring-0"
                            />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Temporal_Feel</p>
                            <Input
                                placeholder="DEFINE_VIBE_PROTOCOL..."
                                value={weatherVibe}
                                onChange={(e) => setWeatherVibe(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none text-[10px] font-mono h-11 uppercase tracking-tight focus-visible:ring-0"
                            />
                        </div>

                        <Button
                            onClick={() => {
                                const icon = [
                                    { icon: Sun, id: 'sun', vibe: 'Ensolarado e calmo' },
                                    { icon: CloudRain, id: 'rain', vibe: 'Chuvoso e reflexivo' },
                                    { icon: Snowflake, id: 'snow', vibe: 'Frio e aconchegante' },
                                    { icon: Cloud, id: 'cloud', vibe: 'Nublado e urbano' },
                                    { icon: Wind, id: 'wind', vibe: 'Ventoso e dinâmico' },
                                ].find(w => w.vibe === weatherVibe)?.id || 'cloud'

                                startTransition(async () => {
                                    await addMoodBlock('weather', {
                                        vibe: weatherVibe,
                                        location: weatherLoc,
                                        icon: icon
                                    }, { x: 70, y: 70 })
                                    setWeatherLoc("")
                                    setWeatherVibe("")
                                })
                            }}
                            disabled={isPending || !weatherVibe || !weatherLoc}
                            className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-14 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all border border-black dark:border-white shadow-none"
                        >
                            Manifest_Climate_Node
                        </Button>
                    </div>
                </div>
            </section>

            {/* Curation Manifesto Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                        {mediaCategory === 'book' ? <Book className="w-3.5 h-3.5 text-black dark:text-white" /> : <Film className="w-3.5 h-3.5 text-black dark:text-white" />}
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Curation_Manifesto</h3>
                </div>

                <div className="border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950">
                    <div className="grid grid-cols-2 border-b border-zinc-100 dark:border-zinc-900">
                        <button
                            onClick={() => setMediaCategory('book')}
                            className={cn(
                                "py-4 text-[8px] font-black uppercase tracking-widest border-r border-zinc-100 dark:border-zinc-900 transition-all",
                                mediaCategory === 'book' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 hover:text-black dark:hover:text-white"
                            )}
                        >Manifest_Book</button>
                        <button
                            onClick={() => setMediaCategory('movie')}
                            className={cn(
                                "py-4 text-[8px] font-black uppercase tracking-widest transition-all",
                                mediaCategory === 'movie' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 hover:text-black dark:hover:text-white"
                            )}
                        >Manifest_Cinema</button>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="space-y-3">
                            <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Work_Title</p>
                            <Input
                                placeholder="IDENTIFY_TITLE..."
                                value={mediaTitle}
                                onChange={(e) => setMediaTitle(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none text-[10px] font-mono h-11 uppercase focus-visible:ring-0"
                            />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Critique_Matrix // 3_Words</p>
                            <Input
                                placeholder="X_Y_Z..."
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
                            Publish_Review_Node
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
