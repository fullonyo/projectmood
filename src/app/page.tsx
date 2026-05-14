"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { HeroClaimInput } from "@/components/landing/hero-claim-input"
import { BlockShowcase } from "@/components/landing/block-showcase"
import { LiveCurators } from "@/components/landing/live-curators"
import { BackgroundEffect } from "@/components/effects/background-effect"
import { STUDIO_THEME } from "@/lib/studio-theme"
import { useTranslation } from "@/i18n/context"

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background Unificado - Única Instância WebGL para Performance Máxima */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <BackgroundEffect 
          type={STUDIO_THEME.effects.background.type} 
          primaryColor={STUDIO_THEME.effects.background.primaryColor} 
          showDots={true}
        />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 px-6 py-8 md:px-12 flex justify-between items-center mix-blend-difference">
          <div className="text-xl font-black tracking-tighter uppercase italic">MoodSpace</div>
          <div className="flex gap-8 items-center">
            <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-widest hover:text-zinc-400 transition-colors">
              {t('landing.login_btn')}
            </Link>
            <Link href="/auth/register" className="bg-white text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
              {t('landing.btn_create_studio')}
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
          <div className="max-w-5xl w-full text-center space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-8 h-[1px] bg-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">{t('landing.studio_platform')}</span>
                <div className="w-8 h-[1px] bg-white/20" />
              </div>
              
              <h1 className="text-6xl md:text-[120px] font-black tracking-tighter leading-[0.8] uppercase">
                {t('landing.hero_title_curate')} <br /> 
                <span className="text-zinc-500 italic serif font-light lowercase">{t('landing.hero_title_your')}</span> <br />
                {t('landing.hero_title_reality')}
              </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl mx-auto text-zinc-400 text-sm md:text-base font-medium tracking-tight leading-relaxed uppercase"
            >
              {t('landing.hero_subtitle')}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center pt-8"
            >
              <HeroClaimInput />
            </motion.div>
          </div>

          {/* Floating Details */}
          <div className="absolute bottom-12 left-12 hidden md:block">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 rotate-90 origin-left">
              v2.0.4 — STUDIO_READY
            </div>
          </div>
        </section>

        <BlockShowcase />

        {/* Seção de Essência */}
        <section className="relative py-40 overflow-hidden border-t border-white/5">
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto mb-32"
            >
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
                {t('landing.essence_title')} <br /> 
                <span className="italic serif font-light text-zinc-500 lowercase">{t('landing.essence_title_italic')}</span>
              </h2>
              <p className="text-zinc-400 text-lg font-medium tracking-tight leading-relaxed">
                {t('landing.essence_subtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-24 md:gap-12 text-left">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">{t('landing.essence_feature_1_title')}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                      {t('landing.essence_feature_1_desc')}
                  </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                  <h3 className="text-2xl font-black uppercase tracking-tighter">{t('landing.essence_feature_2_title')}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                      {t('landing.essence_feature_2_desc')}
                  </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">{t('landing.essence_feature_3_title')}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                      {t('landing.essence_feature_3_desc')}
                  </p>
              </motion.div>
            </div>
          </div>
        </section>

        <footer className="relative z-10 pt-16 pb-12 px-6 md:px-12 border-t border-white/5 bg-zinc-950/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* CTA Final - Mais Compacto */}
            <div className="mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none max-w-md text-white">
                Pronto para <br /> sintonizar sua <span className="italic serif font-light text-zinc-500 lowercase">realidade?</span>
              </h2>
              <Link href="/auth/register" className="bg-white text-black px-8 py-4 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-200 transition-all active:scale-95 whitespace-nowrap">
                {t('landing.btn_create_studio')}
              </Link>
            </div>

            {/* Grid de Links - Mais Denso */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div className="space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Plataforma</h4>
                <ul className="space-y-2 text-[10px] font-medium uppercase tracking-tight text-zinc-400">
                  <li><Link href="#" className="hover:text-white transition-colors">O Estúdio</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Mural Global</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Marketplace</Link></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Ecossistema</h4>
                <ul className="space-y-2 text-[10px] font-medium uppercase tracking-tight text-zinc-400">
                  <li><Link href="#" className="hover:text-white transition-colors">Manifesto</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Comunidade</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Labs</Link></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Suporte</h4>
                <ul className="space-y-2 text-[10px] font-medium uppercase tracking-tight text-zinc-400">
                  <li><Link href="#" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
                  <li><a href="mailto:desenvolvimento@moodspace.com.br" className="hover:text-white transition-colors lowercase font-mono text-zinc-500">desenvolvimento@moodspace.com.br</a></li>
                  <li><div className="flex items-center gap-2 text-emerald-500/60">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] uppercase font-black tracking-widest opacity-60">Systems: Online</span>
                  </div></li>
                  <li className="pt-1"><LiveCurators /></li>
                </ul>
              </div>

              <div className="space-y-4 text-right md:text-left">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Social</h4>
                <ul className="space-y-2 text-[10px] font-medium uppercase tracking-tight text-zinc-400">
                  <li><Link href="#" className="hover:text-white transition-colors">Instagram</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Twitter (X)</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">TikTok</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar - Slim */}
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-700">
                <div className="text-white/60 text-sm italic tracking-tighter uppercase font-black">MoodSpace</div>
                <div className="hidden md:block w-px h-3 bg-white/5" />
                <div>© {new Date().getFullYear()} STUDIO SYSTEMS</div>
                <div className="flex gap-4">
                  <Link href="#" className="hover:text-zinc-400 transition-colors">{t('landing.privacy')}</Link>
                  <Link href="#" className="hover:text-zinc-400 transition-colors">{t('landing.terms')}</Link>
                </div>
              </div>
              
              <div className="text-[8px] font-mono text-zinc-600 flex gap-4">
                <span>V2.0.4</span>
                <span>BR_EST_01</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
