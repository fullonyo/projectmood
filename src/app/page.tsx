"use client"

import Link from "next/link";
import { BackgroundEffect } from "@/components/effects/background-effect";
import { StaticTextures } from "@/components/effects/static-textures";
import { useTranslation } from "@/i18n/context";
import { LanguageSwitcher } from "@/components/dashboard/language-switcher";
import { motion } from "framer-motion";
import { Play, Move, Layers, Zap } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-white selection:text-black overflow-x-hidden relative font-sans">

      <section className="relative min-h-[90vh] flex flex-col border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <BackgroundEffect type="aurora" primaryColor="#18181b" />
        </div>
        <div className="absolute inset-0 z-[1] opacity-30">
          <StaticTextures type="cross" />
        </div>
        <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-40 leading-none mb-1">{t('landing.studio_platform')}</span>
            <div className="text-2xl font-black tracking-tighter uppercase italic">MoodSpace</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 sm:gap-8 items-center"
          >
            <LanguageSwitcher className="opacity-50 hover:opacity-100 transition-opacity" />
            <Link href="/auth/login" className="group hidden sm:block">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">{t('landing.login_btn')}</span>
            </Link>
            <Link href="/auth/register">
              <div className="px-6 py-2 border border-white/20 hover:border-white transition-all duration-500 bg-white/5 backdrop-blur-sm">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('landing.btn_create_studio')}</span>
              </div>
            </Link>
          </motion.div>
        </nav>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 md:px-12 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 max-w-5xl"
          >
            <div className="flex items-center justify-center gap-4 opacity-30 mb-8">
              <div className="h-[1px] w-12 bg-white" />
              <span className="text-[10px] font-mono tracking-[0.4em] uppercase">{t('landing.curator_access_only')}</span>
              <div className="h-[1px] w-12 bg-white" />
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-[min(12vw,160px)] font-black tracking-tighter leading-[0.8] uppercase mb-12">
              {t('landing.hero_title_curate')} <br />
              <span className="italic text-zinc-500">{t('landing.hero_title_your')}</span> <br />
              {t('landing.hero_title_reality')}
            </h1>

            <div className="flex flex-col items-center gap-10">
              <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto font-medium tracking-tight">
                {t('landing.hero_subtitle')}
              </p>

              <Link href="/auth/register" className="group">
                <div className="bg-white text-black px-10 sm:px-20 py-5 sm:py-7 transition-all duration-500 hover:scale-105 relative overflow-hidden">
                  <span className="text-sm sm:text-xl font-black uppercase tracking-widest relative z-10">{t('landing.btn_create_studio')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              </Link>
            </div>
          </motion.div>

          <div className="mt-24 relative w-full max-w-6xl aspect-[16/9] hidden lg:block">
            <div className="absolute inset-0 border border-white/10 grid grid-cols-12 grid-rows-6 opacity-20 pointer-events-none">
              {Array.from({ length: 72 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-white/5" />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 flex items-center justify-center perspective-[1000px]"
            >
              <div className="absolute top-[10%] left-[20%] w-72 h-80 bg-zinc-900 border border-white/20 p-2 shadow-2xl rotate-2">
                <div className="w-full h-[85%] bg-zinc-800 grayscale" />
                <div className="h-[15%] flex items-center px-2">
                  <div className="w-12 h-1 bg-white/20 rounded-full" />
                </div>
              </div>

              <div className="absolute top-[40%] right-[15%] w-80 h-32 bg-zinc-900/80 backdrop-blur-xl border border-white/20 p-4 flex items-center gap-4 -rotate-3">
                <div className="w-20 h-20 bg-zinc-800 flex items-center justify-center">
                  <Play className="w-8 h-8 opacity-20" />
                </div>
                <div className="space-y-2">
                  <div className="w-32 h-2 bg-white/40" />
                  <div className="w-20 h-1 bg-white/20" />
                </div>
              </div>

              <div className="absolute bottom-[15%] left-[30%] w-64 h-64 bg-zinc-100 p-6 flex flex-col justify-between -rotate-6">
                <div className="space-y-3">
                  <div className="w-full h-[1px] bg-black/10" />
                  <div className="w-[80%] h-[1px] bg-black/10" />
                  <div className="w-[90%] h-[1px] bg-black/10" />
                </div>
                <span className="text-[10px] font-mono text-black opacity-40 uppercase tracking-[0.2em]">{t('landing.visuals')}</span>
              </div>
            </motion.div>
          </div>
        </main>
      </section>

      <section className="relative bg-white text-black py-32 overflow-hidden border-t border-black/5">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <StaticTextures type="cross" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 group"
            >
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-8 rotate-3 transition-transform group-hover:rotate-0">
                <Move className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                {t('landing.showcase.structure_title')}
              </h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                {t('landing.showcase.structure_desc')}
              </p>
              <div className="h-[1px] w-12 bg-black/10 transition-all group-hover:w-full" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-6 group"
            >
              <div className="w-12 h-12 border-2 border-black flex items-center justify-center mb-8 -rotate-6 transition-transform group-hover:rotate-0">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                {t('landing.showcase.atmosphere_title')}
              </h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                {t('landing.showcase.atmosphere_desc')}
              </p>
              <div className="h-[1px] w-12 bg-black/10 transition-all group-hover:w-full" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6 group"
            >
              <div className="w-12 h-12 bg-white border border-black/10 flex items-center justify-center mb-8 rotate-12 transition-transform group-hover:rotate-0 shadow-xl">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                {t('landing.showcase.connection_title')}
              </h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                {t('landing.showcase.connection_desc')}
              </p>
              <div className="h-[1px] w-12 bg-black/10 transition-all group-hover:w-full" />
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 px-6 sm:px-12 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 bg-zinc-950 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 border-t border-white/5">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <span className="opacity-20 flex items-center gap-2">
            <div className="w-1 h-1 bg-zinc-600 rounded-full" />
            {t('landing.version_deployment')}
          </span>
          <div>© {new Date().getFullYear()} MOODSPACE_SYSTEMS</div>
        </div>

        <div className="flex gap-8">
          <span className="opacity-20 hover:opacity-100 transition-opacity cursor-pointer">{t('landing.privacy')}</span>
          <span className="opacity-20 hover:opacity-100 transition-opacity cursor-pointer">{t('landing.terms')}</span>
        </div>
      </footer>
    </div>
  );
}
