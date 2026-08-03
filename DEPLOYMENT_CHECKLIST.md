# GitProfileStats — Production Deployment Checklist

This document provides a comprehensive checklist and status overview for deploying the **GitProfileStats** platform to production. All code, build pipelines, environment configurations, and security policies have been verified.

---

## 🚀 Status Summary

| Task | Category | Status | Details |
| :--- | :--- | :---: | :--- |
| **Build Systems Verification** | Build | ✅ PASS | Turbo-orchestrated Next.js & TypeScript compilations pass without errors. |
| **Development-only Code Cleanup** | Security | ✅ PASS | All sandbox test routes (`/api/test/github/*`) have been removed from `app.ts`. |
| **Environment Configuration** | Config | ✅ PASS | Strict Zod validation on backend; production environment templates updated. |
| **API URLs Resolution** | Integration | ✅ PASS | Dynamic URL configuration, preventing hardcoded `localhost` leaks. |
| **CORS Access Controls** | Security | ✅ PASS | Locked to authorized `WEB_BASE_URL` with secure credential handling. |
| **Production Launch Scripts** | Operations | ✅ PASS | Configured with Turborepo package filters for monorepo separation. |
| **Health Check Endpoint** | Reliability | ✅ PASS | Resilient `/health` route validating memory, uptime, and GitHub connection. |
| **Structured Logging** | Monitoring | ✅ PASS | Pino logs outputting JSON in production, bypassing slow pretty-printers. |

---

## 📋 Checklist & Verification Details

### 1. Build Verification
Production builds for both apps compile cleanly using:
```bash
pnpm build
```
- **Backend API (`@gitprofilestats/api`)**: Compiles via `tsc` to the `dist/` directory. Zero compiler warnings or decorator conflicts.
- **Frontend Client (`@gitprofilestats/web`)**: Next.js (Turbopack) optimizes pages and outputs static chunks under `.next/` with full type safety.

---

### 2. Development-Only Code Removal
- All `/api/test/github/...` endpoints (previously in [app.ts](file:///d:/AI/Projects/GitProfileStats/apps/api/src/app.ts)) have been completely deleted.
- Unused GitHub statistics imports in `app.ts` were pruned to keep the codebase clean.
- Fixed 3 ESLint `any` errors in `apps/web/src/app/dashboard/themes/page.tsx` to enable successful CI lint checking.

---

### 3. Environment Variables Validation
All variables are validated on startup to prevent misconfigurations:
- **Backend API (`apps/api/src/config/env.ts`)**: Uses Zod to parse `process.env`. The service will fail-fast and crash on startup if required variables are missing:
  - `NODE_ENV` (must be `production`)
  - `PORT` (numeric port)
  - `WEB_BASE_URL` (Frontend client URL, e.g. `https://git-profile-stats.vercel.app`)
  - `LOG_LEVEL` (recommended `info` or `warn`)
  - `GITHUB_CLIENT_ID` (GitHub OAuth application ID)
  - `GITHUB_CLIENT_SECRET` (GitHub OAuth secret)
  - `GITHUB_CALLBACK_URL` (OAuth redirect path)
  - `GITHUB_TOKEN` (Fallback PAT for rate-limit protection)
- **Frontend Client (`apps/web/src/config/env.ts`)**:
  - Checks `NEXT_PUBLIC_API_URL` (URL of deployed backend). Logs a runtime warning if missing in production.

> [!IMPORTANT]
> A template file [.env.production.example](file:///d:/AI/Projects/GitProfileStats/.env.production.example) has been created to guide environment configuration on Vercel, Railway, and Render.

---

### 4. API URLs & CORS Verification
- The Next.js frontend uses `NEXT_PUBLIC_API_URL` to route all fetch requests, falling back to `http://localhost:4000` only during local development.
- CORS middleware is explicitly locked to the frontend client URL:
  ```typescript
  app.use(cors({ origin: env.WEB_BASE_URL, credentials: true }));
  ```
- This configuration ensures that cross-origin scripts cannot query user authentication endpoints, while preserving cookie/credentials capabilities.

---

### 5. Monorepo Production Scripts
The root [package.json](file:///d:/AI/Projects/GitProfileStats/package.json) contains targeted commands to compile and launch services independently:
- **Build Services**:
  - Backend: `pnpm build:api` (equivalent to `turbo run build --filter=@gitprofilestats/api`)
  - Frontend: `pnpm build:web` (equivalent to `turbo run build --filter=@gitprofilestats/web`)
- **Start Services**:
  - Backend: `pnpm start:api` (launches compiled `node dist/main.js` from `apps/api`)
  - Frontend: `pnpm start:web` (launches `next start` from `apps/web`)

---

### 6. Health & Live Status Monitoring
- The API includes a secure `/health` endpoint defined in [HealthController.ts](file:///d:/AI/Projects/GitProfileStats/apps/api/src/infrastructure/http/controllers/HealthController.ts).
- Returns system statistics including uptime, environment status, and node version.
- Measures system memory usage (`rss`, `heapTotal`, `heapUsed`).
- **Resilient Upstream Check**: Connects to the GitHub API via the default fallback token with a **3-second timeout protection** to prevent resource exhaustion during GitHub service outages. Returns a degraded status instead of crashing.

---

### 7. Structured Production Logging
- Log level is dynamic and configured via the `LOG_LEVEL` environment variable.
- In production (`NODE_ENV=production`), `pino` structured JSON logging is active. It is designed for standard log aggregators (e.g. Logflare, Datadog, AWS CloudWatch).
- Pretty printing via `pino-pretty` is automatically disabled in production for performance.
- Global exception handler ([errorHandler.ts](file:///d:/AI/Projects/GitProfileStats/apps/api/src/infrastructure/http/middleware/errorHandler.ts)) structured to catch, log, and respond to uncaught errors cleanly.

---

## 🛠️ Step-by-Step Deployment Instructions

### Phase A: Deploy Backend API (Railway or Render)
1. Link the repository to Railway or Render.
2. Configure build and start commands using the root config:
   - **Build Command**: `pnpm build:api`
   - **Start Command**: `pnpm start:api`
3. Define the following environment variables:
   ```env
   NODE_ENV=production
   PORT=4000
   WEB_BASE_URL=https://your-app.vercel.app
   LOG_LEVEL=info
   GITHUB_CLIENT_ID=your_production_client_id
   GITHUB_CLIENT_SECRET=your_production_client_secret
   GITHUB_CALLBACK_URL=https://your-api.railway.app/api/v1/auth/github/callback
   GITHUB_TOKEN=your_fallback_personal_access_token
   ```
4. Verify `/health` responds with `status: "ok"` once deployed.

### Phase B: Deploy Frontend Client (Vercel)
1. Import the project workspace into Vercel.
2. Select **Next.js** as the framework preset.
3. Configure the Root Directory to: `apps/web`.
4. Set the following environment variables:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api.railway.app
   ```
5. Deploy and copy the live URL.
6. **Crucial**: Go back to your Backend API service settings and update `WEB_BASE_URL` with your final Vercel domain to ensure CORS requests are accepted.
