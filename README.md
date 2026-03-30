# durvesh-nx

NX monorepo with an Angular 21 frontend, NestJS backend, Docker deployment, and GitHub Actions CI/CD.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Angular 21, standalone components |
| Backend    | NestJS 11, Webpack                |
| Language   | TypeScript 5.9                    |
| Monorepo   | NX 22, pnpm workspaces            |
| Database   | PostgreSQL 16                     |
| Proxy      | Nginx (production)                |
| Containers | Docker, Docker Compose            |
| CI/CD      | GitHub Actions                    |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

### Install dependencies

```bash
pnpm install
```

---

## Commands

### Development

Start Postgres locally (required by the backend):

```bash
pnpm dev:infra
```

Start backend and frontend together with hot reload:

```bash
pnpm dev
```

Or start them individually:

```bash
pnpm dev:backend    # NestJS  → http://localhost:3000/api
pnpm dev:frontend   # Angular → http://localhost:4200
```

> The Angular dev server proxies `/api/*` to the backend automatically via `proxy.conf.json`.

---

### Build

```bash
pnpm build            # build all apps
pnpm build:backend    # build backend only  → dist/apps/backend
pnpm build:frontend   # build frontend only → dist/apps/frontend
```

---

### Production (Docker)

Build images and start the full stack:

```bash
pnpm prod
```

Services started:

| Service  | Internal port | Exposed    |
|----------|---------------|------------|
| nginx    | 80            | :80        |
| frontend | 80            | via nginx  |
| backend  | 3000          | via nginx  |
| postgres | 5432          | internal   |

Stop everything:

```bash
pnpm prod:down
```

---

### Other

```bash
pnpm test    # run all tests
pnpm lint    # lint all apps
```

---

## API Endpoints (Backend)

Base URL in dev: `http://localhost:3000/api`

| Method | Path         | Description  |
|--------|--------------|--------------|
| GET    | /api         | Hello message |
| GET    | /api/health  | Health check  |

---

## Shared Libraries

Import shared types in any app or service:

```ts
import type { User, LoginDto, ApiResponse } from '@durvesh-nx/shared-types';
```

Import shared NestJS guards/interceptors:

```ts
import { CommonModule, JwtAuthGuard, Public } from '@durvesh-nx/backend-common';
```

Path aliases are configured in `tsconfig.base.json`.

---

## CI/CD (GitHub Actions)

Workflow file: `.github/workflows/ci.yml`

| Job    | Trigger        | Steps                                 |
|--------|----------------|---------------------------------------|
| ci     | push / PR      | lint → test → build → upload artifacts |
| docker | push to `main` | build & push images to GHCR           |

Docker images are pushed to GitHub Container Registry (`ghcr.io`) on every merge to `main`.

---

## Database Migrations

Run migrations to set up the database schema:

```bash
# Development (uses config/backend/.env)
pnpm migrate:dev

# Production (uses environment variables)
export DATABASE_URL=postgresql://user:pass@host:5432/dbname
pnpm migrate:prod
```

Migration files are located in `apps/backend/src/migrations/`. See [Migration README](apps/backend/src/migrations/README.md) for details.

---

## Environment Variables

Create a `.env` file at the project root for production overrides (use `.env.example` as template):

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_ACCESS_SECRET=your-secure-secret-minimum-32-chars
JWT_REFRESH_SECRET=your-secure-secret-minimum-32-chars
```

Backend reads from environment at runtime:

| Variable             | Default                                          | Description                |
|----------------------|--------------------------------------------------|----------------------------|
| DATABASE_URL         | postgresql://postgres:postgres@localhost:5432/... | Postgres connection string |
| DB_HOST              | localhost                                        | Database host (alternative) |
| DB_PORT              | 5432                                             | Database port (alternative) |
| DB_USER              | postgres                                         | Database user (alternative) |
| DB_PASSWORD          | -                                                | Database password (alternative) |
| DB_NAME              | durvesh_project                                  | Database name (alternative) |
| JWT_ACCESS_SECRET    | -                                                | JWT access token secret    |
| JWT_REFRESH_SECRET   | -                                                | JWT refresh token secret   |
| JWT_ACCESS_EXPIRES_IN| 1d                                               | Access token expiration    |
| JWT_REFRESH_EXPIRES_IN| 7d                                              | Refresh token expiration   |
| PORT                 | 3000                                             | NestJS port                |
| FRONTEND_URL         | http://localhost:4200                            | CORS origin                |
| NODE_ENV             | development                                      | Environment mode           |

**Note:** Use `DATABASE_URL` for production, or individual `DB_*` variables for development.

---

## Deployment

### Local Production Build

Test the full production stack locally:

```bash
pnpm prod      # starts all services with Docker Compose
pnpm prod:down # stops all services
```

### AWS Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive AWS deployment guides covering:

- **ECS Fargate** (recommended for containers)
- **App Runner** (easiest, fully managed)
- **Elastic Beanstalk** (Docker Compose support)

Includes:
- Infrastructure setup
- Database migration steps
- Environment configuration
- Security checklist
- Monitoring & logging
- CI/CD integration

---

## Adding a New Backend Service

1. Copy `apps/backend/` → `apps/my-service/`
2. Update `name` in `apps/my-service/package.json` → `@durvesh-nx/my-service`
3. Update port in `apps/my-service/src/main.ts`
4. Add a service block in `deployment/docker-compose.yml`
5. Add a `location /my-prefix/` block in `deployment/nginx/nginx.conf`
