"use client"

import { motion } from "framer-motion"
import { Play, Stamp, Link as LinkIcon, Type, Instagram, Globe, Sparkles, Music, Share2, MousePointer2 } from "lucide-react"
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
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[700px]">
                    
                    {/* Bloco Música & Vídeo - O "Player Emocional" */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-2 md:row-span-2 bg-zinc-900/40 backdrop-blur-md border border-white/5 p-8 flex flex-col justify-between group relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{t('landing.showcase_live_feed')}</span>
                            </div>

                            <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none">
                                {t('landing.showcase_music_title')}
                            </h3>
                            
                            {/* Interface de Player Fictícia */}
                            <div className="mt-8 bg-black/40 border border-white/5 p-6 space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-zinc-800 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
                                        <Music className="text-white/20 w-8 h-8" />
                                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-3/4 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                animate={{ width: ["0%", "70%", "65%"] }}
                                                transition={{ duration: 4, repeat: Infinity }}
                                                className="h-full bg-white/40" 
                                            />
                                        </div>
                                        <div className="h-2 w-1/2 bg-white/5 rounded-full" />
                                        <div className="flex gap-4 pt-2">
                                            <div className="w-4 h-4 bg-white/10 rounded-full" />
                                            <div className="w-4 h-4 bg-white/10 rounded-full" />
                                            <div className="w-4 h-4 bg-white/10 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-mono text-zinc-600 flex justify-between">
                                    <span>02:45</span>
                                    <span>-01:20</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between mt-12 pt-8 border-t border-white/5">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t('landing.showcase_sync_label')}</p>
                            <Play className="text-white w-4 h-4" />
                        </div>
                    </motion.div>

                    {/* Bloco Figurinhas - O "Caos Criativo" */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-white/5 p-8 flex flex-col justify-between group overflow-hidden relative"
                    >
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">
                                {t('landing.showcase_stickers_title')}
                            </h3>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">{t('landing.showcase_stickers_desc')}</p>
                        </div>

                        {/* Adesivos Dispersos */}
                        <div className="absolute inset-0 pointer-events-none">
                            <motion.div 
                                animate={{ rotate: [-5, -8, -5], y: [0, 5, 0] }}
                                transition={{ duration: 5, repeat: Infinity }}
                                className="absolute top-1/2 right-12 w-24 h-24 bg-purple-500/10 border border-purple-500/20 backdrop-blur-md flex items-center justify-center rotate-12"
                            >
                                <Sparkles className="text-purple-400 w-10 h-10" />
                            </motion.div>
                            <motion.div 
                                animate={{ rotate: [12, 15, 12], y: [0, -8, 0] }}
                                transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                                className="absolute bottom-10 left-1/3 w-16 h-16 bg-zinc-800 border border-white/10 flex items-center justify-center -rotate-12"
                            >
                                <Stamp className="text-zinc-500 w-6 h-6" />
                            </motion.div>
                            <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white/5 rounded-full blur-xl" />
                        </div>

                        <div className="relative z-10 flex gap-2 mt-20">
                            <div className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-400">#vibe</div>
                            <div className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-400">#curatorship</div>
                        </div>
                    </motion.div>

                    {/* Bloco Links de Conexão - O "Social Graph" */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-zinc-100 p-8 flex flex-col justify-between group relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                                    <Share2 className="w-5 h-5 text-white" />
                                </div>
                                <div className="px-2 py-1 bg-black/5 border border-black/10 rounded-full text-[7px] font-black uppercase tracking-tighter text-black">
                                    {t('landing.showcase_verified_space')}
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 group/item cursor-pointer">
                                    <Instagram className="w-4 h-4 text-black/40 group-hover/item:text-black transition-colors" />
                                    <span className="text-[10px] font-mono text-black">instagram.com/mood</span>
                                </div>
                                <div className="flex items-center gap-3 group/item cursor-pointer">
                                    <Globe className="w-4 h-4 text-black/40 group-hover/item:text-black transition-colors" />
                                    <span className="text-[10px] font-mono text-black">curadoria.pro</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-12">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-black/30 mb-2 block">{t('landing.showcase_module_social')}</span>
                            <div className="bg-black text-white p-4 rounded-sm">
                                <p className="text-[11px] font-mono tracking-tighter">moodspace.com.br/<span className="text-purple-400 font-bold">@seu_nome</span></p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bloco Tipografia - O "Design Specimen" */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-zinc-900 border border-white/5 p-8 flex flex-col justify-between group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <MousePointer2 className="w-12 h-12" />
                        </div>
                        
                        <div className="space-y-6 mt-4 relative z-10">
                            <div className="space-y-2">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-500">{t('landing.showcase_module_quote')}</span>
                                <p className="text-2xl md:text-3xl font-serif italic text-white leading-tight tracking-tighter">
                                    {t('landing.showcase_quote_text')}
                                </p>
                                <p className="text-[10px] font-mono uppercase text-zinc-600">{t('landing.showcase_quote_author')}</p>
                            </div>
                            
                            <div className="w-12 h-[1px] bg-zinc-800" />
                            
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('landing.showcase_module_typography')}</span>
                                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 leading-relaxed">
                                    {t('landing.showcase_typography_text_1')} <br /> {t('landing.showcase_typography_text_2')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-end justify-between relative z-10">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border border-zinc-900 bg-zinc-700" />
                                <div className="w-6 h-6 rounded-full border border-zinc-900 bg-zinc-600" />
                                <div className="w-6 h-6 rounded-full border border-zinc-900 bg-zinc-500" />
                            </div>
                            <Type className="w-4 h-4 text-zinc-700" />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
