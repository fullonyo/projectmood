"use server"

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric"),
    name: z.string().optional(),
});

export async function registerUser(values: z.infer<typeof RegisterSchema>) {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos!" };
    }

    const { email, password, username, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }],
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
