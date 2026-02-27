// Prisma Client Singleton
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = (process.env.NODE_ENV === "production")
    ? prismaClientSingleton()
    : (globalThis.prisma ?? prismaClientSingleton());

export default prisma;

// Force refresh: 2026-02-27T12:00:00
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
