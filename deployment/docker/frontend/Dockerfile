FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile
COPY apps/frontend ./apps/frontend
COPY libs ./libs
COPY tsconfig.base.json ./
RUN pnpm exec nx build frontend --configuration=production

FROM nginx:alpine AS runner
COPY --from=builder /app/dist/apps/frontend/browser /usr/share/nginx/html
COPY deployment/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
