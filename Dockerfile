# --- Base Node Image ---
FROM node:20-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update -y && apt-get install -y openssl ca-certificates netcat-openbsd && rm -rf /var/lib/apt/lists/*

# --- Stage 1: Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Usamos mount de cache para acelerar instalações futuras
RUN --mount=type=cache,target=/root/.npm npm ci

# --- Stage 2: Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gera o Prisma Client e faz o build
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

RUN npx prisma generate
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

# --- Stage 3: Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Criação de usuário de sistema para segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copia arquivos necessários do Standalone
# O modo standalone já traz o servidor node otimizado
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Arquivos necessários para o Prisma (Sincronização no boot)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

# CRÍTICO: next/og (ImageResponse) depende de WASMs que o standalone não copia
# Sem isso, a rota opengraph-image retorna 502 em produção
COPY --from=builder /app/node_modules/next/dist/compiled/@vercel/og ./node_modules/next/dist/compiled/@vercel/og

# Script de entrada
COPY --from=builder /app/scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
RUN chmod +x ./scripts/docker-entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
