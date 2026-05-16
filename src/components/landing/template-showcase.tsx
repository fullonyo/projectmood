"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "@/i18n/context"
import { cn } from "@/lib/utils"

// Você pode adicionar mais templates aqui futuramente e preencher os caminhos das imagens
const TEMPLATES = [
    {
        id: "minimal",
        name: "Minimalist Grid",
        category: "Portfolio",
        image: "/image1.png",
        color: "bg-zinc-100",
        textColor: "text-black"
    },
    {
        id: "cyber",
        name: "Cyber Punk",
        category: "Streaming",
        image: "/placeholders/template-2.jpg",
        color: "bg-zinc-950",
        textColor: "text-white"
    },
    {
        id: "editorial",
        name: "Editorial Soft",
        category: "Journal",
        image: "/placeholders/template-3.jpg",
        color: "bg-[#f4f4f0]",
        textColor: "text-black"
    }
]

export function TemplateShowcase() {
    const { t } = useTranslation()
    const [activeIndex, setActiveIndex] = useState(0)

    // Auto-play
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % TEMPLATES.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative py-32 px-6 md:px-12 overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">{t('landing.templates_label')}</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                            {t('landing.templates_title')} <br /> <span className="italic text-zinc-500">{t('landing.templates_title_italic')}</span>
                        </h2>
                    </div>
                    <p className="text-zinc-500 max-w-sm text-sm font-medium leading-relaxed uppercase tracking-tight text-[11px]">
                        {t('landing.templates_desc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Lista de Navegação (Tabs) */}
                    <div className="lg:col-span-1 flex flex-col justify-center gap-2">
                        {TEMPLATES.map((template, idx) => (
                            <button
                                key={template.id}
                                onClick={() => setActiveIndex(idx)}
                                className={cn(
                                    "text-left p-6 border transition-all duration-300 relative overflow-hidden group",
                                    activeIndex === idx
                                        ? "border-white/20 bg-white/5"
                                        : "border-transparent hover:bg-white/5"
                                )}
                            >
                                {activeIndex === idx && (
                                    <motion.div
                                        layoutId="activeTemplateIndicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"
                                    />
                                )}
                                <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                                    {template.category}
                                </span>
                                <span className={cn(
                                    "block text-xl font-black uppercase tracking-tighter transition-colors",
                                    activeIndex === idx ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"
                                )}>
                                    {template.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Janela de Mockup (Tela de Computador) */}
                    <div className="lg:col-span-3 relative h-[400px] md:h-[600px] w-full rounded-lg border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden flex flex-col shadow-2xl">

                        {/* Fake Browser / OS Window Header */}
                        <div className="h-10 w-full border-b border-white/5 bg-black/40 flex items-center px-4 gap-2 shrink-0 z-20">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-red-500 transition-colors" />
                                <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-yellow-500 transition-colors" />
                                <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-green-500 transition-colors" />
                            </div>
                            <div className="mx-auto px-8 py-1 rounded-sm bg-white/5 border border-white/5 text-[9px] font-mono text-zinc-400 tracking-widest flex items-center gap-2">
                                <span className="text-emerald-500">https://</span>moodspace.com.br/studio
                            </div>
                        </div>

                        {/* Tela de visualização cruzada */}
                        <div className="relative flex-1 w-full bg-zinc-950 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className={cn(
                                        "absolute inset-0 w-full h-full flex items-center justify-center",
                                        TEMPLATES[activeIndex].color,
                                        TEMPLATES[activeIndex].textColor
                                    )}
                                >
                                    {TEMPLATES[activeIndex].image.startsWith('/placeholders') ? (
                                        <>
                                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-current to-transparent" />
                                            <div className="text-center z-10 p-8 border border-current/10 bg-current/5 backdrop-blur-md rounded-xl">
                                                <p className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">Slot de Template</p>
                                                <p className="text-3xl font-black uppercase tracking-tighter">{TEMPLATES[activeIndex].name}</p>
                                                <p className="text-[10px] font-mono mt-4 opacity-50">src: {TEMPLATES[activeIndex].image}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <img
                                            src={TEMPLATES[activeIndex].image}
                                            alt={TEMPLATES[activeIndex].name}
                                            className="object-cover w-full h-full"
                                        />
                                    )}

                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
