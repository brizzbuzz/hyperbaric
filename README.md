# Hyperbaric

A modern monorepo containing multiple web applications built with React, TypeScript, and shared tooling.

## Projects

- **Null Horizon** - Financial analysis and portfolio tracking tool
- **Chronicler** - AI-native RSS feed reader  
- **Portfolio** - Personal portfolio showcase

## Quick Start

```bash
# Install dependencies
bun install

# Start all projects
bun run dev

# Or start specific project
turbo run dev --filter=null-horizon-client
```

## Documentation

Complete documentation is available in the [`docs/`](./docs/) directory, including:

- [Getting Started](./docs/general/getting-started.md)
- [Architecture Overview](./docs/general/architecture.md)
- [Database Management](./docs/general/database-management.md)
- [Project-Specific Guides](./docs/projects/)

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js/Bun, Hono
- **Database**: PostgreSQL with Atlas migrations
- **Auth**: Better Auth
- **Tooling**: Turborepo, shared configs

---

For detailed setup and development information, see the [documentation](./docs/).