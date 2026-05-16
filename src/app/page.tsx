"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { HeroClaimInput } from "@/components/landing/hero-claim-input"
import { TemplateShowcase } from "@/components/landing/template-showcase"
import { LiveCurators } from "@/components/landing/live-curators"
import { BackgroundEffect } from "@/components/effects/background-effect"
import { STUDIO_THEME } from "@/lib/studio-theme"
import { useTranslation } from "@/i18n/context"
import { LanguageSwitcher } from "@/components/studio/language-switcher"

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
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
            <LanguageSwitcher lightText />
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
              
              <h1 className="text-6xl md:text-[120px] font-bold tracking-tight leading-[0.8]">
                {t('landing.hero_title_curate')} <br /> 
                <span className="text-zinc-500 italic serif font-light lowercase">{t('landing.hero_title_your')}</span> <br />
                {t('landing.hero_title_reality')}
              </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl mx-auto text-zinc-400 text-base md:text-lg font-medium tracking-tight leading-relaxed"
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

          {/* Floating Details removidos */}
        </section>

        <TemplateShowcase />

        {/* Seção de Essência */}
        <section className="relative py-40 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto mb-32"
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-[0.9]">
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
                  <h3 className="text-2xl font-bold tracking-tight italic">{t('landing.essence_feature_1_title')}</h3>
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
                  <h3 className="text-2xl font-bold tracking-tight">{t('landing.essence_feature_2_title')}</h3>
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
                  <h3 className="text-2xl font-bold tracking-tight italic">{t('landing.essence_feature_3_title')}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                      {t('landing.essence_feature_3_desc')}
                  </p>
              </motion.div>
            </div>
          </div>
        </section>

        <footer className="relative z-10 pt-24 pb-12 px-6 md:px-12 bg-zinc-950/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* CTA Final */}
            <div className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-none text-white max-w-xl">
                {t('landing.footer_cta_title_1')} <br /> {t('landing.footer_cta_title_2')} <span className="italic serif font-light text-zinc-500 lowercase">{t('landing.footer_cta_title_3')}</span>
              </h2>
              <Link href="/auth/register" className="bg-white text-black px-10 py-5 font-black uppercase tracking-[0.2em] text-[11px] hover:bg-zinc-200 transition-all active:scale-95 whitespace-nowrap shadow-2xl">
                {t('landing.btn_create_studio')}
              </Link>
            </div>

            {/* Main Info Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20 pt-12">
              <div className="flex flex-col justify-between gap-12">
                <div className="space-y-6">
                  <div className="text-2xl font-black tracking-tighter uppercase italic opacity-80">MoodSpace</div>
                  <p className="text-zinc-500 text-sm font-medium tracking-tight leading-relaxed max-w-sm">
                    {t('landing.essence_subtitle')}
                  </p>
                </div>
                <LiveCurators />
              </div>

              <div className="flex flex-col justify-end gap-6 md:text-right">
                <div className="space-y-3">
                  <p className="text-zinc-500 text-sm font-medium tracking-tight">
                    {t('landing.footer_contact_label')}
                  </p>
                  <a 
                    href="mailto:desenvolvimento@moodspace.com.br" 
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight hover:text-emerald-500 transition-colors duration-500 block whitespace-nowrap"
                  >
                    desenvolvimento@moodspace.com.br
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 text-zinc-600">
              <div className="text-[10px] font-medium text-zinc-500">
                &copy; {new Date().getFullYear()} {t('landing.footer_rights')}
              </div>
              <div className="flex gap-8 items-center">
                <LanguageSwitcher lightText />
                <div className="flex items-center gap-2 text-emerald-500/40">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] uppercase font-black tracking-widest">{t('landing.footer_status_online')}</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
