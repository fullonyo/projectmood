import { auth, signOut } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import Link from "next/link";
import { ExternalLink, LogOut, Monitor, Laptop } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true }
    });

    if (!user || !user.profile) {
        redirect("/onboarding");
    }

    const { profile, username } = user;

    const moodBlocks = await prisma.moodBlock.findMany({
        where: { userId: session.user.id },
        orderBy: { order: 'asc' },
    });

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden">
            {/* Fixed Dashboard Header */}
            <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-between shrink-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-30">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-black tracking-tighter">MOOD.</Link>
                    <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <Monitor className="w-3 h-3" />
                        <span>Editor Mode</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/${username}`} target="_blank">
                        <Button variant="ghost" size="sm" className="gap-2 text-xs">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver Mural Público
                        </Button>
                    </Link>
                    <form action={async () => {
                        "use server"
                        await signOut()
                    }}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </header>

            {/* Client Layout with Sidebar and Canvas */}
            <DashboardClientLayout profile={profile} moodBlocks={moodBlocks} />
        </div>
    );
}
