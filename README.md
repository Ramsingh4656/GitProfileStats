<div align="center">

# ⚡ GitProfileStats

### Advanced GitHub Analytics & Dynamic Profile Card Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express&logoColor=white)](https://expressjs.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.5-blueviolet?logo=turborepo&logoColor=white)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15-orange?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**Generate beautiful, dynamic SVG stats cards for your GitHub profile — showcasing your real-time analytics, streaks, repository details, and language breakdowns.**

[Web Dashboard (Next.js)](./apps/web) • [API Service (Express)](./apps/api) • [API Documentation](./API.md)

</div>

---

## ✨ Features

*   📊 **Dynamic SVG Profile Cards** — Automatically fetch and display up-to-date repository metrics, commit streaks, languages, and profile details on your GitHub README.
*   🎨 **Rich Customization Options** — Pick from built-in themes (e.g. Dark, Light, GitHub, Dracula, Nord) or override them with custom accent colors, background colors, custom fonts, corner border radiuses, and borders.
*   🔐 **Private Repository Analytics** — Securely authenticate using GitHub OAuth or Personal Access Tokens to show a complete picture of your public and private contributions.
*   ⚡ **Blazing Fast Response Times** — Employs optimized caching protocols yielding sub-100ms SVG delivery.
*   🛡️ **Enterprise-Grade Security** — Built with secure session management, AES token encryption, and OWASP-compliant headers (using Helmet and CORS).
*   📈 **Comprehensive Metrics Modules** —
    *   **Profile Card**: Summary of followers, following, and repositories.
    *   **Stats Card**: Aggregated repo metrics including total stars, forks, and watcher activities.
    *   **Languages Card**: Visual breakdown of your top programming languages.
    *   **Streak Card**: Track your commit counts and current/longest contribution streaks.
    *   **Repository Card**: Deep-dive analytics for any specific GitHub repository.

---

## 🏗️ Monorepo Architecture

This project is configured as a high-performance TypeScript **Turborepo monorepo** managed with **pnpm workspaces**:

```
git-profile-stats/
├── apps/
│   ├── api/          # Express.js backend (Domain-Driven Design + Clean Architecture)
│   └── web/          # Next.js 16 Web Dashboard & Card Customizer UIs
└── package.json      # Workspace runner and scripts
```

---

## 💻 Environment Variables

Create a `.env` file in the root workspace directory based on `.env.example`:

| Environment Variable | Category | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application | Application runtime stage | `development` |
| `PORT` | Application | Port that the Express API listens on | `4000` |
| `WEB_BASE_URL` | Application | Frontend client application home URL | `http://localhost:3000` |
| `LOG_LEVEL` | Logging | Minimum logging level (`fatal`, `error`, `warn`, `info`, `debug`, `trace`) | `info` |
| `GITHUB_CLIENT_ID` | GitHub OAuth | Client ID for your registered GitHub OAuth App | `your_github_client_id` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth | Client Secret for your registered GitHub OAuth App | `your_github_client_secret` |
| `GITHUB_CALLBACK_URL` | GitHub OAuth | Redirect URI invoked after user OAuth completes | `http://localhost:4000/api/v1/auth/github/callback` |
| `GITHUB_TOKEN` | GitHub API | Fallback Personal Access Token (PAT) for API queries | `your_github_personal_access_token` |
| `NEXT_PUBLIC_API_URL` | Web App (Client) | Target Backend API Base URL | `http://localhost:4000` |

---

## 🚀 Installation & Running Locally

### Prerequisites

*   **Node.js** >= 20.0.0
*   **pnpm** >= 9.0.0

### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/git-profile-stats.git
    cd git-profile-stats
    ```

2.  **Install project dependencies:**
    ```bash
    pnpm install
    ```

3.  **Configure environment variables:**
    ```bash
    cp .env.example .env
    # Edit .env with your credentials and configuration
    ```

4.  **Start all services in development mode:**
    ```bash
    pnpm dev
    ```
    This spins up:
    *   **Next.js Dashboard Client** on [http://localhost:3000](http://localhost:3000)
    *   **Express API Server** on [http://localhost:4000](http://localhost:4000)

### Workspace Scripts

| Command | Workspace Location | Description |
| :--- | :--- | :--- |
| `pnpm dev` | Root | Run all apps concurrently in development mode |
| `pnpm build` | Root | Compile all applications and packages |
| `pnpm lint` | Root | Lint files using ESLint across all packages |
| `pnpm lint:fix` | Root | Automatically fix code style violations |
| `pnpm typecheck` | Root | Validate TS compilation across workspaces |
| `pnpm format` | Root | Run Prettier formatter to format all files |
| `pnpm clean` | Root | Delete target outputs, `.next`, and `node_modules` folders |

---

## 🎨 Card Examples & Customization

The platform exposes SVG endpoints that can be embedded directly in your GitHub profile description.

### Supported Card Types

| Card Name | Endpoint Path | Description |
| :--- | :--- | :--- |
| **Profile Card** | `/api/cards/profile.svg` | Summarizes GitHub user followers, profile avatar, and metadata. |
| **Stats Card** | `/api/cards/stats.svg` | Computes aggregate metrics such as total stars, forks, and repos. |
| **Languages Card** | `/api/cards/languages.svg` | Breakdown of your primary programming languages by byte count. |
| **Streak Card** | `/api/cards/streak.svg` | Displays contribution metrics and active streak indicators. |
| **Repository Card** | `/api/cards/repository.svg` | Renders statistical summaries for a single specific repository. |

### Query Parameters

Use these query parameters to customize the output SVG layout dynamically:

*   `username` (or `owner`): Target GitHub login name.
*   `theme`: Predefined card theme styling (`dark` (default), `light`, `github`, `dracula`, `nord`).
*   `accent`: Hex color code (without `#` symbol) to override the primary highlight color.
*   `background`: Hex color code (without `#` symbol) to override the card backdrop color.
*   `border_radius`: Border corner radius in pixels (e.g. `border_radius=12`).
*   `hide_border`: Set to `true` to disable the card boundary line outline.
*   `font_style`: Shortcut presets (`sans`, `serif`, `mono`, `rounded`).
*   `langs_count`: Numeric limit of language bars displayed on the Language Card (default `5`).
*   `repo`: The target repository name (required for Repository Card).
*   `mock`: Set to `true` to render card using mock data (ideal for testing styles).

