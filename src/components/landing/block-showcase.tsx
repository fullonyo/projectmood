"use client"

import { motion } from "framer-motion"
import { Play, Stamp, Link as LinkIcon, Type, Instagram, Globe, Sparkles } from "lucide-react"
import { useTranslation } from "@/i18n/context"

export function BlockShowcase() {
    const { t } = useTranslation()

    return (
        <section className="relative py-32 px-6 md:px-12 overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500">{t('landing.showcase_label')}</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                            {t('landing.showcase_main_title')} <br /> em <span className="italic text-zinc-500">{t('landing.showcase_main_title_italic')}</span>
                        </h2>
                    </div>
                    <p className="text-zinc-500 max-w-sm text-sm font-medium leading-relaxed uppercase tracking-tight text-[11px]">
                        {t('landing.showcase_main_desc')}
                    </p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[650px]">
                    
                    {/* Bloco Música & Vídeo (Spotify/YouTube/Local) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-2 md:row-span-2 bg-zinc-900 border border-white/5 p-8 flex flex-col justify-between group relative overflow-hidden"
                    >
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Play size={240} fill="white" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white flex items-center justify-center mb-6">
                                <Play className="text-black w-6 h-6 fill-black" />
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tight mb-2">{t('landing.showcase_music_title')}</h3>
                            <p className="text-zinc-400 text-sm max-w-xs uppercase tracking-wider text-[10px] font-black">
                                {t('landing.showcase_music_desc')}
                            </p>
                        </div>
                        
                        <div className="mt-12 bg-zinc-800/40 backdrop-blur-xl border border-white/5 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-700 flex items-center justify-center">
                                        <Play className="w-4 h-4 opacity-40" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="w-24 h-2 bg-white/60" />
                                        <div className="w-16 h-1 bg-white/20" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bloco Figurinhas (Doodle/Stickers) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-2 bg-purple-600 p-8 flex flex-col justify-between group overflow-hidden relative"
                    >
                        <div className="flex justify-between items-start text-white">
                            <Stamp className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('landing.showcase_stickers_title')}</span>
                        </div>
                        
                        <div className="relative z-10 mt-12">
                            <h3 className="text-3xl font-black uppercase tracking-tight text-white leading-none">{t('landing.showcase_stickers_title')}</h3>
                            <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mt-2">{t('landing.showcase_stickers_desc')}</p>
                        </div>

                        {/* Figurinhas Flutuantes de Exemplo */}
                        <motion.div 
                            animate={{ rotate: [10, 15, 10], y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute bottom-4 right-10 w-24 h-24 bg-white/20 backdrop-blur-md flex items-center justify-center rotate-12"
                        >
                            <Sparkles className="text-white w-10 h-10" />
                        </motion.div>
                        <div className="absolute top-10 right-20 w-12 h-12 bg-black/20 backdrop-blur-sm -rotate-12" />
                    </motion.div>

                    {/* Bloco Links de Conexão (SocialContent) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-zinc-100 p-6 flex flex-col justify-between group"
                    >
                        <LinkIcon className="w-5 h-5 text-black" />
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Instagram className="w-4 h-4 text-black opacity-30" />
                                <div className="h-[1px] flex-1 bg-black/10" />
                                <span className="text-[10px] font-mono text-black">/moodspace</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-black opacity-30" />
                                <div className="h-[1px] flex-1 bg-black/10" />
                                <span className="text-[10px] font-mono text-black">moodspace.pro</span>
                            </div>
                        </div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-black/40">{t('landing.showcase_connections_title')}</div>
                    </motion.div>

                    {/* Bloco Tipografia (TextContent/Styles) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-zinc-900 border border-white/5 p-6 flex flex-col justify-between group relative overflow-hidden"
                    >
                        <Type className="w-5 h-5 text-zinc-500" />
                        <div className="space-y-3 mt-4">
                            <p className="text-lg font-serif italic text-white leading-tight">Manifesto.</p>
                            <p className="text-xs font-mono uppercase tracking-tighter text-zinc-500">Curate your soul.</p>
                            <p className="text-[10px] font-black tracking-widest text-white/40">{t('landing.showcase_typography_title')}</p>
                        </div>
                        <div className="absolute bottom-0 right-0 p-2 opacity-5">
                            <Type size={80} />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
