import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            username: string
            role: string
            isBanned: boolean
        } & DefaultSession["user"]
    }

    interface User {
        username: string
        role: string
        isBanned: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        username: string
        role: string
        isBanned: boolean
    }
}
