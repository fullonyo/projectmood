import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackgroundEffect } from "@/components/effects/background-effect";
import { StaticTextures } from "@/components/effects/static-textures";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white overflow-hidden relative">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 opacity-40">
        <BackgroundEffect type="aurora" primaryColor="#000000" />
      </div>
      <div className="fixed inset-0 z-[1] opacity-20">
        <StaticTextures type="grain" />
      </div>

      {/* Studio Header (Signature Style) */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-12 mix-blend-difference text-white">
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-40 leading-none mb-1">Studio Platform</span>
          <div className="text-2xl font-black tracking-tighter uppercase italic">MoodSpace</div>
        </div>

        <div className="flex gap-8 items-center">
          <Link href="/auth/login" className="group">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">Login</span>
          </Link>
          <Link href="/auth/register">
            <div className="px-6 py-2 border border-white/20 hover:border-white transition-all duration-500">
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Join Studio</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Studio Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 md:px-12 space-y-12">
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center justify-center gap-4 opacity-30 mb-4">
            <div className="h-[1px] w-12 bg-black" />
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase">Creative Director Access Only</span>
            <div className="h-[1px] w-12 bg-black" />
          </div>

          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
            Curate <br />
            <span className="italic text-zinc-300">Your</span> <br />
            Reality.
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-xl mx-auto font-medium tracking-tight">
            A minimalist canvas for digital curatorship. Músicas, mídias e atmosfera em um só lugar.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Link href="/auth/register" className="group">
            <div className="bg-black text-white px-16 py-6 transition-all duration-500 hover:scale-105 hover:bg-zinc-900 shadow-2xl relative overflow-hidden">
              <span className="text-xl font-black uppercase tracking-widest relative z-10">Create My Studio</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>
          </Link>
          <div className="flex items-center gap-2 opacity-20">
            <div className="w-1 h-1 rounded-full bg-black animate-pulse" />
            <span className="text-[8px] font-mono uppercase tracking-widest">Version 2.0 Deployment</span>
          </div>
        </div>

        {/* Technical Showcase cards */}
        <div className="flex gap-12 w-full max-w-5xl justify-center pt-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-mono mb-2 uppercase">01 // VISUALS</span>
            <div className="w-32 h-40 bg-zinc-100 border border-zinc-200" />
          </div>
          <div className="flex flex-col items-start translate-y-8">
            <span className="text-[8px] font-mono mb-2 uppercase">02 // AUDIO</span>
            <div className="w-32 h-40 bg-zinc-950" />
          </div>
          <div className="flex flex-col items-start -translate-y-4">
            <span className="text-[8px] font-mono mb-2 uppercase">03 // CURATION</span>
            <div className="w-32 h-40 border-2 border-dashed border-zinc-200" />
          </div>
        </div>
      </main>

      {/* Studio Footer */}
      <footer className="relative z-10 py-8 px-12 flex justify-between items-end border-t border-zinc-100 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
        <div>© 2026 MOODSPACE_SYSTEMS</div>
        <div className="flex gap-8">
          <span className="opacity-20">Privacy Protocol</span>
          <span className="opacity-20">Access Terms</span>
        </div>
      </footer>
    </div>
  );
}
