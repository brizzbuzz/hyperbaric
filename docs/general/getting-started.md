# Getting Started

This guide will help you set up the Hyperbaric monorepo for development and understand the basic workflow.

## Prerequisites

Before you begin, ensure you have the following installed:

- **pnpm** (v9.0.0 or later) - Our primary package manager
- **Node.js** (v18 or later) - JavaScript runtime
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
pnpm install
```

This will install all dependencies for the monorepo, including all apps and packages.

### 3. Environment Configuration

Each project may require environment variables. Check the individual project documentation for specific requirements:

- [Null Horizon Environment Setup](../projects/null-horizon/getting-started.md#environment-setup)
- [Chronicler Environment Setup](../projects/chronicler/getting-started.md#environment-setup)
- [Portfolio Environment Setup](../projects/portfolio/getting-started.md#environment-setup)

## Package Management with pnpm

### pnpm Catalog

We use pnpm's catalog feature to manage dependency versions across the monorepo. The catalog is defined in the root `package.json` under the `pnpm.catalog` field. This ensures consistent versions across all packages and applications.

#### Adding Dependencies

When adding new dependencies, prefer using catalog references:

```bash
# Add to catalog first (in root package.json)
pnpm add -D -w some-package@^1.0.0

# Then reference in individual packages using catalog:
# In package.json: "some-package": "catalog:"
```

#### Version Management

- **Catalog versions** are managed centrally in the root `package.json`
- **Individual packages** reference catalog versions using `"catalog:"` syntax
- **Updates** are applied once in the catalog and propagate to all consuming packages

### Workspace Commands

```bash
# Install dependencies across all workspaces
pnpm install

# Add dependency to specific workspace
pnpm --filter null-horizon-server add some-package

# Add dev dependency to root workspace
pnpm add -D -w some-dev-tool

# Run script in specific workspace
pnpm --filter chronicler-client run build
```

## Development Workflow

### Running Projects

#### Start All Projects
```bash
pnpm run dev
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
pnpm run build
```

#### Build Specific Project
```bash
turbo run build --filter=chronicler-client
```

### Code Quality

#### Linting
```bash
# Run linter on all projects
pnpm run lint

# Fix auto-fixable issues
pnpm run lint:fix

# Basic linting without type checking
pnpm run lint:basic

# Type checking only
pnpm run lint:type-check
```

#### Formatting
```bash
pnpm run format
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
pnpm --filter chronicler-client add package-name
```

#### To the Root (DevDependencies)
```bash
pnpm add -D -w package-name
```

#### To a Package
```bash
pnpm --filter @repo/ui add package-name
```

#### Using Catalog References
```bash
# Add to catalog in root package.json
pnpm add -D -w package-name@^1.0.0

# Reference in individual package.json files:
# "package-name": "catalog:"
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

# Run tests in watch mode
pnpm --filter null-horizon-server run test
```

## Test Strategy

Our testing strategy follows a comprehensive approach with multiple layers:

### Test Architecture

#### 1. Unit Tests
- **Purpose**: Test individual functions, components, and modules in isolation
- **Tools**: Vitest for Node.js/backend, Jest/Testing Library for React components
- **Location**: Co-located with source files or in `__tests__` directories
- **Scope**: Pure functions, utility modules, component logic

#### 2. Integration Tests
- **Purpose**: Test interactions between modules and external services
- **Tools**: Vitest with Testcontainers for database integration
- **Location**: `test/` directories in each project
- **Scope**: API endpoints, database repositories, service integrations

#### 3. Database Testing
- **Strategy**: Isolated test databases using Testcontainers
- **Schema Management**: Atlas applies migrations to test containers
- **Data Management**: Clean state between tests, realistic test data
- **Example**: See `apps/null-horizon/server/test/setup.ts`

#### 4. End-to-End Tests (Future)
- **Purpose**: Test complete user workflows
- **Tools**: Playwright (planned)
- **Scope**: Critical user journeys, cross-application flows

### Test Configuration Example

Based on our null-horizon server implementation:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    testTimeout: 10000,
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true }
    }
  }
});
```

### Database Testing Setup

Our database tests use:
- **Testcontainers**: Isolated PostgreSQL instances
- **Atlas**: Schema migrations applied to test containers
- **Kysely**: Type-safe query builder for test assertions
- **Repository Pattern**: Testing data layer abstractions

### Test Organization

```
project/
├── src/
│   └── __tests__/          # Unit tests
├── test/
│   ├── setup.ts            # Test configuration
│   ├── repositories/       # Repository integration tests
│   └── *.test.ts          # Integration tests
└── vitest.config.ts       # Test runner configuration
```

### Best Practices

1. **Isolation**: Each test runs with clean database state
2. **Realistic Data**: Use meaningful test data that represents real scenarios
3. **Fast Feedback**: Unit tests run quickly, integration tests are parallelizable
4. **Type Safety**: Leverage TypeScript for test reliability
5. **Documentation**: Tests serve as living documentation of expected behavior

## Troubleshooting

### Common Issues

#### Dependency Resolution Issues
```bash
# Clear all node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
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

# Clear pnpm cache
pnpm store prune
```

#### pnpm Workspace Issues
```bash
# Verify workspace configuration
pnpm list --depth=0

# Check for catalog inconsistencies
pnpm audit --fix
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
5. Examine the test setup in `apps/null-horizon/server/test/` as a reference

## Development Best Practices

- Always run `pnpm run lint` before committing
- Use the shared UI components when possible
- Follow the established patterns in each project
- Write ADRs for significant architectural decisions
- Keep dependencies up to date via the pnpm catalog
- Use Turborepo filtering to work efficiently with specific projects
- Write tests following our established patterns (see null-horizon server example)
- Leverage TypeScript for better development experience and reliability