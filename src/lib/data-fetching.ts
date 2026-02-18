import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

export const getPublicProfileCached = unstable_cache(
    async (username: string) => {
        return await prisma.user.findUnique({
            where: { username },
            include: {
                profile: true,
                moodBlocks: { orderBy: { order: "asc" } },
            },
        });
    },
    ["public-profile"], // Chave base
    {
        revalidate: 3600, // Revalida a cada 1 hora se não houver TAG update
        tags: ["profile"], // Tag genérica, vamos usar dinâmica na chamada se possível, mas aqui o unstable_cache pede tags estáticas na definition ou dinâmicas na key
    }
);

// Wrapper com Tag Dinâmica correta
export const getProfileWithTags = async (username: string) => {
    const fn = unstable_cache(
        async () => {
            return await prisma.user.findUnique({
                where: { username },
                include: {
                    profile: true,
                    moodBlocks: { orderBy: { order: "asc" } },
                },
            });
        },
        [`profile-${username}`],
        {
            tags: [`profile:${username}`],
            revalidate: 3600
        }
    );

    return fn();
};
