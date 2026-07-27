<div align="center">

# 🚀 GitProfileStats

### Advanced GitHub Analytics & Dynamic Profile Card Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.5-blueviolet?logo=turborepo&logoColor=white)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15-orange?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**Generate beautiful, dynamic SVG stats cards for your GitHub profile — including private repository analytics.**

</div>

---

## ✨ Features

- 🔐 **Authenticated Analytics** — Securely access both public and private repository metrics
- 📊 **Dynamic SVG Cards** — Embed real-time stat cards in your GitHub profile README
- 🎨 **Themeable** — Choose from multiple themes (Dark, Dracula, Nord, Cyberpunk, and more)
- ⚡ **Blazing Fast** — Multi-tier caching delivers sub-100ms SVG responses
- 🛡️ **Enterprise Security** — AES-256-GCM token encryption, OWASP-compliant headers
- 📈 **Advanced Metrics** — Commit streaks, language breakdowns, PR analytics, code review impact

---

## 🏗️ Architecture

This is a **Turborepo monorepo** following **Clean Architecture + Domain-Driven Design (DDD)** principles.

```
git-profile-stats/
├── apps/
│   ├── api/          # Express.js backend (Clean Architecture layers)
│   └── web/          # Next.js dashboard & card customizer
├── packages/
│   ├── types/        # Shared TypeScript type definitions
│   ├── shared/       # Shared utilities & constants
│   ├── ui/           # SVG card templates & rendering engine
│   ├── github-sdk/   # Typed GitHub API client (GraphQL + REST)
│   └── config/       # Shared ESLint, TypeScript, Prettier configs
└── infra/            # Terraform & Docker infrastructure
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker** & **Docker Compose** (for local PostgreSQL & Redis)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/git-profile-stats.git
cd git-profile-stats

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your GitHub OAuth credentials and secrets

# 4. Start local infrastructure (PostgreSQL + Redis)
docker compose up -d

# 5. Run database migrations
pnpm db:migrate

# 6. Start all apps in development mode
pnpm dev
```

### Available Scripts

| Command              | Description                                  |
| :------------------- | :------------------------------------------- |
| `pnpm dev`           | Start all apps in development mode           |
| `pnpm build`         | Build all apps and packages                  |
| `pnpm lint`          | Lint all workspaces                          |
| `pnpm typecheck`     | Run TypeScript type-checking                 |
| `pnpm test`          | Run all tests                                |
| `pnpm format`        | Format all files with Prettier               |
| `pnpm db:migrate`    | Run Prisma database migrations               |
| `pnpm db:generate`   | Regenerate Prisma client                     |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
