import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";


// Wrapper com Tag Dinâmica correta
// NOTA: moodBlocks é incluído como fallback para perfis sem versão publicada.
// Quando todos os perfis tiverem ao menos uma publicação, este include pode ser removido.
export const getProfileWithTags = async (username: string) => {
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
            moodBlocks: {
                where: { deletedAt: null },
                orderBy: { order: "asc" }
            },
        },
    });
};
