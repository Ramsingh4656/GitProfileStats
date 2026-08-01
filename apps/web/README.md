# @gitprofilestats/web (v1.0.0)

Interactive frontend Web Dashboard & Theme Customizer for **GitProfileStats**, built with Next.js 16, React 19, and Tailwind CSS.

## Features

- **Theme Gallery**: Visually inspect all built-in card themes (`dark`, `light`, `github`, `dracula`, `nord`).
- **Real-Time Customizer**: Configure custom colors, fonts, border radii, and preview cards dynamically.
- **One-Click Markdown Copy**: Instantly generate and copy embedded markdown or HTML for your GitHub README.
- **Optimized Bundle**: Built with Next.js App Router and optimized with bundle analyzers.

## Development

```bash
# Run local dev server (default port 3000)
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint
```

## Environment Variables

Ensure `NEXT_PUBLIC_API_URL` is pointed to your target API server (e.g., `http://localhost:4000` for development or production URL).
