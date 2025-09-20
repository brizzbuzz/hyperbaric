# Null Horizon

A financial analysis tool for investment portfolio tracking and market analysis.

## Overview

Null Horizon provides users with tools to analyze financial data, track investment portfolios, and make informed financial decisions through data visualization and analytics.

## Architecture

- **Client**: React application built with Vite
- **Server**: Node.js/Bun backend API
- **Database**: PostgreSQL with Atlas schema management
- **Authentication**: Better Auth integration

## Getting Started

```bash
# Navigate to project
cd apps/null-horizon

# Install dependencies
bun install

# Start development
bun run dev
```

## Project Structure

```
apps/null-horizon/
├── client/          # React frontend
└── server/          # Node.js backend
```

## Key Features

- Portfolio tracking and analysis
- Financial data visualization
- Market data integration
- Investment performance metrics

## Technology Stack

- **Frontend**: React, TypeScript, Vite, @repo/ui
- **Backend**: Node.js/Bun, TypeScript, Better Auth
- **Database**: PostgreSQL, Atlas migrations, Kysely query builder
- **Development**: Turborepo, shared TypeScript config

## Database

Uses PostgreSQL with declarative schema management via Atlas:

```bash
# Push schema to registry
atlas schema push --env dev

# Apply schema changes
atlas schema apply --env dev
```

**Schema Structure:**
- `auth` - Better Auth tables (users, sessions, accounts)
- `asset` - Financial asset definitions and metadata
- `public` - General application tables

For detailed database management, see [Database Management](../../general/database-management.md).

## Documentation

- [Getting Started](./getting-started.md) - Development setup
- [Architecture](./architecture.md) - Technical architecture details
- [API Documentation](./api.md) - API endpoints and usage
- [ADRs](./adrs/README.md) - Architecture Decision Records

---

For general monorepo information, see the [main documentation](../../README.md).