FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --frozen-lockfile
COPY apps/frontend ./apps/frontend
COPY nx.json tsconfig.base.json tsconfig.json ./
RUN pnpm exec nx build frontend --configuration=production

FROM nginx:alpine AS runner
COPY --from=builder /app/dist/apps/frontend /usr/share/nginx/html
COPY deployment/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
