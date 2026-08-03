# GitProfileStats — Frontend Production Deployment Guide

This document outlines the production configuration, build verification, environment settings, and image optimization checks for the frontend web application (`@gitprofilestats/web`) of the GitProfileStats platform.

Target platform: **Vercel**.

---

## 🛠️ Production Configuration & Build Verification

The frontend is a Next.js application designed to run on Vercel's edge network for optimal performance and near-zero latency.

### 1. Build Pipeline (`pnpm build:web`)
The frontend is compiled using the Next.js compiler (Turbopack) and TypeScript type checking.

- **Build Command**: `pnpm build:web` (or `turbo run build --filter=@gitprofilestats/web` at the root)
- **Framework Detection**: Vercel automatically detects Next.js configuration and optimizes build cache settings.
- **Verification Results**:
  - Compiles successfully without syntax, type, or linting errors.
  - TypeScript checking finishes cleanly (`tsc --noEmit`).
  - Next.js static page generation successfully prerenders all routes:
    - `/` (Static) — Landing page
    - `/login` (Static) — Auth entry page
    - `/login/callback` (Static) — OAuth callback handler
    - `/dashboard` (Static) — Overview Dashboard
    - `/dashboard/cards` (Static) — Card preview and customization
    - `/dashboard/themes` (Static) — Theme gallery
    - `/dashboard/settings` (Static) — Profile and token configuration

### 2. Vercel Configuration (`vercel.json`)
The [vercel.json](file:///d:/AI/Projects/GitProfileStats/apps/web/vercel.json) file sets standard headers and security policies:

```json
{
  "cleanUrls": true,
  "framework": "nextjs",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

> [!TIP]
> Setting `cleanUrls: true` ensures clean, extensionless URLs (e.g. `/login` instead of `/login.html`).

---

## 🔑 Environment Variables Verification

The web application relies on the following environment variables:

| Variable Name | Type / Constraints | Default Value | Description |
| :--- | :--- | :--- | :--- |
| **`NEXT_PUBLIC_API_URL`** | `string` (valid URL) | `http://localhost:4000` | The public base URL of the deployed backend API (e.g., on Railway/Render). No trailing slash. |
| **`ANALYZE`** | `boolean` (optional) | `false` | Set to `true` to enable bundle analysis (`@next/bundle-analyzer`) during build. |

### ⚠️ Critical Build-Time Rule
Next.js client-side variables prefixed with `NEXT_PUBLIC_` are baked into the client JavaScript bundle **during build time**. 

> [!WARNING]
> You **MUST** define `NEXT_PUBLIC_API_URL` in the Vercel Project Settings **before** triggering a production build.
> - If `NEXT_PUBLIC_API_URL` is missing during build time, Next.js will fall back to `http://localhost:4000` in the static bundle, causing API connection failures for visitors in production.
> - Any change to the backend API URL requires a full rebuild and redeployment of the Vercel frontend.

---

## 🖼️ Image Optimization Verification

Next.js provides automatic, high-performance image optimization using the `<Image>` component from `next/image`.

### 1. Remote Domain Whitelisting
To prevent cross-site scripting (XSS) and unauthorized media optimization requests, Next.js requires external image sources to be explicitly allowed in [next.config.ts](file:///d:/AI/Projects/GitProfileStats/apps/web/next.config.ts).

Our configuration matches the application’s profile avatar and user visual requirements:
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },
};
```

- **`avatars.githubusercontent.com`**: Allows optimizing GitHub user avatars shown in the user dashboard header and settings.
- **`github.com`**: Allows loading GitHub's custom identicons/assets (used for default user previews).

### 2. Vercel Image Optimization
When deployed on Vercel, `next/image` is automatically integrated with Vercel's global CDN image optimization service.
- **Auto WebP/AVIF Conversion**: Images are dynamically converted to modern, next-generation image formats (like WebP or AVIF) depending on the visitor's browser support, shrinking payload sizes.
- **Dynamic Resizing**: Images are resized based on the specified `width` and `height` properties in the source code (e.g., `width={96} height={96}` on user profiles), eliminating the need to download high-resolution source avatars.
- **Caching**: Optimized images are cached forever at the edge network, ensuring sub-millisecond responses for subsequent loads.

---

## 🛠️ Step-by-Step Vercel Deployment Instructions

Follow these steps to deploy the GitProfileStats frontend to Vercel:

### 1. Configure the GitHub OAuth Application
Before deploying the frontend, ensure your GitHub OAuth application settings align with the production URLs:
- **Homepage URL**: Change from `http://localhost:3000` to your production frontend URL (e.g., `https://gitprofilestats.vercel.app`).
- **Authorization Callback URL**: Change from `http://localhost:4000/api/v1/auth/github/callback` to your deployed backend callback URL (e.g., `https://api.gitprofilestats.com/api/v1/auth/github/callback`).

### 2. Create the Vercel Project
1. Log in to the [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import the `GitProfileStats` repository.

### 3. Configure Monorepo Settings
Next.js is nested within a monorepo workspace. Vercel needs to be configured to build from the correct folder:
- **Framework Preset**: Select **Next.js**.
- **Root Directory**: Select `apps/web`.
- **Build & Development Settings**:
  - Keep default options. Vercel will run `npm run build` (which maps to `next build` inside `apps/web/package.json`).

### 4. Inject Environment Variables
Under the **Environment Variables** section, add:
- **`NEXT_PUBLIC_API_URL`**: Set the value to the production backend URL (e.g., `https://api.gitprofilestats.com`). *Ensure there is no trailing slash.*

### 5. Deploy
1. Click **Deploy**.
2. Once the build completes, Vercel will provision an SSL certificate and assign a public domain name (e.g., `git-profile-stats-web.vercel.app`).

### 6. Connect Backend
Once the frontend domain is ready, update the backend service's configuration (on Railway/Render) with:
- **`WEB_BASE_URL`**: Set to the deployed Vercel domain (e.g., `https://git-profile-stats-web.vercel.app`). This unlocks CORS permissions and enables callback redirection back to the frontend dashboard.
