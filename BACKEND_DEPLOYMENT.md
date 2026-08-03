# GitProfileStats — Backend Production Deployment Guide

This document outlines the production configuration, build pipelines, environment settings, and runtime checks for the stateless backend API (`@gitprofilestats/api`) of the GitProfileStats platform.

Target platforms: **Railway** (preferred) or **Render**.

---

## 🛠️ Production Configuration Files

We use infrastructure-as-code and platform-native configuration files in the monorepo root to automate builds and deployments.

### 1. Railway Configuration (`railway.json`)
The [railway.json](file:///d:/AI/Projects/GitProfileStats/railway.json) file defines the build system (Nixpacks) and deployment parameters. Nixpacks detects the monorepo structure, builds the project, and runs the API backend dynamically.

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm build:api"
  },
  "deploy": {
    "startCommand": "pnpm start:api",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 120,
    "restartPolicyMaxRetries": 3
  }
}
```

### 2. Render Configuration (`render.yaml`)
The [render.yaml](file:///d:/AI/Projects/GitProfileStats/render.yaml) file defines the blueprint spec for hosting the backend on Render as a Web Service.

```yaml
services:
  - type: web
    name: git-profile-stats-api
    env: node
    plan: free
    buildCommand: pnpm build:api
    startCommand: pnpm start:api
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: LOG_LEVEL
        value: info
      - key: WEB_BASE_URL
        sync: false
      - key: GITHUB_CLIENT_ID
        sync: false
      - key: GITHUB_CLIENT_SECRET
        sync: false
      - key: GITHUB_CALLBACK_URL
        sync: false
      - key: GITHUB_TOKEN
        sync: false
```

---

## 🔑 Environment Variables Verification

The API backend enforces strict environment variable validation at startup using a Zod schema in [env.ts](file:///d:/AI/Projects/GitProfileStats/apps/api/src/config/env.ts). If any required environment variable is missing or invalid, the process will fail-fast and crash (`process.exit(1)`), preventing degraded or insecure operation.

### Configured Schema
The following table details the variables parsed by [env.ts](file:///d:/AI/Projects/GitProfileStats/apps/api/src/config/env.ts):

| Variable Name | Type / Constraints | Default Value | Description |
| :--- | :--- | :--- | :--- |
| **`NODE_ENV`** | `development` \| `production` \| `test` | `development` | Setting this to `production` disables debug tools like `pino-pretty` and activates production-optimized builds. |
| **`PORT`** | `number` (coerced) | `4000` | The port the Express application listens to. (On Railway, `PORT` is dynamically injected; on Render it defaults to `10000`). |
| **`WEB_BASE_URL`** | `string` (valid URL) | `http://localhost:3000` | Frontend application's base URL (e.g. Next.js app on Vercel). Lock CORS to this origin. |
| **`LOG_LEVEL`** | `fatal` \| `error` \| `warn` \| `info` \| `debug` \| `trace` | `info` | Minimum severity level of logs outputted to stdout. |
| **`GITHUB_CLIENT_ID`** | `string` (Required) | *None* | GitHub OAuth Client ID for authenticating users. |
| **`GITHUB_CLIENT_SECRET`**| `string` (Required) | *None* | GitHub OAuth Client Secret. Keep this secure! |
| **`GITHUB_CALLBACK_URL`** | `string` (Required) | *None* | Authorization callback redirect URL. Must match the callback URL configured in the GitHub Developer settings (e.g. `https://your-api.railway.app/api/v1/auth/github/callback`). |
| **`GITHUB_TOKEN`** | `string` (Required) | *None* | Fallback GitHub Personal Access Token (PAT) used to fetch public profiles, mitigating API rate-limiting issues for unauthenticated requests. |

