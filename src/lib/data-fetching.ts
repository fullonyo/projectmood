import prisma from "@/lib/prisma";
import { PublicUser, Room, MoodBlock, RoomVersion } from "@/types/database";

export interface PublicRoomData {
    /** Dados do criador — usa PublicUser como fonte única de verdade */
    user: PublicUser;
    room: Room;
    activeVersion: RoomVersion | null;
    moodBlocks: MoodBlock[];
    analytics: {
        views: number;
    } | null;
}

/**
 * Busca a sala primária de um usuário pelo username.
 * Usado para o link principal mood.space/username
 */
export const getPrimaryRoomByUsername = async (username: string): Promise<PublicRoomData | null> => {
    const user = await prisma.user.findFirst({
        where: { username: { equals: username, mode: 'insensitive' } },
        include: {
            rooms: {
                where: { isPrimary: true },
                include: {
                    versions: { where: { isActive: true }, take: 1 },
                    blocks: { where: { deletedAt: null }, orderBy: { order: "asc" } },
                    analytics: true
                }
            }
        }
    });

    if (!user || !(user as any).rooms[0]) return null;

    const room = (user as any).rooms[0];
    return {
        user: {
            username: user.username,
            name: user.name,
            isVerified: user.isVerified,
            verificationType: user.verificationType,
            isBanned: user.isBanned,
            // Sala primária = esta mesma sala buscada
            primaryAvatarUrl: room.avatarUrl || null
        },
        room,
        activeVersion: (room.versions?.[0] as unknown as RoomVersion) || null,
        moodBlocks: room.blocks as unknown as MoodBlock[],
        analytics: (room as any).analytics ? { views: (room as any).analytics.views } : null
    };
};

/**
 * Busca uma sala específica pelo slug.
 * Usado para o link mood.space/s/slug
 */
export const getRoomBySlug = async (slug: string): Promise<PublicRoomData | null> => {
    const room = await prisma.room.findUnique({
        where: { slug },
        include: {
            user: true,
            versions: { where: { isActive: true }, take: 1 },
            blocks: { where: { deletedAt: null }, orderBy: { order: "asc" } },
            analytics: true
        }
    });

    if (!room || !room.user) return null;

    // Busca separada do avatar da sala primária do criador (fallback para HUD público)
    const primaryRoom = await prisma.room.findFirst({
        where: { userId: room.user.id, isPrimary: true },
        select: { avatarUrl: true }
    });
    const primaryAvatarUrl = primaryRoom?.avatarUrl || null;

    return {
        user: {
            username: room.user.username,
            name: room.user.name,
            isVerified: room.user.isVerified,
            verificationType: room.user.verificationType,
            isBanned: room.user.isBanned,
            primaryAvatarUrl
        },
        room,
        activeVersion: (room.versions?.[0] as unknown as RoomVersion) || null,
        moodBlocks: room.blocks as unknown as MoodBlock[],
        analytics: (room as any).analytics ? { views: (room as any).analytics.views } : null
    };
};
