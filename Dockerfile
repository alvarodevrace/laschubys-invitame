# Multi-stage build for LasChubys-Invitame (Angular 21 SSR)
FROM oven/bun:1-slim AS base
WORKDIR /app

# --- Install dependencies ---
FROM base AS deps
ENV NODE_ENV=development
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# --- Build production bundle ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# --- Production runtime ---
FROM oven/bun:1-slim AS runner
WORKDIR /app
# curl is required for the container healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=4321
ENV HOST=0.0.0.0
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:4321/ || exit 1
CMD ["bun", "dist/laschubys-invitame/server/server.mjs"]
