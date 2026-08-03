# Project Overview

This repository is a **GitProfileStats** web application that shows statistics about a GitHub user's profile. It consists of two main parts:

- **Frontend** – a React/Next.js app deployed on **Vercel**.
- **Backend** – a Node.js API deployed on **Render** (free tier) that talks to a **Neon PostgreSQL** database and uses **Upstash Redis** for caching.
- Authentication is handled via **GitHub OAuth**.

---

# Requirements

| Service | Purpose |
|---------|---------|
| GitHub | Host the source code and provide OAuth credentials |
| Vercel | Deploy the frontend |
| Render | Deploy the backend (free‑tier keep‑alive trick) |
| Neon | Managed PostgreSQL database |
| Upstash | Managed Redis cache |

---

# Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL of the backend API (e.g., `https://my-backend.onrender.com/api`) |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret (backend only) |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `UPSTASH_REDIS_URL` | Upstash Redis endpoint |
| `SESSION_SECRET` | Secret used to sign session cookies |
| `NEXTAUTH_URL` | Frontend URL for NextAuth callbacks |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT signing |
| `RENDER_SERVICE_URL` | Optional custom health‑check endpoint |

---

# Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your‑username/GitProfileStats.git
   cd GitProfileStats
   ```
2. **Install dependencies** (workspace uses pnpm)
   ```bash
   pnpm install
   ```
3. **Create a `.env.local` file** based on `.env.example` and fill in all variables from the table above.
4. **Start the backend**
   ```bash
   cd apps/backend
   pnpm dev   # usually runs on http://localhost:3001
   ```
5. **Start the frontend**
   ```bash
   cd apps/frontend
   pnpm dev   # runs on http://localhost:3000
   ```
6. Open the frontend URL in a browser, log in with GitHub, and verify that stats appear.

---

# Deploy Backend (Render)

1. Log in to **Render** and click **New > Web Service**.
2. **Connect GitHub** – select the `GitProfileStats` repository.
3. **Root Directory** – set to `apps/backend`.
4. **Build Command** – `pnpm install && pnpm build`.
5. **Start Command** – `pnpm start` (or whatever script starts the server).
6. **Environment Variables** – copy all backend variables from the table above.
7. **Health Check** – set path to `/api/health` (Render will ping this).
8. Click **Create Web Service**.
9. After the build finishes, open the service URL and ensure the health check returns `OK`.

*Free‑tier keep‑alive trick*: Add a cron job in Render’s **Jobs** tab that sends a request to `/api/health` every 5‑15 minutes.

---

# Deploy Frontend (Vercel)

1. Log in to **Vercel** and click **New Project**.
2. **Import GitHub Repository** – choose `GitProfileStats`.
3. **Root Directory** – set to `apps/frontend`.
4. **Framework Preset** – Vercel should detect **Next.js** automatically.
5. **Build Settings** – leave defaults (`pnpm install` then `pnpm build`).
6. **Environment Variables** – add the frontend variables (`NEXT_PUBLIC_*` etc.) from the table.
7. Click **Deploy**.
8. When the deployment finishes, open the URL and verify the app loads.

---

# Configure GitHub OAuth

1. Go to **GitHub Settings → Developer settings → OAuth Apps** and create a new app.
2. **Application name** – `GitProfileStats` (or whatever you like).
3. **Homepage URL** – the Vercel site URL (e.g., `https://gitprofilestats.vercel.app`).
4. **Authorization callback URL** – `https://gitprofilestats.vercel.app/api/auth/callback/github`.
5. Save and copy the **Client ID** and **Client Secret**.
6. Add `NEXT_PUBLIC_GITHUB_CLIENT_ID` to the frontend env and `GITHUB_CLIENT_SECRET` to the backend env.

---

# Connect Frontend to Backend

- Set `NEXT_PUBLIC_API_URL` in the frontend `.env.local` to the Render service URL (`https://my-backend.onrender.com/api`).
- The backend must allow the Vercel domain in its CORS configuration (usually `https://*.vercel.app`).
- Restart both services after updating env files.

---

# Testing Checklist

- [ ] Frontend opens without errors
- [ ] Backend health endpoint returns `OK`
- [ ] GitHub login works and redirects back to the app
- [ ] User stats load correctly
- [ ] SVG icons render
- [ ] Repository cards display
- [ ] Theme switching works (dark/light)
- [ ] Cache (Redis) clears after logout

---

# Troubleshooting

| Symptom | Possible Cause | Fix |
|---------|----------------|-----|
| 502 Bad Gateway on Render | Service stopped or crashed | Check Render logs, ensure `DATABASE_URL` is correct |
| OAuth callback fails | Mismatch in callback URL | Verify callback URL matches Vercel domain exactly |
| Stats not loading | Missing env var `NEXT_PUBLIC_API_URL` | Add correct backend URL to `.env.local` and redeploy |
| Cache miss errors | Upstash URL expired | Refresh `UPSTASH_REDIS_URL` in Render env vars |

---

# Frequently Asked Questions

**Q: Do I need a separate database for each environment?**
A: No. You can use the same Neon instance for dev and prod, but create separate schemas or databases if you want isolation.

**Q: How do I update the site after pulling new changes?**
A: Push to the main branch; Render and Vercel automatically rebuild and redeploy.

**Q: What is the free‑tier keep‑alive trick?**
A: Render’s free tier sleeps after 15 minutes of inactivity. A tiny cron job that pings `/api/health` every few minutes keeps the service awake.

---

# Updating the Project

1. Pull the latest changes:
   ```bash
   git pull origin main
   ```
2. Re‑install dependencies if `package.json` changed:
   ```bash
   pnpm install
   ```
3. Redeploy:
   - **Render** – the service rebuilds automatically on push.
   - **Vercel** – the frontend rebuilds automatically on push.
4. Verify the health check and login flow again.
