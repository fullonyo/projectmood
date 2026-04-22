"use server"

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { RegisterSchema } from "@/lib/validations";

export async function registerUser(values: z.infer<typeof RegisterSchema>) {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos!" };
    }

    const { email, password, username: rawUsername, name } = validatedFields.data;
    const username = rawUsername.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username: { equals: username, mode: 'insensitive' } }
            ],
        },
    });

    if (existingUser) {
        return { error: "Email ou Username já em uso!" };
    }

    try {
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                name,
                profile: {
                    create: {
                        theme: "dark",
                    },
                },
            },
        });

        return { success: "Usuário criado com sucesso!", user };
    } catch (error) {
        return { error: "Ocorreu um erro ao criar a conta." };
    }
}
