# @gitprofilestats/api (v1.0.0)

High-performance Express.js REST API & SVG Generator for **GitProfileStats**, designed with Domain-Driven Design (DDD) and Clean Architecture.

## Features

- **Dynamic SVG Rendering**: Endpoints for generating profile, statistics, language breakdown, contribution streaks, and repository summary cards in sub-100ms.
- **GitHub Data Aggregators**: Clean JSON APIs for retrieving user contribution statistics, language usage, commit streaks, and repo metadata.
- **In-Memory Caching & Performance**: Optimized rate limiting and duplicate request coalescing to protect GitHub API usage limits.
- **Authentication**: Supports GitHub OAuth logins as well as Personal Access Token (PAT) overrides for private repositories.
- **Health Verification**: System health monitoring endpoint at `/health`.

## Development & Testing

```bash
# Run local dev server (default port 4000)
pnpm dev

# Build API server
pnpm build

# Run unit and integration tests with Vitest
pnpm test
```

## Documentation

See the global [API Documentation](../../API.md) in the project root for full endpoints, parameters, error schemas, and customization guides.
