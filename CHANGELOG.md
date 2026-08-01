# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-01

### Added
- **Dynamic SVG Cards**: Real-time GitHub contribution and statistics cards including Profile Card, Stats Card, Languages Card, Streak Card, and Repository Card (`/api/cards/*.svg`).
- **Customization Engine**: Support for predefined themes (`dark`, `light`, `github`, `dracula`, `nord`) along with overrides for background, accent colors, font family, font style (`sans`, `serif`, `mono`, `rounded`), border radius, and mock preview data.
- **GitHub Data Endpoints**: Raw statistical data retrieval via API endpoints (`/api/stats`, `/api/statistics`, `/api/languages`, `/api/contributions`, `/api/repositories`, and `/api/commits`).
- **Interactive Theme Gallery**: Frontend Web Dashboard featuring real-time interactive previews of all themes and card layouts, equipped with a one-click Markdown code copy generator.
- **Authentication & Security**: Integrated GitHub OAuth login flow (`/api/v1/auth/github`), Personal Access Token (PAT) fallbacks, session authorization, token encryption, and OWASP security headers (CORS and Helmet).
- **Performance & Caching**: Sub-100ms SVG rendering powered by optimized in-memory response caching and reduced redundant GitHub API queries.
- **Observability & Health Checks**: Production health check endpoint at `/health` providing real-time GitHub API reachability status, uptime, node version, and memory consumption metrics.
- **Monorepo Architecture**: Turborepo workspace configuration connecting `@gitprofilestats/api` (Express.js domain-driven architecture) and `@gitprofilestats/web` (Next.js 16 UI dashboard).
- **Testing**: Complete Unit and Integration test suites using Vitest covering statistics services, SVG code generation, GitHub API interfacing, and HTTP controllers.
- **Deployment & Production Ready**: Preset configurations for deploying on Render (`render.yaml`), Railway (`railway.json`), and Vercel (`vercel.json`), backed by environment variable documentation (`.env.production.example`).

### Changed
- Standardized package versioning across all workspace projects to `1.0.0`.
- Improved Markdown Generator in the frontend dashboard to support one-click copy actions for every available card layout.
- Optimized SVG rendering engine to eliminate redundant DOM calculations and minimize response payload sizes.

### Fixed
- Resolved import errors in Vitest configurations across the workspace.
- Fixed TypeScript declaration references across shared modules.
