import { auth, signOut } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MoodCanvas } from "@/components/dashboard/mood-canvas";
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

    if (!profile) return null;

    return (
        <div className="flex flex-col h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
            <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="text-xl font-black tracking-tighter">MOOD.</div>
                    <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <nav className="flex gap-4 text-sm font-medium">
                        <span className="text-black dark:text-white border-b-2 border-black dark:border-white pb-1">Canvas Editor</span>
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
                            Ver Espaço <ExternalLink className="w-3 h-3" />
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* New Tabbed Sidebar */}
                <DashboardSidebar profile={profile} />

                {/* Canvas Section */}
                <section className="flex-1 bg-zinc-100 dark:bg-[#050505] overflow-hidden flex flex-col">
                    <MoodCanvas blocks={moodBlocks} />
                </section>
            </main>
        </div>
    );
}
