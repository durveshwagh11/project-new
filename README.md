# durvesh-nx

NX monorepo with an Angular 21 frontend, NestJS backend, Docker deployment, and GitHub Actions CI/CD.

---

## Project Structure

```
durvesh-nx/
├── apps/
│   ├── frontend/                        # Angular 21 (standalone, lazy-loaded routes)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.component.ts     # Root shell with <router-outlet>
│   │   │   │   ├── app.config.ts        # provideRouter, provideHttpClient
│   │   │   │   ├── app.routes.ts        # Lazy routes
│   │   │   │   ├── core/
│   │   │   │   │   └── services/
│   │   │   │   │       └── auth.service.ts
│   │   │   │   └── features/
│   │   │   │       ├── home/            # HomeComponent
│   │   │   │       └── auth/
│   │   │   │           ├── login/       # LoginComponent
│   │   │   │           └── register/    # RegisterComponent
│   │   │   ├── index.html
│   │   │   └── styles.scss
│   │   ├── project.json                 # NX build / serve / test targets
│   │   ├── proxy.conf.json             # Dev proxy: /api → :3000
│   │   └── Dockerfile
│   │
│   └── backend/                         # NestJS (port 3000, prefix /api)
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.module.ts
│       │   │   ├── app.controller.ts    # GET /api, GET /api/health
│       │   │   └── app.service.ts
│       │   └── main.ts
│       ├── webpack.config.js
│       ├── package.json
│       └── Dockerfile
│
├── libs/
│   ├── shared/
│   │   └── types/                       # Shared TypeScript interfaces (used by all apps)
│   │       └── src/
│   │           ├── lib/
│   │           │   ├── user.types.ts    # User, LoginDto, RegisterDto, AuthToken
│   │           │   └── api-response.types.ts
│   │           └── index.ts
│   └── backend-common/                  # Shared NestJS building blocks
│       └── src/
│           ├── lib/
│           │   ├── guards/jwt-auth.guard.ts
│           │   ├── decorators/
│           │   │   ├── public.decorator.ts
│           │   │   └── current-user.decorator.ts
│           │   ├── interceptors/logging.interceptor.ts
│           │   └── common.module.ts
│           └── index.ts
│
├── deployment/
│   ├── docker-compose.yml               # Production stack
│   ├── docker-compose.dev.yml           # Dev infra only (Postgres + pgAdmin)
│   └── nginx/
│       └── nginx.conf                   # Routes /api → backend, / → frontend
│
├── .github/
│   └── workflows/
│       └── ci.yml                       # Lint → Test → Build → Docker push (main only)
│
├── tsconfig.base.json                   # Shared TS config + path aliases
├── tsconfig.json                        # Workspace references
├── nx.json                              # NX plugins and target defaults
├── package.json                         # Scripts + all dependencies
└── pnpm-workspace.yaml                  # Workspace packages: apps/* + libs/**
```

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

## Environment Variables

Create a `.env` file at the project root for production overrides:

```env
JWT_SECRET=your-secret-here
```

Backend reads from environment at runtime:

| Variable       | Default                                          | Description          |
|----------------|--------------------------------------------------|----------------------|
| PORT           | 3000                                             | NestJS port          |
| FRONTEND_URL   | http://localhost:4200                            | CORS origin          |
| DATABASE_URL   | postgresql://postgres:postgres@postgres:5432/... | Postgres connection  |
| JWT_SECRET     | change-me-in-production                          | JWT signing secret   |

---

## Adding a New Backend Service

1. Copy `apps/backend/` → `apps/my-service/`
2. Update `name` in `apps/my-service/package.json` → `@durvesh-nx/my-service`
3. Update port in `apps/my-service/src/main.ts`
4. Add a service block in `deployment/docker-compose.yml`
5. Add a `location /my-prefix/` block in `deployment/nginx/nginx.conf`
