# Before You Start

> **Note**: This guide assumes you have **zero** experience with deploying web applications. Follow each step exactly as written.

## What This Project Is

`GitProfileStats` is a small web app that shows statistics about a GitHub user’s profile (repositories, languages, contributions, etc.). It has two parts:

- **Frontend** – a React/Next.js website that the visitor sees.
- **Backend** – a Node.js API that talks to a database and a cache.

Both parts need to be hosted online so they can talk to each other.

## How Deployment Works

The app is split into the following services, each hosted on a different platform:

```mermaid
flowchart LR
    User([👤 User])

    Frontend["Frontend (Next.js)<br>Vercel"]
    Backend["Backend (Node.js)<br>Render"]
    DB[("Neon PostgreSQL")]
    Cache[("Upstash Redis")]
    GitHub["GitHub OAuth & APIs"]

    User --> Frontend
    Frontend --> Backend
    Backend --> DB
    Backend --> Cache
    Backend <--> GitHub
```

- **Frontend → Vercel** – Vercel builds and serves the React website.
- **Backend → Render** – Render runs the Node.js API.
- **Database → Neon** – Managed PostgreSQL database.
- **Cache → Upstash** – Managed Redis cache for fast data.
- **Auth → GitHub** – OAuth app that lets users log in with their GitHub account.

---

# What You Need

Create a checklist and complete each item before proceeding.

- [ ] **GitHub Account** – Sign up at https://github.com/join
- [ ] **Vercel Account** – Sign up at https://vercel.com/signup
- [ ] **Render Account** – Sign up at https://render.com/signup
- [ ] **Neon Account** – Sign up at https://neon.tech
- [ ] **Upstash Account** – Sign up at https://upstash.com
- [ ] **Git** – Install from https://git-scm.com/downloads (Windows installer).
- [ ] **Node.js** – Download LTS version (≥18) from https://nodejs.org/en/download/ and run the installer.
- [ ] **pnpm** – After installing Node, open **PowerShell** and run:
  ```powershell
  npm install -g pnpm
  ```

> **Tip**: After installation, close and reopen PowerShell so the new PATH entries take effect.

---

# Download the Project

1. **Clone the repository** (recommended) – Open **PowerShell**, navigate to where you want the project folder, then run:
   ```powershell
   git clone https://github.com/your-username/GitProfileStats.git
   cd GitProfileStats
   ```
   - _Why?_ This creates a local copy of all source files.
