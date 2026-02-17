import { auth, signOut } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeEditor } from "@/components/dashboard/theme-editor";
import { SpotifySearch } from "@/components/dashboard/spotify-search";
import { TextEditor } from "@/components/dashboard/text-editor";
import { BlockManager } from "@/components/dashboard/block-manager";
import Link from "next/link";
import { ExternalLink, LogOut, Monitor, Laptop } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const user = session.user as any;

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { username: true }
    });

    if (!dbUser) return null;

    const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
    });

    const moodBlocks = await prisma.moodBlock.findMany({
        where: { userId: user.id },
        orderBy: { order: "asc" },
    });

    // Versão da página baseada na última atualização do perfil ou blocos
    const lastBlockUpdate = moodBlocks.length > 0
        ? Math.max(...moodBlocks.map(b => b.updatedAt?.getTime() || 0))
        : 0;
    const lastProfileUpdate = profile.updatedAt?.getTime() || 0;
    const version = Math.max(lastBlockUpdate, lastProfileUpdate);

    if (!profile) return null;

    return (
        <div className="flex flex-col h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
            <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="text-xl font-black tracking-tighter">MOOD.</div>
                    <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <nav className="flex gap-4 text-sm font-medium">
                        <span className="text-black dark:text-white border-b-2 border-black dark:border-white pb-1">Editor</span>
                        <Link href={`/${dbUser.username}`} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                            Explorar
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <form action={async () => { "use server"; await signOut(); }}>
                        <Button variant="ghost" size="sm" className="gap-2 text-zinc-500 hover:text-red-500 transition-colors">
                            <LogOut className="w-4 h-4" />
                            Sair
                        </Button>
                    </form>
                    <Link href={`/${dbUser.username}`} target="_blank">
                        <Button size="sm" className="gap-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-full px-5">
                            Publicar <ExternalLink className="w-3 h-3" />
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Editor Sidebar */}
                <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto p-6 space-y-10 custom-scrollbar z-10">
                    <ThemeEditor
                        currentTheme={profile.theme}
                        currentPrimaryColor={profile.primaryColor || '#000'}
                        currentFontStyle={profile.fontStyle || 'sans'}
                    />
                    <TextEditor />
                    <SpotifySearch />
                    <BlockManager blocks={moodBlocks} />
                </aside>

                {/* Web Preview Section */}
                <section className="flex-1 bg-zinc-100 dark:bg-[#050505] p-8 overflow-hidden flex flex-col items-center">

                    <div className="w-full h-full max-w-5xl flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-zinc-200 dark:border-zinc-800 overflow-hidden">

                        {/* Browser-like Toolbar */}
                        <div className="h-10 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-4 shrink-0">
                            <div className="flex gap-1.5 focus-within:ring-2">
                                <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400/20 border border-yellow-500/20" />
                                <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-500/20" />
                            </div>
                            <div className="flex-1 max-w-sm h-6 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-white/5 flex items-center justify-center px-3">
                                <span className="text-[10px] font-medium text-zinc-400 truncate">mood.space/{dbUser.username}</span>
                            </div>
                            <div className="flex gap-2 ml-auto">
                                <Monitor className="w-3 h-3 text-zinc-400" />
                                <Laptop className="w-3 h-3 text-zinc-400" />
                            </div>
                        </div>

                        {/* Actual Content Iframe */}
                        <div className="flex-1 relative overflow-auto custom-scrollbar">
                            <iframe
                                src={`/${dbUser.username}?v=${version}`}
                                className="w-full h-full border-none"
                                title="Web Preview"
                            />
                            {/* Visual overlay to prevent accidental iframe clicks during editing while keeping the scroll visible */}
                            <div className="absolute inset-0 z-10 pointer-events-none" />
                        </div>

                    </div>

                    <div className="mt-4 flex items-center gap-2 text-zinc-400">
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">Web Aesthetic Preview</span>
                    </div>

                </section>
            </main>
        </div>
    );
}
