import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(1),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    // Adicionaremos SPOTIFY_CLIENT_ID e SECRET depois quando integrarmos a busca
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Erro de configuração: Variáveis de ambiente inválidas:", _env.error.format());
    throw new Error("Variáveis de ambiente inválidas.");
}

export const env = _env.data;
