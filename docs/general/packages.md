# Package Management

This document covers how shared packages are structured, managed, and used across the Hyperbaric monorepo.

## Overview

The Hyperbaric monorepo uses a centralized package management approach with shared packages that provide common functionality across all applications.

## Package Structure

### Current Packages

#### @repo/ui
The shared UI component library and design system.

**Location**: `/packages/ui`

**Purpose**:
- Shared React components
- Design system tokens and themes
- Common UI utilities and hooks
- Consistent styling patterns

**Usage**:
```typescript
import { Button, Input, Card } from '@repo/ui'
import { useTheme, useBreakpoint } from '@repo/ui'
```

#### @repo/typescript-config
Shared TypeScript configurations for consistent type checking.

**Location**: `/packages/typescript-config`

**Purpose**:
- Base TypeScript configuration
- Strict type checking rules
- Shared compiler options
- Path mapping configurations

**Usage**:
```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    // Project-specific overrides
  }
}
```

## Package Development

### Creating a New Package

1. **Create Package Directory**
   ```bash
   mkdir packages/new-package
   cd packages/new-package
   ```

2. **Initialize Package**
   ```bash
   bun init
   # Edit package.json with proper name and dependencies
   ```

3. **Set Up TypeScript**
   ```json
   // tsconfig.json
   {
     "extends": "@repo/typescript-config/base.json",
     "compilerOptions": {
       "outDir": "dist",
       "rootDir": "src"
     },
     "include": ["src/**/*"],
     "exclude": ["dist", "node_modules"]
   }
   ```

4. **Add to Workspace**
   The package is automatically included via the `workspaces` field in the root `package.json`.

### Package.json Structure

```json
{
  "name": "@repo/package-name",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "oxlint --type-aware",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/typescript-config": "*",
    "typescript": "^5.2.2"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  }
}
```

## Dependency Management

### Adding Dependencies

#### To a Package
```bash
cd packages/ui
bun add some-dependency

# Or for dev dependencies
bun add -d some-dev-dependency
```

#### To an Application
```bash
cd apps/chronicler/client
bun add some-dependency

# To use a workspace package
bun add @repo/ui
```

#### To Root (Development Tools)
```bash
# From root directory
bun add -d some-dev-tool
```

### Dependency Guidelines

1. **Shared Dependencies**: Common dependencies should be in packages, not duplicated across apps
2. **Peer Dependencies**: Use peer dependencies for React, TypeScript, and other common libraries
3. **Version Consistency**: Keep versions consistent across the monorepo
4. **Bundle Size**: Be mindful of package size impact on applications

## Building Packages

### Build Process

Packages are built automatically by Turborepo when applications depend on them.

```bash
# Build all packages
turbo run build --filter=./packages/*

# Build specific package
turbo run build --filter=@repo/ui

# Build with dependencies
turbo run build --filter=@repo/ui...
```

### Build Configuration

Each package should have:
- TypeScript compilation to ES modules
- Type declaration generation
- Proper exports in package.json
- Build caching via Turborepo

## Using Packages in Applications

### Import Patterns

```typescript
// Named imports (preferred)
import { Button, Input } from '@repo/ui'

// Default imports when appropriate
import theme from '@repo/ui/theme'

// Deep imports for optimization
import { Button } from '@repo/ui/components/Button'
```

### TypeScript Integration

Packages automatically provide TypeScript types through the workspace configuration:

```typescript
// Types are automatically available
const button: ComponentProps<typeof Button> = {
  variant: 'primary',
  children: 'Click me'
}
```

## Publishing Strategy

### Internal Packages

All current packages are private and not published to npm. They exist only within the monorepo workspace.

```json
{
  "private": true
}
```

### Future Publishing

If packages need to be published externally:

1. Remove `"private": true`
2. Set up publishing workflow
3. Configure proper versioning
4. Add public repository information

## Package Versioning

### Current Approach

- All packages use `0.0.0` version
- Changes are tracked through git commits
- No formal versioning required for internal packages

### Future Versioning

Consider implementing:
- Semantic versioning for breaking changes
- Automated changelog generation
- Version bumping workflows
- Release management

## Development Workflow

### Local Development

1. **Make Changes**: Edit package source code
2. **Build**: Turborepo handles incremental builds
3. **Test**: Run tests in dependent applications
4. **Commit**: Standard git workflow

### Testing Package Changes

```bash
# Run tests for applications using the package
turbo run test --filter=...@repo/ui

# Start dev mode to see live changes
turbo run dev --filter=chronicler-client
```

## Best Practices

### Package Design

1. **Single Responsibility**: Each package should have a clear, focused purpose
2. **Minimal API Surface**: Export only what's necessary
3. **Tree Shakeable**: Support dead code elimination
4. **Well Documented**: Include JSDoc comments and examples

### Dependency Management

1. **Minimize Dependencies**: Only include necessary dependencies
2. **Peer Dependencies**: Use for commonly available packages
3. **Version Ranges**: Use appropriate version ranges
4. **Security**: Regularly update and audit dependencies

### Code Organization

1. **Clear Exports**: Organize exports logically in index files
2. **Type Definitions**: Provide comprehensive TypeScript types
3. **Documentation**: Include README files for each package
4. **Examples**: Provide usage examples in documentation

## Troubleshooting

### Common Issues

#### Package Not Found
```bash
# Ensure package is built
turbo run build --filter=@repo/package-name

# Check workspace configuration
bun install
```

#### Type Errors
```bash
# Rebuild TypeScript declarations
turbo run build --filter=@repo/package-name --force

# Clear TypeScript cache
rm -rf node_modules/.cache
```

#### Circular Dependencies
- Avoid importing from applications into packages
- Keep dependency direction: apps → packages → external

### Development Tips

1. **Live Reload**: Use `turbo run dev` for live package rebuilding
2. **Build Order**: Turborepo handles build dependencies automatically
3. **Cache Issues**: Use `--force` flag to bypass cache when needed
4. **Type Checking**: Run `turbo run type-check` to verify all types

## Future Package Plans

### Potential New Packages

- **@repo/utils**: Shared utility functions and helpers
- **@repo/auth**: Authentication utilities and components
- **@repo/api**: Shared API client utilities
- **@repo/testing**: Testing utilities and setup
- **@repo/icons**: Icon component library
- **@repo/charts**: Data visualization components

### Package Improvements

- Enhanced build tooling and optimization
- Automated testing and quality checks
- Documentation generation and hosting
- Performance monitoring and metrics
- Component visual testing and regression detection

---

This package management system provides a solid foundation for code sharing and consistency across the Hyperbaric monorepo while maintaining flexibility for future growth and improvements.