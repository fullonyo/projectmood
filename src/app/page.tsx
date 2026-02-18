import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white overflow-hidden">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-6 md:px-12 border-b border-zinc-100 flex-shrink-0">
        <div className="text-2xl font-black tracking-tighter">MOOD.</div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Começar Agora</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-12 space-y-8 overflow-y-auto">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none text-balance">
            Crie seu <span className="bg-black text-white px-2">espaço</span>, sinta seu <span className="text-zinc-400">mood.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 max-w-xl mx-auto font-medium">
            Um espaço único para expressar quem você é hoje. Estilos, músicas, textos e o que mais você quiser.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="px-12 py-8 text-xl">Criar Meu Espaço</Button>
          </Link>
        </div>

        {/* Floating elements simulation / Mood cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pb-8">
          <div className="p-8 rounded-[40px] bg-zinc-50 border border-zinc-100 space-y-4 rotate-[-2deg]">
            <div className="w-12 h-12 rounded-full bg-zinc-200 animate-pulse" />
            <div className="h-6 w-3/4 bg-zinc-200 rounded-full" />
            <div className="h-4 w-1/2 bg-zinc-200 rounded-full" />
          </div>
          <div className="p-8 rounded-[40px] bg-black text-white space-y-4 scale-110 shadow-2xl z-10">
            <div className="w-12 h-12 rounded-full bg-zinc-800" />
            <div className="h-6 w-3/4 bg-zinc-800 rounded-full" />
            <div className="h-4 w-1/2 bg-zinc-800 rounded-full" />
          </div>
          <div className="p-8 rounded-[40px] bg-zinc-50 border border-zinc-100 space-y-4 rotate-[2deg]">
            <div className="w-12 h-12 rounded-full bg-zinc-200 animate-pulse" />
            <div className="h-6 w-3/4 bg-zinc-200 rounded-full" />
            <div className="h-4 w-1/2 bg-zinc-200 rounded-full" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-zinc-400 border-t border-zinc-100 text-sm flex-shrink-0">
        © 2026 MOOD Project. O seu espaço, o seu estilo.
      </footer>
    </div>
  );
}
