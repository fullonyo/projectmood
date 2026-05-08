import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    ...authConfig,
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.username = (user as any).username;
                token.role = (user as any).role;
                token.isBanned = (user as any).isBanned;
            }
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }
            return token;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                (session.user as any).username = token.username;
                (session.user as any).role = token.role;
                (session.user as any).isBanned = token.isBanned;
            }
            return session;
        },
    },
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
