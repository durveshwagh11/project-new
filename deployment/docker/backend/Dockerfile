FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --frozen-lockfile
COPY apps/backend ./apps/backend
COPY nx.json tsconfig.base.json tsconfig.json ./
RUN pnpm exec nx build backend
RUN pnpm prune --prod

FROM node:22-alpine AS runner
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

COPY --from=builder /app/dist/apps/backend ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "main.js"]
