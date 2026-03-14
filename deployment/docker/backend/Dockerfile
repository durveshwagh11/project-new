FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile
COPY apps/backend ./apps/backend
COPY libs ./libs
COPY tsconfig.base.json ./
RUN pnpm --filter @durvesh-nx/backend build

FROM node:20-alpine AS runner
RUN corepack enable
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app
COPY --from=builder /app/dist/apps/backend ./
COPY --from=builder /app/apps/backend/package.json ./
RUN pnpm install --prod --frozen-lockfile
EXPOSE 3000
CMD ["node", "main.js"]
