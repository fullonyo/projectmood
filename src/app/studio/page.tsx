import { Metadata } from "next";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StudioClientLayout } from "@/components/studio/studio-client-layout";
import { computeHasUnpublishedChanges } from "@/actions/publish";
import { getFeatureFlags } from "@/actions/system-config";
import { MoodBlock } from "@/types/database";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Studio",
};

export default async function StudioPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const user = (await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { 
            rooms: {
                where: { isPrimary: true },
            } 
        }
    })) as any;

    if (!user) {
        redirect("/auth/register");
    }

    if (user.isBanned) {
        redirect("/banned");
    }

    // 1. Identificar a sala primária
    let currentRoom = user.rooms[0];

    // 2. Fallback: Criar sala primária se o usuário for novo (raro chegar aqui sem sala)
    if (!currentRoom) {
        currentRoom = await prisma.$transaction(async (tx) => {
            const room = await tx.room.create({
                data: {
                    userId: user.id,
                    theme: "light",
                    isPrimary: true,
                    title: "Meu Quarto"
                }
            });

            await tx.roomVersion.create({
                data: {
                    roomId: room.id,
                    blocks: [],
                    profileData: {
                        theme: room.theme,
                        title: room.title
                    },
                    isActive: true,
                    label: "v1"
                }
            });

            return room;
        });
    }

    const { username } = user;

    // 3. Carregar blocos da sala selecionada
    const moodBlocks = (await prisma.moodBlock.findMany({
        where: { roomId: currentRoom.id, deletedAt: null },
        orderBy: { order: 'asc' },
    })) as MoodBlock[];

    // 4. Carregar metadados de publicação
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

    // 5. Carregar lista de todas as salas para o switcher
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
