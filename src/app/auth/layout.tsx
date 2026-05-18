import { BackgroundEffect } from "@/components/effects/background-effect"
import { LanguageSwitcher } from "@/components/studio/language-switcher"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldEllipsis } from "lucide-react"
import { STUDIO_THEME } from "@/lib/studio-theme"
import { getServerTranslation } from "@/i18n/server"
import { dictionaries } from "@/i18n/config"

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { dict: rawDict } = await getServerTranslation()
    const t = rawDict || dictionaries.pt;

    return (
        <div className={`min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-white selection:text-black overflow-y-auto overflow-x-hidden relative ${STUDIO_THEME.typography.fontSans}`}>
            {/* BACKGROUND LAYER (Centralizada via Tokens) */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <BackgroundEffect 
                    type={STUDIO_THEME.effects.background.type} 
                    primaryColor={STUDIO_THEME.effects.background.primaryColor} 
                    showDots={true}
                />
            </div>

            {/* SHARED STUDIO HEADER */}
            <nav className="relative z-50 flex items-center justify-between px-4 sm:px-8 md:px-12 py-6 md:py-8 flex-shrink-0">
                <Link href="/" className="flex flex-col group">
                    <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-40 leading-none mb-1 group-hover:opacity-60 transition-opacity">
                        {t.landing.studio_platform}
                    </span>
                    <div className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic">MoodSpace</div>
                </Link>
                <div className="flex items-center gap-3 sm:gap-6">
                    <LanguageSwitcher className="hidden sm:flex opacity-50 hover:opacity-100 transition-opacity" />
                    <Link href="/">
                        <Button variant="ghost" className="text-[9px] font-black uppercase tracking-[0.3em] gap-1.5 sm:gap-2 opacity-40 hover:opacity-100 border border-transparent hover:border-white/10 hover:bg-white/5 transition-all px-2 py-1 sm:px-4 sm:py-2 h-auto">
                            <ShieldEllipsis className="w-3.5 h-3.5" />
                            {t.auth.login.abort}
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* CONTENT AREA */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
                {children}
            </main>

            {/* SHARED FOOTER */}
            <footer className="py-8 text-center text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-600 border-t border-white/5 flex-shrink-0 relative z-10">
                {t.auth.login.footer}
            </footer>
        </div>
    )
}
