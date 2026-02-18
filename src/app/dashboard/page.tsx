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
            {/* Client Layout with Sidebars and Canvas - Header was merged into Right Sidebar */}
            <DashboardClientLayout profile={profile} moodBlocks={moodBlocks} username={username} />
        </div>
    );
}