### Markdown Embed Examples

```markdown
<!-- Profile Card -->
![Profile Card](http://localhost:4000/api/cards/profile.svg?username=octocat&theme=dracula)

<!-- Stats Card -->
![Stats Card](http://localhost:4000/api/cards/stats.svg?username=octocat&theme=nord&font_style=rounded)

<!-- Language Card -->
![Language Card](http://localhost:4000/api/cards/languages.svg?username=octocat&theme=github&langs_count=6)

<!-- Streak Card -->
![Streak Card](http://localhost:4000/api/cards/streak.svg?username=octocat&theme=light)

<!-- Repository Card -->
![Repository Card](http://localhost:4000/api/cards/repository.svg?owner=octocat&repo=Hello-World&theme=dark&accent=ff79c6)
```

---

## 📡 API Examples

For advanced users, the backend exposes raw data aggregation endpoints. All request URLs start with `http://localhost:4000`.

### Data Retrieval Endpoints

*   **Combined Statistics**
    *   *Endpoint:* `GET /api/statistics?username=octocat`
    *   *Returns:* A complete combined statistics JSON body including repositories, commits, languages, issues, streaks, and PR counts.
*   **Top Languages Breakdown**
    *   *Endpoint:* `GET /api/languages?username=octocat`
    *   *Response Format:*
        ```json
        {
          "success": true,
          "data": [
            { "language": "TypeScript", "bytes": 145000, "percentage": 55.4, "repositoryCount": 12 },
            { "language": "JavaScript", "bytes": 68000, "percentage": 26.0, "repositoryCount": 8 }
          ]
        }
        ```
*   **Contribution Streaks**
    *   *Endpoint:* `GET /api/contributions?username=octocat`
    *   *Response Format:* Includes `totalContributions`, `currentStreak`, `longestStreak`, and detailed contribution days calendar.
*   **System Health Check**
    *   *Endpoint:* `GET /health`
    *   *Returns:* Server status, uptime in seconds, and timestamps.

For complete endpoints reference, request formats, and error codes, refer to the [API Documentation](file:///d:/antygravity/GitProfileStats/API.md).

---

## 📸 Screenshots

### Web Dashboard & Card Customizer
Interactive dashboard client built using Next.js, React, and Tailwind CSS. Users can manage settings, test layouts, choose themes, and copy SVG codes.

![GitProfileStats OpenGraph Visual Representation](apps/web/public/og-image.png)

---

## 🚀 Deployment Guide

Follow these steps to deploy GitProfileStats in a production environment.

### 1. Register a GitHub OAuth Application

To support user login on your dashboard, register an OAuth application on GitHub:
1.  Navigate to **Settings** > **Developer Settings** > **OAuth Apps** > **New OAuth App**.
2.  Set **Homepage URL** to your frontend site (e.g. `https://gitprofilestats.yoursite.com`).
3.  Set **Authorization Callback URL** to your backend API's callback url (e.g. `https://api.gitprofilestats.yoursite.com/api/v1/auth/github/callback`).
4.  Generate a **Client Secret** and copy both the **Client ID** and **Client Secret**.

### 2. Deploying the API Backend (`apps/api`)

You can host the Express.js API on platforms like **Render**, **Fly.io**, **Railway**, or on your own VPS.

#### Build & Start Commands
*   **Build command:** `pnpm --filter @gitprofilestats/api build`
*   **Start command:** `pnpm --filter @gitprofilestats/api start`

#### Environment Configuration
Ensure you define production values for all environment variables in your server provider:
*   Set `NODE_ENV` to `production`.
*   Set `WEB_BASE_URL` to your frontend website address.
*   Set `PORT` to the port number matching the environment configuration.
*   Provide your production `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, and `GITHUB_TOKEN`.

### 3. Deploying the Frontend Dashboard (`apps/web`)

Deploy the Next.js application to **Vercel**, **Netlify**, or similar providers.

#### Build & Start Commands
*   **Build command:** `pnpm --filter @gitprofilestats/web build`
*   **Start command:** `pnpm --filter @gitprofilestats/web start`

#### Environment Configuration
Add the following key variable in your deployment platform settings:
*   `NEXT_PUBLIC_API_URL`: Point this to your deployed API backend URL (e.g., `https://api.gitprofilestats.yoursite.com`).

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
