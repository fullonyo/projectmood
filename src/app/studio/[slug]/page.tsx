import { Metadata } from "next";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StudioClientLayout } from "@/components/studio/studio-client-layout";
import { computeHasUnpublishedChanges } from "@/actions/publish";
import { getFeatureFlags } from "@/actions/system-config";
import { MoodBlock } from "@/types/database";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Studio",
};

interface StudioRoomProps {
    params: Promise<{ slug: string }>;
}

export default async function StudioRoomPage({ params }: StudioRoomProps) {
    const session = await auth();
    const { slug } = await params;

    if (!session?.user) {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect("/auth/register");
    }

    if (user.isBanned) {
        redirect("/banned");
    }

    // 1. Carregar a sala específica pelo slug e userId
    const currentRoom = await prisma.room.findFirst({
        where: { 
            slug, 
            userId: session.user.id 
        }
    });

    if (!currentRoom) {
        // Se não encontrar o espaço pelo slug pertencente ao usuário, 404 no studio
        notFound();
    }

    const { username } = user;

    // 2. Carregar blocos da sala selecionada
    const moodBlocks = (await prisma.moodBlock.findMany({
        where: { roomId: currentRoom.id, deletedAt: null },
        orderBy: { order: 'asc' },
    })) as MoodBlock[];

    // 3. Carregar metadados de publicação
    const activeVersion = await prisma.roomVersion.findFirst({
        where: { roomId: currentRoom.id, isActive: true },
        select: { createdAt: true }
    });
    const publishedAt = activeVersion?.createdAt?.toISOString() || null;

    const hasUnpublishedChanges = await computeHasUnpublishedChanges(currentRoom, moodBlocks);

    const isAdmin = (session.user as any)?.role === "ADMIN";
    const rawFlags = await getFeatureFlags();
    const systemFlags = rawFlags.reduce((acc: Record<string, boolean>, flag: { key: string, isEnabled: boolean }) => {
        acc[flag.key] = flag.isEnabled;
        return acc;
    }, {} as Record<string, boolean>);

    // 4. Carregar lista de todas as salas para o switcher
    const allRooms = await prisma.room.findMany({
        where: { userId: session.user.id },
        select: { id: true, title: true, slug: true, isPrimary: true, type: true, userId: true, avatarUrl: true },
        orderBy: { createdAt: 'desc' }
    });

    const userAvatar = allRooms.find(r => r.isPrimary)?.avatarUrl || null;

    return (
        <div className={cn(
            "h-screen flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden",
            currentRoom.theme === 'dark' ? 'dark' : ''
        )}>
            <StudioClientLayout
                profile={currentRoom as any}
                moodBlocks={moodBlocks}
                username={username}
                name={user.name}
                publishedAt={publishedAt}
                hasUnpublishedChanges={hasUnpublishedChanges}
                isAdmin={isAdmin}
                systemFlags={systemFlags}
                allRooms={allRooms}
                userAvatar={userAvatar}
            />
        </div>
    );
}
