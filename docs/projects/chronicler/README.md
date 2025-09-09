# Chronicler

An AI-native RSS feed reader that uses artificial intelligence to enhance content consumption and discovery.

## Overview

Chronicler helps users consume RSS feeds more efficiently by leveraging AI for content summarization, intelligent filtering, and personalized recommendations.

## Architecture

- **Client**: React application built with Vite
- **Server**: Node.js/Bun backend API
- **Database**: To be determined based on requirements
- **Authentication**: Better Auth integration
- **AI Integration**: External AI APIs for content processing

## Getting Started

```bash
# Navigate to project
cd apps/chronicler

# Install dependencies
bun install

# Start development
bun run dev
```

## Project Structure

```
apps/chronicler/
├── client/          # React frontend
└── server/          # Node.js backend
```

## Key Features

- RSS feed management and subscription
- AI-powered content summarization
- Intelligent content filtering and categorization
- Personalized article recommendations
- Reading history and bookmarks

## Technology Stack

- **Frontend**: React, TypeScript, Vite, @repo/ui
- **Backend**: Node.js/Bun, TypeScript, Better Auth
- **AI**: External AI APIs for content processing
- **Development**: Turborepo, shared TypeScript config

## Documentation

- [Getting Started](./getting-started.md) - Development setup
- [Architecture](./architecture.md) - Technical architecture details
- [API Documentation](./api.md) - API endpoints and usage
- [ADRs](./adrs/README.md) - Architecture Decision Records

---

For general monorepo information, see the [main documentation](../../README.md).