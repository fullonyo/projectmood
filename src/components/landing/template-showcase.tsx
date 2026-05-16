"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "@/i18n/context"
import { cn } from "@/lib/utils"
import { BackgroundEffect } from "@/components/effects/background-effect"

// Componente Interno: Label Estilo Arquivo Studio (Technical Tag)
const MetadataBadge = ({ label }: { label: string }) => (
    <div className="absolute top-8 right-8 flex items-center gap-3 z-20 pointer-events-none opacity-40">
        <div className="h-[1px] w-6 bg-current opacity-40" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            {label}
        </span>
    </div>
)

// Configuração modular dos templates
const TEMPLATES = [
    {
        id: "linktree",
        nameKey: "landing.templates_tab_1_name",
        categoryKey: "landing.templates_tab_1_cat",
        badgeKey: "landing.showcase_label_bio",
        image: "/placeholders/template-linktree.jpg", 
        color: "bg-[#09090b]",
        textColor: "text-zinc-100"
    },
    {
        id: "media",
        nameKey: "landing.templates_tab_2_name",
        categoryKey: "landing.templates_tab_2_cat",
        badgeKey: "landing.showcase_label_playlist",
        image: "/placeholders/template-media.jpg", 
        color: "bg-[#09090b]",
        textColor: "text-zinc-100"
    },
    {
        id: "minimal",
        nameKey: "landing.templates_tab_3_name",
        categoryKey: "landing.templates_tab_3_cat",
        badgeKey: "landing.showcase_label_editorial",
        image: "/image1.png",
        color: "bg-[#09090b]",
        textColor: "text-zinc-100"
    },
    {
        id: "doodle",
        nameKey: "landing.templates_tab_4_name",
        categoryKey: "landing.templates_tab_4_cat",
        badgeKey: "landing.showcase_label_doodle",
        image: "/placeholders/template-doodle.webp",
        color: "bg-[#fafafa]",
        textColor: "text-zinc-900"
    },
    {
        id: "visuals",
        nameKey: "landing.templates_tab_5_name",
        categoryKey: "landing.templates_tab_5_cat",
        badgeKey: "landing.showcase_label_photo",
        image: "/placeholders/template-visuals.webp",
        color: "bg-[#18181b]",
        textColor: "text-zinc-100"
    }
]

