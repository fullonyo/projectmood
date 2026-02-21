import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";


// Wrapper com Tag Dinâmica correta
export const getProfileWithTags = async (username: string) => {
    const fn = unstable_cache(
        async () => {
            return await prisma.user.findUnique({
                where: { username },
                include: {
                    profile: {
                        include: {
                            versions: {
                                where: { isActive: true },
                                take: 1
                            }
                        }
                    },
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
