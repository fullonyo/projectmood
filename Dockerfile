
# --- Stage 1: Install dependencies ---
FROM node:20-slim AS deps
RUN apt-get update -y && apt-get install -y openssl ca-certificates
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# --- Stage 2: Build the application ---
FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl ca-certificates
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
# Note: Ensure schema.prisma has binaryTargets = ["native", "debian-openssl-3.0.x"]
RUN npx prisma generate

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

# --- Stage 3: Runner ---
FROM node:20-slim AS runner
WORKDIR /app

# Install OpenSSL and Netcat for Prisma and Healthchecks
RUN apt-get update -y && apt-get install -y openssl ca-certificates netcat-openbsd && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --home /home/nextjs nextjs
ENV HOME=/home/nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy prisma schema for runtime sync
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Copy node_modules prisma binaries for the entrypoint to use
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Copy entrypoint script
COPY --from=builder --chown=nextjs:nodejs /app/scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
RUN chmod +x ./scripts/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the blindage entrypoint
ENTRYPOINT ["./scripts/docker-entrypoint.sh"]