export function TemplateShowcase() {
    const { t } = useTranslation()
    const [activeIndex, setActiveIndex] = useState(0)
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

    // Pré-carregar imagens
    useEffect(() => {
        TEMPLATES.forEach((template, index) => {
            if (template.image) {
                const img = new Image()
                img.src = template.image
                img.onerror = () => {
                    setImageErrors(prev => ({ ...prev, [index]: true }))
                }
            }
        })
    }, [])

    return (
        <section className="relative py-32 px-6 md:px-12 overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="space-y-4">
                        <span className="text-xs font-medium text-emerald-500">{t('landing.templates_label')}</span>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-none">
                            {t('landing.templates_title')} <br /> <span className="italic font-light text-zinc-500">{t('landing.templates_title_italic')}</span>
                        </h2>
                    </div>
                    <p className="text-zinc-500 max-w-sm text-sm font-medium leading-relaxed opacity-80">
                        {t('landing.templates_desc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navegação por Tabs (Padrão Industrial) */}
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
                                    {t(template.categoryKey)}
                                </span>
                                <span className={cn(
                                    "block text-xl font-black uppercase tracking-tighter transition-colors",
                                    activeIndex === idx ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"
                                )}>
                                    {t(template.nameKey)}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Janela de Mockup */}
                    <div className="lg:col-span-3 relative h-[400px] md:h-[600px] w-full rounded-lg border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden flex flex-col shadow-2xl">
                        
                        <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 justify-between">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-white/20" />
                                <div className="w-3 h-3 rounded-full bg-white/20" />
                                <div className="w-3 h-3 rounded-full bg-white/20" />
                            </div>
                            <div className="mx-auto px-8 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400">
                                <span className="opacity-40 tracking-wider uppercase font-medium text-[8px]">moodspace.com.br/studio-preview</span>
                            </div>
                        </div>

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
                                    {/* Renderização de Imagem ou Fallback Especial */}
                                    {(!imageErrors[activeIndex] && !TEMPLATES[activeIndex].image.includes('placeholder')) ? (
                                        <>
                                            <img 
                                                src={TEMPLATES[activeIndex].image} 
                                                alt={t(TEMPLATES[activeIndex].nameKey)}
                                                className="absolute inset-0 object-cover w-full h-full"
                                                onError={() => setImageErrors(prev => ({ ...prev, [activeIndex]: true }))}
                                            />
                                            <MetadataBadge label={t(TEMPLATES[activeIndex].badgeKey)} />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center relative">
                                            {/* Etiqueta Técnica de Arquivo (Metadata) */}
                                            <MetadataBadge label={t(TEMPLATES[activeIndex].badgeKey)} />

                                            {TEMPLATES[activeIndex].id === "linktree" ? (
                                                <>
                                                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                                                        <BackgroundEffect type="aurora" primaryColor="#18181b" showDots={false} />
                                                    </div>
                                                    <div className="w-full max-w-[300px] space-y-6 text-center z-10">
                                                        <div className="w-20 h-20 rounded-full bg-white/10 mx-auto border border-white/20 mb-8 flex items-center justify-center">
                                                            <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse" />
                                                        </div>
                                                        <div className="space-y-3">
                                                            {[1, 2, 3, 4].map((i) => (
                                                                <div key={i} className="w-full py-4 border border-white/10 bg-white/5 backdrop-blur-md rounded-lg flex items-center justify-center">
                                                                    <div className="h-2 w-24 bg-white/20 rounded-full" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                             ) : TEMPLATES[activeIndex].id === "media" ? (
                                                <>
                                                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                                                        <BackgroundEffect type="liquid" primaryColor="#1e3a8a" showDots={false} />
                                                    </div>
                                                    <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-8 p-6 md:p-12 z-10">
                                                        <div className="w-full md:w-[60%] aspect-video bg-black rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                                                             <div className="absolute inset-0 flex items-center justify-center">
                                                                  <div className="w-16 h-11 bg-[#FF0000] rounded-xl flex items-center justify-center">
                                                                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                                                                  </div>
                                                             </div>
                                                        </div>
                                                        <div className="w-full md:w-[35%] h-[80%] bg-[#121212] rounded-2xl border border-white/10 shadow-2xl p-8 flex flex-col justify-between">
                                                             <div className="flex gap-4">
                                                                  <div className="w-20 h-20 bg-zinc-800 rounded-lg" />
                                                                  <div className="flex-1 space-y-2">
                                                                      <div className="h-4 w-full bg-white/10 rounded-full" />
                                                                  </div>
                                                             </div>
                                                             <div className="flex items-center gap-4">
                                                                 <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center">
                                                                     <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-black border-b-[5px] border-b-transparent ml-0.5" />
                                                                 </div>
                                                                 <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden" />
                                                             </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : TEMPLATES[activeIndex].id === "minimal" ? (
                                                <>
                                                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                                                        <BackgroundEffect type="stars" primaryColor="#ffffff" showDots={false} />
                                                    </div>
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-8 md:p-20 z-10 gap-24">
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="max-w-2xl w-full space-y-6 text-center"
                                                        >
                                                            <p className="text-xl md:text-3xl font-serif italic leading-snug tracking-tight">
                                                                {t('landing.showcase_quote_1_text')}
                                                            </p>
                                                            <span className="text-[11px] font-medium opacity-40">
                                                                {t('landing.showcase_quote_1_author')}
                                                            </span>
                                                        </motion.div>
                                                    </div>
                                                </>
                                            ) : TEMPLATES[activeIndex].id === "doodle" ? (
                                                <div className="w-full h-full flex items-center justify-center p-6 md:p-12 z-10 relative overflow-hidden bg-[#fafafa]">
                                                    <div className="absolute inset-0 opacity-[0.5] pointer-events-none" 
                                                        style={{ 
                                                            backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px)`,
                                                            backgroundSize: '100% 32px'
                                                        }} 
                                                    />
                                                    <div className="absolute left-[15%] top-0 bottom-0 w-[1px] bg-red-200 opacity-60 pointer-events-none" />
                                                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />
                                                    
                                                    <div className="relative w-full max-w-4xl aspect-video flex items-center justify-center">
                                                        <svg viewBox="0 0 800 450" className="w-full h-full">
                                                            <motion.path 
                                                                d="M150,225 Q250,50 400,225 T650,225" 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                strokeWidth="3" 
                                                                strokeLinecap="round"
                                                                initial={{ pathLength: 0, opacity: 0 }}
                                                                animate={{ pathLength: 1, opacity: 0.6 }}
                                                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                                            />
                                                        </svg>
                                                        <motion.div 
                                                            animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }}
                                                            transition={{ duration: 4, repeat: Infinity }}
                                                            className="absolute top-10 left-10 w-24 h-24 bg-yellow-400/20 border-2 border-dashed border-yellow-500/30 rounded-xl rotate-[-12deg] flex items-center justify-center"
                                                        >
                                                            <span className="text-2xl opacity-40">✨</span>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            ) : TEMPLATES[activeIndex].id === "visuals" ? (
                                                <div className="w-full h-full flex items-center justify-center p-6 md:p-12 z-10 gap-8 md:gap-16">
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="relative group w-[280px] md:w-[400px]"
                                                    >
                                                        <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                                                            <img 
                                                                src="/placeholders/anime-scenery.png" 
                                                                className="w-full h-full object-cover" 
                                                                alt="Visual" 
                                                            />
                                                        </div>
                                                    </motion.div>

                                                    <motion.div 
                                                        initial={{ opacity: 0, x: 20, rotate: 5 }}
                                                        animate={{ opacity: 1, x: 0, rotate: 3 }}
                                                        className="bg-white dark:bg-zinc-950 p-4 pb-12 shadow-2xl ring-1 ring-black/5 rotate-[3deg] w-[200px] md:w-[260px] flex flex-col"
                                                    >
                                                        <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
                                                            <img 
                                                                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N6Mnd6Mnd6Mnd6Mnd6Mnd6Mnd6Mnd6Mnd6Mnd6Mnd6Mnd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif" 
                                                                className="w-full h-full object-cover" 
                                                                alt="GIF" 
                                                            />
                                                        </div>
                                                        <div className="mt-6 space-y-1.5">
                                                            <div className="h-1.5 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                                                            <div className="h-1.5 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            ) : null}
                                        </div>
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
