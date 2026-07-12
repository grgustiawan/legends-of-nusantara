# Stage 1: Install dependencies
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN bun install

# Stage 2: Build the application
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client
RUN bunx prisma generate
# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Stage 3: Production runner
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
# We copy node_modules to ensure prisma CLI and seeder scripts run successfully
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/card_visualization.md ./card_visualization.md
COPY --from=builder /app/src ./src

# Expose port
EXPOSE 3000

# Start script for production
# Runs migrations, seed the database, and starts the optimized Next.js server
CMD ["sh", "-c", "bunx prisma db push && bun run seed && bun run start"]
