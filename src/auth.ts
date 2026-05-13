import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    ...authConfig,

    events: {
        async createUser({ user }) {
            const baseUsername = user.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const username = `${baseUsername}${randomSuffix}`;

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    username,
                    rooms: {
                        create: {
                            theme: "dark",
                            isPrimary: true,
                            title: "Espaço Mood Primário"
                        }
                    }
                }
            });
        }
    },
    pages: {
        signIn: "/auth/login",
    },
    secret: process.env.AUTH_SECRET,
});
