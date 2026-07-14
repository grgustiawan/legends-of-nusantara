# Stage 1: Install dependencies
FROM oven/bun:1-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++ nodejs npm
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Stage 2: Build the application
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bunx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/card_visualization.md ./card_visualization.md
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma db push && bun run seed && bun run start"]