> [!IMPORTANT]
> A template configuration file [.env.production.example](file:///d:/AI/Projects/GitProfileStats/.env.production.example) is provided in the repository root to help configure these keys on hosting dashboards.

---

## 🏥 Health Check Endpoint

The server exposes a health monitoring endpoint at `/health` mapped in [app.ts](file:///d:/AI/Projects/GitProfileStats/apps/api/src/app.ts):
```typescript
app.get('/health', healthController.check);
```

### Verification & Resiliency
The route logic is defined in [HealthController.ts](file:///d:/AI/Projects/GitProfileStats/apps/api/src/infrastructure/http/controllers/HealthController.ts) and executes:
1. **System Stats**: Collects runtime metrics such as memory usage (`rss`, `heapTotal`, `heapUsed`), node version, and system uptime.
2. **Upstream Health Check**: Checks connection to the GitHub API via the default PAT token (`GITHUB_TOKEN`).
3. **Timeout Protection**: Protects resource pools by racing the GitHub API check against a **3-second timeout**. If GitHub times out, the service returns `status: "degraded"` but **does not crash**.
4. **Platform Compatibility**: The endpoint returns an HTTP `200` status code even when degraded. This prevents orchestrators (Railway/Render) from unnecessarily cycling or killing the container during temporary GitHub API outages.

### Example `/health` Output
```json
{
  "status": "ok",
  "uptime": 142.34,
  "timestamp": "2026-08-04T00:07:42.138Z",
  "environment": "production",
  "services": {
    "githubApi": {
      "status": "healthy",
      "message": "Reachable"
    }
  },
  "system": {
    "memoryUsage": {
      "rss": "42.12 MB",
      "heapTotal": "22.50 MB",
      "heapUsed": "12.87 MB"
    },
    "nodeVersion": "v20.11.0"
  }
}
```

---

## 🏗️ Build & Startup Commands

Commands are managed at the root [package.json](file:///d:/AI/Projects/GitProfileStats/package.json) using workspace-aware scripts and Turborepo filters:

### 1. Build Verification (`pnpm build:api`)
- Runs: `turbo run build --filter=@gitprofilestats/api`
- Behavior: Transpiles TypeScript from `apps/api/src` to ES Modules in `apps/api/dist` using `tsc` matching the configuration in [tsconfig.json](file:///d:/AI/Projects/GitProfileStats/apps/api/tsconfig.json).
- Local verification: Successfully compiled locally inside ~7.2 seconds without any TypeScript/decorator warnings.

### 2. Startup Verification (`pnpm start:api`)
- Runs: `pnpm --filter=@gitprofilestats/api start`
- Behavior: Invokes `node dist/main.js` inside the `apps/api` folder.
- Local verification: Executed and successfully listening on port 4000.

---

## 📝 Logging Configuration

Logging is set up in [logger.ts](file:///d:/AI/Projects/GitProfileStats/apps/api/src/config/logger.ts) using the **Pino** structured logging library.

### Verification of Production Logging
- **Structured JSON Logs**: In production (`NODE_ENV=production`), `pino` outputs raw, newline-delimited JSON logs to standard output. This allows cloud log collectors (Datadog, CloudWatch, Railway Log Streams) to query and parse logs instantly.
- **Performance Optimization**: Bypasses the `pino-pretty` formatter in production to avoid the high CPU overhead associated with terminal colorization and string formatting.
- **Dynamic Log Level**: Configurable dynamically via the `LOG_LEVEL` environment variable.

Example production log entry format:
```json
{"level":30,"time":1785802062138,"pid":4561,"hostname":"railway-api-service","method":"GET","url":"/health","msg":"Incoming request"}
```

---

## 🛠️ Monorepo Deployment Steps

### Phase A: Setup Backend Service
1. Link your Git repository to **Railway** or **Render**.
2. Set the Root Directory of the service to the project root (monorepo root).
3. Set the **Build Command** to: `pnpm build:api`
4. Set the **Start Command** to: `pnpm start:api`
5. Configure the environment variables in the platform dashboard using [.env.production.example](file:///d:/AI/Projects/GitProfileStats/.env.production.example) as reference.
6. Trigger the build and verify the health check endpoint responds.

### Phase B: Connect Frontend
1. Deploy the Next.js frontend (e.g. to Vercel), setting the build root to `apps/web`.
2. Configure `NEXT_PUBLIC_API_URL` on the frontend pointing to the deployed backend's URL.
3. Configure `WEB_BASE_URL` on the backend pointing to the deployed frontend's URL.