2. **Or download as a ZIP** – Go to the GitHub page, click **Code → Download ZIP**, unzip to `C:\GitProfileStats`.
3. **Open the folder in VS Code** – Right‑click the folder → _Open with Code_.
4. **Open a terminal inside VS Code** – _Terminal → New Terminal_ (or ``Ctrl+` ``).
5. **Install dependencies** – In the terminal run:
   ```powershell
   pnpm install
   ```
   - _What it does_: Downloads all JavaScript packages listed in `package.json`.
6. **Verify installation** – You should see a `node_modules` folder and a message `+ [number] packages installed`.

---

# Local Setup

Below are the exact commands you will run, why you run them, and what you should see.

## 1. Start the Backend (API)

```powershell
cd apps/api
pnpm dev
```

- **Why?** Starts the API locally on `http://localhost:3001`.
- **Expected output**: A line like `Server listening on http://localhost:3001`.
- **Common errors**:
  - _Port already in use_: Change the port in `.env.local` (`PORT=3002`).
  - _Missing env vars_: See the **Environment Variables** section below.

## 2. Start the Frontend (Website)

```powershell
cd apps/web
pnpm dev
```

- **Why?** Starts the Next.js dev server on `http://localhost:3000`.
- **Expected output**: `Ready on http://localhost:3000`.
- **Common errors**:
  - _Missing NEXT_PUBLIC_API_URL_: The app will show a red error screen; add the variable.

---

# Environment Variables

> **Important**: Variables are stored in a file named `.env` (or `.env.local` for local dev). The file lives in the **root of the project**.

## How to Create the File

1. In the project root, locate the file `.env.example`.
2. Right‑click → _Copy_ → _Paste_ and rename the copy to `.env.local`.
3. Open `.env.local` in VS Code.

## Why We Need It

Environment variables keep secret values (API keys, database URLs) out of the source code.

## List of All Variables

| Variable                       | Example Value                                                               | Where to Get It                                                     | Required? | Purpose                                             |
| ------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------- | --------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`          | `https://my-backend.onrender.com/api`                                       | From Render deployment (see **Deploy Backend to Render** step)      | Yes       | Frontend tells the browser where the backend lives. |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | `Iv1.1234567890abcdef`                                                      | GitHub OAuth app → _Client ID_                                      | Yes       | Allows the frontend to start the GitHub login flow. |
| `GITHUB_CLIENT_SECRET`         | `abcd1234efgh5678ijkl9012mnop3456qrst7890`                                  | GitHub OAuth app → _Client Secret_ (keep secret, only backend uses) | Yes       | Auth server validates the login response.           |
| `DATABASE_URL`                 | `postgresql://username:password@aws-us-east-1.pooler.neon.tech:5432/dbname` | Neon dashboard → _Connection string_ (copy button)                  | Yes       | Backend connects to the PostgreSQL database.        |
| `UPSTASH_REDIS_URL`            | `redis://default:abcd1234efgh@redis-12345.upstash.io:6379`                  | Upstash dashboard → _Redis URL_                                     | Yes       | Backend uses Redis for caching.                     |
| `SESSION_SECRET`               | `aRandomLongString123!@#`                                                   | Generate a random string (e.g., use `openssl rand -base64 32`).     | Yes       | Signs session cookies so they cannot be forged.     |
| `NEXTAUTH_URL`                 | `https://gitprofilestats.vercel.app`                                        | Your Vercel deployment URL (once deployed)                          | Yes       | Needed by NextAuth for callbacks.                   |
| `NEXTAUTH_SECRET`              | `anotherRandomSecret567!@#`                                                 | Generate like `SESSION_SECRET`.                                     | Yes       | Encrypts NextAuth JWT tokens.                       |
| `RENDER_SERVICE_URL`           | _(Optional)_ `https://my-backend.onrender.com`                              | Same as `NEXT_PUBLIC_API_URL` but without `/api`.                   | No        | Used by health‑check jobs.                          |

> **Tip**: After filling the values, save the file. VS Code will automatically reload the environment for `pnpm dev`.

---

# Neon PostgreSQL

1. **Create a Neon account** – Visit https://neon.tech and sign up.
2. **Create a Project** – Click **New Project**, give it a name (e.g., _gitprofilestats-db_), and choose the free tier.
3. **Create a Database** – In the project view, click **Create Database**. The default name `postgres` is fine.
4. **Get the Connection String** – In the database details panel, click **Connection string** → _Copy_.
5. **Paste into `.env.local`** → set `DATABASE_URL` to the copied value.
6. **Test the connection** – Back in PowerShell, run:
   ```powershell
   npx prisma db connect --url "$env:DATABASE_URL"
   ```
   You should see `Connection successful`.

> **Warning**: Do not share this URL publicly; it contains your password.

---

# Upstash Redis

1. **Create an Upstash account** – Go to https://upstash.com and sign up.
2. **Create a Redis database** – Click **Create Database**, choose _Redis_ and the free tier.
3. **Copy the Redis URL** – In the database view, click **Show connection details** → copy the `REDIS_URL`.
4. **Paste into `.env.local`** → set `UPSTASH_REDIS_URL`.
5. **Test the connection** – Run:
   ```powershell
   npm install -g redis-cli
   redis-cli -u $env:UPSTASH_REDIS_URL ping
   ```
   Should return `PONG`.

---

# GitHub OAuth

1. Open **GitHub**, click your profile picture → **Settings**.
2. In the left sidebar, select **Developer settings** → **OAuth Apps** → **New OAuth App**.
3. Fill out the form:
   - **Application name**: `GitProfileStats`
   - **Homepage URL**: `https://gitprofilestats.vercel.app` _(replace with your Vercel URL after deployment)_
   - **Authorization callback URL**: `https://gitprofilestats.vercel.app/api/auth/callback/github`
   - **Description**: _Optional_.
   - Click **Register application**.
4. After registration, you will see **Client ID** and **Client Secret**.
5. Copy **Client ID** → paste into `.env.local` as `NEXT_PUBLIC_GITHUB_CLIENT_ID`.
6. Copy **Client Secret** → paste into `.env.local` as `GITHUB_CLIENT_SECRET`.

> **Note**: The `Client Secret` must never be committed to source control; it only lives on the backend.

---

# Run Locally

## Backend

```powershell
cd apps/api
pnpm dev
```

- You should see `🚀 Server ready at http://localhost:3001`.
- Open `http://localhost:3001/api/health` in a browser; you should see `{ "status": "ok" }`.

## Frontend

```powershell
cd apps/web
pnpm dev
```

- Browser opens automatically at `http://localhost:3000`.
- Click **Login with GitHub** – you will be redirected to GitHub, then back to the app.
- If you see your stats, the local setup works!

---

# Deploy Backend to Render

> **All clicks are described; follow them exactly.**

1. Go to https://render.com and **Log In**.
2. Click **New → Web Service** (top‑right button).
3. **Connect to GitHub** – choose _GitHub_ as the source and click **Connect**.
4. Select the repository `GitProfileStats`.
5. **Root Directory**: type `apps/api`.
6. **Name**: (optional) `gitprofilestats-backend`.
7. **Environment**: `Node`.
8. **Build Command**: `pnpm install && pnpm build`.
9. **Start Command**: `pnpm start` (or the script defined in `package.json`).
10. **Environment Variables**: Click **Add Environment Variable** for each of the backend variables (`DATABASE_URL`, `UPSTASH_REDIS_URL`, `GITHUB_CLIENT_SECRET`, `SESSION_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`). Paste the exact values you saved earlier.
11. **Health Check Path**: Enter `/api/health`.
12. **Cron Job (keep‑alive)**:
    - Go to the **Jobs** tab → **New Job**.
    - Name: `keep-alive`.
    - Command: `curl https://<your‑render‑service>.onrender.com/api/health`.
    - Schedule: `*/10 * * * *` (every 10 minutes).
13. Click **Create Web Service**.
14. Wait for the build to finish (you’ll see a green check). When done, click **Visit** to open the URL and verify the health endpoint returns `OK`.

![Render service creation screen placeholder](file:///C:/placeholder/render_service.png)

---

# Deploy Frontend to Vercel

1. Open https://vercel.com and **Log In**.
2. Click **New Project**.
3. **Import GitHub Repository** – select `GitProfileStats`.
4. **Root Directory**: set to `apps/web`.
5. **Framework Preset**: Vercel should auto‑detect **Next.js**; leave as is.
6. **Build Settings** – defaults are fine (`pnpm install` then `pnpm build`).
7. **Environment Variables** – click **Edit** and add each `NEXT_PUBLIC_*` variable:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_GITHUB_CLIENT_ID`
   - `NEXT_PUBLIC_*` others if any.
   - Click **Add** after each entry.
8. Click **Deploy**.
9. After deployment, Vercel shows a preview URL like `https://gitprofilestats.vercel.app`. Click **Visit** to open it.

![Vercel deployment screen placeholder](file:///C:/placeholder/vercel_deploy.png)

---

# Connect Frontend and Backend

1. In the **frontend** `.env.local`, set `NEXT_PUBLIC_API_URL` to the Render service URL you got in step 13 of the backend deployment (e.g., `https://gitprofilestats-backend.onrender.com/api`).
2. In the **backend**, ensure CORS allows the Vercel domain:
   - Open `apps/api/src/config/cors.ts` (or similar).
   - Add `https://gitprofilestats.vercel.app` to the whitelist array.
3. Restart both services (re‑deploy on Vercel and Render) to pick up the changes.
4. Verify by opening the Vercel site and checking that the stats load without errors.

---

# Final Testing Checklist

- [ ] Frontend loads at Vercel URL.
- [ ] Backend health endpoint returns `OK`.
- [ ] GitHub login redirects back to the app and shows your profile.
- [ ] Statistics (repos, languages, etc.) appear.
- [ ] Database connection works (check Render logs for `connected to PostgreSQL`).
- [ ] Redis cache works (no “Redis connection error”).
- [ ] Theme switcher toggles dark/light mode.
- [ ] Markdown rendering works on the profile page.

---

# Common Errors (Beginner Edition)

| Symptom                                   | Likely Cause                                  | How to Fix                                                                                                                         |
| ----------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **502 Bad Gateway** on Render             | Backend crashed or env var missing            | Open Render dashboard → Logs → look for `Error: DATABASE_URL not set`. Add the missing variable to the Render env.                 |
| **OAuth callback fails**                  | Callback URL mismatch                         | Ensure the Callback URL in GitHub OAuth exactly matches your Vercel URL (`https://your-site.vercel.app/api/auth/callback/github`). |
| **Stats not loading**                     | `NEXT_PUBLIC_API_URL` incorrect               | Verify the URL points to the Render service and includes `/api`.                                                                   |
| **Redis connection error**                | `UPSTASH_REDIS_URL` wrong or expired          | Re‑copy the URL from Upstash dashboard; replace the value in `.env.local` and redeploy.                                            |
| **CORS blocked**                          | Backend not allowing Vercel domain            | Add `https://your-site.vercel.app` to backend CORS whitelist and redeploy.                                                         |
| **Missing env var warning**               | `.env.local` not saved or wrong file name     | Ensure the file is named exactly `.env.local` in the project root.                                                                 |
| **Frontend shows “Failed to fetch”**      | Backend URL unreachable                       | Open the Render service URL in a browser; should return `{ "status": "ok" }`.                                                      |
| **Render service sleeps**                 | Free tier idle timeout                        | Keep the keep‑alive cron job active (see Deploy Backend section).                                                                  |
| **Vercel build fails**                    | Missing `NEXT_PUBLIC_*` vars                  | Add all required vars under Vercel project settings → Environment Variables.                                                       |
| **GitHub login loops back to login page** | `NEXTAUTH_URL` incorrect                      | Set `NEXTAUTH_URL` to your Vercel site URL (no trailing slash).                                                                    |
| **Incorrect root directory**              | Deployed from wrong folder                    | For Render: root `apps/api`. For Vercel: root `apps/web`.                                                                          |
| **Build command error**                   | Using `npm` instead of `pnpm`                 | Use the exact commands `pnpm install && pnpm build`.                                                                               |
| **Database migration not run**            | Forgot to run `pnpm prisma migrate`           | After setting `DATABASE_URL`, run `pnpm prisma migrate deploy` in backend.                                                         |
| **Session cookie not set**                | `SESSION_SECRET` missing                      | Add a random secret string to both backend and frontend env files.                                                                 |
| **SSL certificate error**                 | Using http instead of https URLs              | Always use `https://` URLs for Render and Vercel.                                                                                  |
| **Missing README**                        | Not relevant for deployment but good practice | Add a README later.                                                                                                                |
| **Port conflict**                         | Another app using 3001                        | Change `PORT` in `.env.local` and update Render start command.                                                                     |
| **Outdated pnpm version**                 | `pnpm -v` shows old version                   | Run `npm install -g pnpm@latest`.                                                                                                  |
| **Incorrect markdown rendering**          | Using backticks inside markdown tables        | Escape backticks with \`.                                                                                                          |
| **Image placeholders not showing**        | Path wrong                                    | Ensure placeholder paths start with `file:///` and point to an existing image file.                                                |

---

# Updating the Project

1. **Pull latest changes**:
   ```powershell
   git pull origin main
   ```
2. **Re‑install dependencies** (if `package.json` changed):
   ```powershell
   pnpm install
   ```
3. **Render auto‑deploy** – Render rebuilds automatically on each push.
4. **Vercel auto‑deploy** – Vercel also rebuilds on each push.

---

# FAQ (Beginner Questions)

1. **Do I need to pay for any of these services?**
   - All listed services have a free tier sufficient for testing and small‑scale usage.
2. **Can I use a different database provider?**
   - Yes, but you would need to adjust the `DATABASE_URL` format and possibly the Prisma schema.
3. **What is a “root directory”?**
   - It tells the platform where the entry point of the app lives inside the repository.
4. **Why is the frontend variable prefixed with `NEXT_PUBLIC_`?**
   - Next.js only exposes env vars that start with `NEXT_PUBLIC_` to the browser.
5. **What if I forget a step?**
   - Refer back to the checklist; each unchecked box indicates an incomplete step.
6. **How do I see logs on Render?**
   - Open the service → **Logs** tab.
7. **How do I see logs on Vercel?**
   - In the project view, click **Deployments** → select a deployment → **Logs**.
8. **What is a “keep‑alive” job?**
   - A tiny scheduled request that prevents Render’s free tier from sleeping.
9. **Can I use Docker instead?**
   - Yes, but this guide focuses on the simplest zero‑Docker path.
10. **Why do I need two different secrets (`SESSION_SECRET` and `NEXTAUTH_SECRET`)?**
    - They serve different purposes: one signs cookies, the other signs JWT tokens.
11. **What is Prisma?**
    - An ORM (Object‑Relational Mapper) that helps Node.js talk to PostgreSQL.
12. **Do I need to run `pnpm prisma migrate`?**
    - Only the first time you set up a new Neon database.
13. **My browser shows “CORS policy” error – what does that mean?**
    - The backend is rejecting requests from the frontend domain; add the Vercel URL to the backend CORS whitelist.
14. **Why is my site loading slowly?**
    - Free tiers have limited resources; consider upgrading or enabling caching via Upstash.
15. **Can I change the Vercel domain?**
    - Yes, under **Project Settings → Domains**.
16. **What is a “callback URL”?**
    - The URL GitHub redirects to after the user authorizes the app.
17. **Do I need to commit `.env.local`?**
    - No! It should stay local and never be added to Git.
18. **How do I delete a Render service?**
    - In the service dashboard, click **Settings → Delete Service**.
19. **What if I accidentally delete my Neon database?**
    - Create a new one and update `DATABASE_URL`.
20. **Can I use TypeScript with the frontend?**
    - The project already uses TypeScript; no extra steps needed.

---

# Quick Checklist (One‑Page Summary)

- [ ] GitHub, Vercel, Render, Neon, Upstash accounts created.
- [ ] Git, Node.js, pnpm installed.
- [ ] Repository cloned and dependencies installed.
- [ ] `.env.local` file created and all variables filled.
- [ ] Backend runs locally (`http://localhost:3001/api/health` = OK).
- [ ] Frontend runs locally (`http://localhost:3000` shows login button).
- [ ] Render backend deployed with correct env vars and health check.
- [ ] Keep‑alive cron job set on Render.
- [ ] Vercel frontend deployed with correct env vars.
- [ ] Frontend `NEXT_PUBLIC_API_URL` points to Render URL.
- [ ] CORS configured on backend for Vercel domain.
- [ ] GitHub OAuth app created, IDs added to env.
- [ ] Final test: open Vercel URL, log in, see stats.

---

_You now have a complete, beginner‑friendly deployment guide!_
