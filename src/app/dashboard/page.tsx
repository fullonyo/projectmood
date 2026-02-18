import { auth, signOut } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import Link from "next/link";
import { ExternalLink, LogOut, Eye } from "lucide-react";
import { ShareProfileButton } from "@/components/dashboard/share-profile-button";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true }
    });

    if (!user) {
        redirect("/auth/register"); // Se o user sumiu do banco mas tem sessão, forçamos re-registro ou login
    }

    let currentProfile = user.profile;

    // Auto-reparo: Se o usuário existe mas não tem perfil, criamos um padrão agora.
    if (!currentProfile) {
        currentProfile = await prisma.profile.create({
            data: {
                userId: user.id,
                theme: "light",
            }
        });
    }

    const { username } = user;
    const profile = currentProfile;

    const moodBlocks = await prisma.moodBlock.findMany({
        where: { userId: session.user.id },
        orderBy: { order: 'asc' },
    });

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden">
            {/* Fixed Dashboard Header */}
            <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-between shrink-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-[1100]">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-black tracking-tighter hover:opacity-60 transition-opacity">MOOD.</Link>
                    <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <Eye className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Editor</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <ShareProfileButton username={username} />

                    <Link href={`/${username}`} target="_blank">
                        <Button
                            size="sm"
                            className="gap-2 text-xs font-black uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-transform"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver Espaço
                        </Button>
                    </Link>
                    <form action={async () => {
                        "use server"
                        await signOut()
                    }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                            title="Sair"
                        >
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
