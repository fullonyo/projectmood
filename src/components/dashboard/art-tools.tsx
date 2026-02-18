"use client"

import { useState, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { StickyNote, Cloud, Book, Film, Plus } from "lucide-react"
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
            "space-y-8 transition-all duration-500 rounded-3xl max-w-full overflow-hidden",
            highlight ? "ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 p-6 -m-6" : ""
        )}>
            {/* Washi Tapes Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                        <StickyNote className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Washi Tapes</h3>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    {TAPES.map((tape) => (
                        <button
                            key={tape.name}
                            onClick={() => addTape(tape)}
                            disabled={isPending}
                            title={tape.name}
                            className="h-10 rounded-lg border border-zinc-100 dark:border-zinc-700 transition-all hover:scale-110 active:scale-95 shadow-sm"
                            style={{
                                backgroundColor: tape.color,
                                backgroundImage: tape.pattern === 'dots' ? 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)' : 'none',
                                backgroundSize: '4px 4px'
                            }}
                        />
                    ))}
                </div>
            </section>

            {/* Weather Aesthetic Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                        <Cloud className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Clima Poético</h3>
                </div>

                <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 max-w-full">
                    <div className="flex flex-wrap gap-2 pb-2">
                        {[
                            { icon: '☀️', vibe: 'Ensolarado e calmo' },
                            { icon: '🌧️', vibe: 'Chuvoso e reflexivo' },
                            { icon: '❄️', vibe: 'Frio e aconchegante' },
                            { icon: '☁️', vibe: 'Nublado e urbano' },
                            { icon: '⚡', vibe: 'Tempestuoso e intenso' },
                        ].map((w) => (
                            <button
                                key={w.icon}
                                onClick={() => setWeatherVibe(w.vibe)}
                                className={cn(
                                    "w-9 h-9 flex items-center justify-center text-lg rounded-xl transition-all hover:scale-110",
                                    weatherVibe === w.vibe ? "bg-white dark:bg-zinc-800 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-700" : "bg-white/40 dark:bg-zinc-950/40 opacity-60 hover:opacity-100"
                                )}
                                title={w.vibe}
                            >
                                {w.icon}
                            </button>
                        ))}
                    </div>
                    <Input
                        placeholder="Aonde você está?"
                        value={weatherLoc}
                        onChange={(e) => setWeatherLoc(e.target.value)}
                        className="bg-white dark:bg-zinc-900 text-xs h-10 w-full rounded-xl border-none shadow-inner"
                    />
                    <Input
                        placeholder="Como está o clima aí?"
                        value={weatherVibe}
                        onChange={(e) => setWeatherVibe(e.target.value)}
                        className="bg-white dark:bg-zinc-900 text-xs h-10 w-full rounded-xl border-none shadow-inner"
                    />
                    <Button
                        size="sm"
                        onClick={handleAddWeather}
                        disabled={isPending || !weatherLoc || !weatherVibe}
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[9px] h-10 rounded-xl"
                    >
                        Adicionar Atmosfera
                    </Button>
                </div>
            </section>

            {/* Media Cards Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                        {mediaCategory === 'book' ? <Book className="w-4 h-4 text-zinc-600 dark:text-zinc-300" /> : <Film className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />}
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Lendo/Vendo</h3>
                </div>

                <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 max-w-full">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMediaCategory('book')}
                            className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg border transition-all", mediaCategory === 'book' ? "bg-black text-white border-black" : "bg-white text-zinc-400 border-zinc-100")}
                        >Livro</button>
                        <button
                            onClick={() => setMediaCategory('movie')}
                            className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg border transition-all", mediaCategory === 'movie' ? "bg-black text-white border-black" : "bg-white text-zinc-400 border-zinc-100")}
                        >Filme</button>
                    </div>
                    <Input
                        placeholder="Título da obra"
                        value={mediaTitle}
                        onChange={(e) => setMediaTitle(e.target.value)}
                        className="bg-white dark:bg-zinc-900 text-xs h-10 w-full"
                    />
                    <Input
                        placeholder="Resuma em 3 palavras"
                        value={mediaReview}
                        onChange={(e) => setMediaReview(e.target.value)}
                        className="bg-white dark:bg-zinc-900 text-xs h-10 w-full"
                    />
                    <Button
                        size="sm"
                        onClick={handleAddMedia}
                        disabled={isPending || !mediaTitle || !mediaReview}
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[9px] h-10 rounded-xl"
                    >
                        Postar Crítica
                    </Button>
                </div>
            </section>
        </div>
    )
}
