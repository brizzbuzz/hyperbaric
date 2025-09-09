# Getting Started

This guide will help you set up the Hyperbaric monorepo for development and understand the basic workflow.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun** (v1.2.20 or later) - Our primary package manager and runtime
- **Node.js** (v18 or later) - Required for some tooling compatibility
- **Git** - Version control
- **Docker** (optional) - For running services locally

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hyperbaric
```

### 2. Install Dependencies

```bash
bun install
```

This will install all dependencies for the monorepo, including all apps and packages.

### 3. Environment Configuration

Each project may require environment variables. Check the individual project documentation for specific requirements:

- [Null Horizon Environment Setup](../projects/null-horizon/getting-started.md#environment-setup)
- [Chronicler Environment Setup](../projects/chronicler/getting-started.md#environment-setup)
- [Portfolio Environment Setup](../projects/portfolio/getting-started.md#environment-setup)

## Development Workflow

### Running Projects

#### Start All Projects
```bash
bun run dev
```

#### Start Specific Projects
```bash
# Chronicler client only
turbo run dev --filter=chronicler-client

# Null Horizon full stack
turbo run dev --filter=null-horizon-*

# Portfolio
turbo run dev --filter=portfolio-client
```

#### Start Storybook (Component Documentation)
```bash
turbo run dev --filter=storybook
```

### Building Projects

#### Build All
```bash
bun run build
```

#### Build Specific Project
```bash
turbo run build --filter=chronicler-client
```

### Code Quality

#### Linting
```bash
# Run linter on all projects
bun run lint

# Fix auto-fixable issues
bun run lint:fix

# Basic linting without type checking
bun run lint:basic

# Type checking only
bun run lint:type-check
```

#### Formatting
```bash
bun run format
```

## Monorepo Structure

### Apps Directory (`/apps`)
Contains all standalone applications:
- `chronicler/` - AI-native RSS feed reader
- `null-horizon/` - Financial analysis tool
- `portfolio/` - Personal portfolio website
- `storybook/` - Component documentation and testing

### Packages Directory (`/packages`)
Contains shared packages used across apps:
- `ui/` - Shared React components and design system
- `typescript-config/` - Shared TypeScript configurations

## Working with Turborepo

Turborepo manages the build system and task orchestration. Key concepts:

### Filtering
Run commands for specific projects:
```bash
# Run dev for all chronicler packages
turbo run dev --filter=chronicler-*

# Run build for packages only
turbo run build --filter=./packages/*

# Run command for specific package and its dependencies
turbo run build --filter=chronicler-client...
```

### Caching
Turborepo caches build outputs. To clear cache:
```bash
turbo run build --force
```

### Task Dependencies
Tasks run in dependency order automatically. The build graph ensures:
- Packages build before apps that depend on them
- Type checking runs before builds
- Dependencies are respected across the monorepo

## Common Development Tasks

### Adding a New Package Dependency

#### To a Specific App
```bash
cd apps/chronicler/client
bun add package-name
```

#### To the Root (DevDependencies)
```bash
bun add -d package-name
```

#### To a Package
```bash
cd packages/ui
bun add package-name
```

### Creating a New Component in UI Package
```bash
cd packages/ui
# Create component file
# Export from index.ts
# Update storybook if needed
```

### Running Tests
```bash
# Run all tests
turbo run test

# Run tests for specific project
turbo run test --filter=chronicler-client
```

## Troubleshooting

### Common Issues

#### Dependency Resolution Issues
```bash
# Clear all node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
bun install
```

#### Type Errors After Package Updates
```bash
# Rebuild all packages
turbo run build --force
```

#### Cache Issues
```bash
# Clear turbo cache
turbo run build --force

# Or clear specific task cache
rm -rf .turbo
```

### Getting Help

1. Check the specific project documentation in `/docs/projects/`
2. Review the [Architecture Overview](./architecture.md) for system design
3. Check existing [ADRs](./adr-template.md) for architectural decisions
4. Look at similar implementations in other apps

## Next Steps

After setting up your development environment:

1. Review the [Architecture Overview](./architecture.md)
2. Explore the [UI Components documentation](./ui-components.md)
3. Check out individual project documentation
4. Review the [Tooling guide](./tooling.md) for advanced development features

## Development Best Practices

- Always run `bun run lint` before committing
- Use the shared UI components when possible
- Follow the established patterns in each project
- Write ADRs for significant architectural decisions
- Keep dependencies up to date across the monorepo
- Use Turborepo filtering to work efficiently with specific projects