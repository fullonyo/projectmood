import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Role } from "@prisma/client"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            username: string | null
            role: Role
            isBanned: boolean
        } & DefaultSession["user"]
    }

    interface User {
        username?: string | null
        role?: Role
        isBanned?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string
        username?: string | null
        role?: Role
        isBanned?: boolean
    }
}

// Extensão crucial para o PrismaAdapter
declare module "@auth/core/adapters" {
    interface AdapterUser {
        username?: string | null
        role?: Role
        isBanned?: boolean
    }
}
