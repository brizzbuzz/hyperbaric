# Portfolio

A personal portfolio website showcasing development work and professional experience.

## Overview

Portfolio provides a platform to showcase projects, skills, and professional background through a modern, responsive web interface.

## Architecture

- **Client**: React application built with Vite
- **Static Generation**: Client-side rendering with potential for SSG
- **Content Management**: File-based or headless CMS integration
- **Authentication**: Better Auth integration for admin features

## Getting Started

```bash
# Navigate to project
cd apps/portfolio

# Install dependencies
bun install

# Start development
bun run dev
```

## Project Structure

```
apps/portfolio/
└── client/          # React frontend
```

## Key Features

- Project showcase and case studies
- Professional experience timeline
- Skills and technology highlights
- Contact and networking information
- Responsive design for all devices

## Technology Stack

- **Frontend**: React, TypeScript, Vite, @repo/ui
- **Styling**: CSS/Sass or styled-components
- **Content**: Markdown or CMS integration
- **Development**: Turborepo, shared TypeScript config

## Documentation

- [Getting Started](./getting-started.md) - Development setup
- [Architecture](./architecture.md) - Technical architecture details
- [Content Management](./content.md) - How to manage portfolio content
- [ADRs](./adrs/README.md) - Architecture Decision Records

---

For general monorepo information, see the [main documentation](../../README.md).