# Tooling & Development

This document covers the development tooling, build systems, and workflow automation used across the Hyperbaric monorepo.

## Overview

The Hyperbaric monorepo uses modern development tools to ensure code quality, performance, and developer productivity across all projects.

## Core Tools

### Package Manager - Bun

**Version**: 1.2.20+

Bun serves as our primary package manager and JavaScript runtime, providing:
- Fast package installation and resolution
- Built-in bundler and test runner
- TypeScript support out of the box
- Node.js compatibility

**Usage**:
```bash
# Install dependencies
bun install

# Run scripts
bun run dev
bun run build

# Add dependencies
bun add package-name
bun add -d dev-package
```

### Build System - Turborepo

**Purpose**: Monorepo orchestration and build caching

**Features**:
- Intelligent build caching
- Parallel task execution
- Dependency-aware task scheduling
- Remote caching capabilities

**Configuration**: `turbo.json`
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build", "type-check"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**", "build/**"]
    },
    "type-check": {
      "dependsOn": ["^type-check"],
      "inputs": ["$TURBO_DEFAULT$", "tsconfig.json"],
      "outputs": []
    },
    "lint": {
      "dependsOn": ["^lint", "type-check"],
      "cache": false,
      "inputs": ["$TURBO_DEFAULT$", "oxlint.json", ".oxlintrc.json"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Common Commands**:
```bash
# Run command across all packages
turbo run build

# Filter to specific packages
turbo run dev --filter=chronicler-client
turbo run build --filter=./packages/*

# Force rebuild (ignore cache)
turbo run build --force
```

## Code Quality Tools

### Linting - OXLint

**Purpose**: Fast TypeScript/JavaScript linting

**Features**:
- TypeScript-aware linting
- High performance (written in Rust)
- ESLint-compatible rules
- Automatic fixes for many issues

**Configuration**: `oxlint.json`
```json
{
  "rules": {
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

**Usage**:
```bash
# Lint all files
bun run lint

# Fix auto-fixable issues
bun run lint:fix

# Basic linting without type checking
bun run lint:basic

# Type checking only
bun run lint:type-check
```

### Code Formatting - Prettier

**Purpose**: Consistent code formatting

**Configuration**: `.prettierrc`
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Usage**:
```bash
# Format all files
bun run format

# Check formatting without modifying
npx prettier --check "**/*.{ts,tsx,md}"
```

## Development Servers

### Vite

**Used by**: All React applications

**Features**:
- Fast HMR (Hot Module Replacement)
- Native ES modules
- TypeScript support
- Optimized production builds

**Configuration**: `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
})
```

## TypeScript Configuration

### Shared Configuration

**Base Config**: `packages/typescript-config/base.json`
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

### Project-Specific Configs

Applications extend the base configuration:
```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Environment Management

### Development Environment

**Requirements**:
- Bun 1.2.20+
- Node.js 18+ (for compatibility)
- Git

**Setup**:
```bash
# Check versions
bun --version
node --version

# Install dependencies
bun install

# Start development
bun run dev
```

### Environment Variables

**Structure**:
- `.env.example` - Template with required variables
- `.env.local` - Local development overrides (gitignored)
- `process.env` - Runtime environment variables

**Best Practices**:
- Never commit secrets to version control
- Use descriptive names with prefixes
- Validate required environment variables at startup
- Document all environment variables

## Build Process

### Development Builds

**Characteristics**:
- Fast incremental compilation
- Source maps for debugging
- Hot module replacement
- Unminified output

**Command**: `bun run dev`

### Production Builds

**Characteristics**:
- Optimized and minified
- Tree-shaken bundles
- Asset optimization
- Type checking enforcement

**Command**: `bun run build`

### Build Outputs

```
dist/
├── assets/          # Static assets (images, fonts)
├── *.js             # JavaScript bundles
├── *.css            # Compiled stylesheets
└── index.html       # Entry point
```

## Testing

### Unit Testing

**Framework**: Built-in Bun test runner

**Configuration**:
```typescript
// bun.config.ts
export default {
  test: {
    coverage: {
      exclude: ['dist/**', 'node_modules/**']
    }
  }
}
```

**Usage**:
```bash
# Run tests
bun test

# Watch mode
bun test --watch

# Coverage report
bun test --coverage
```

### Testing Patterns

**Component Testing**:
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@repo/ui'

test('button renders correctly', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

## Development Workflow

### Git Workflow

**Branch Strategy**:
- `main` - Production-ready code
- `feature/*` - Feature development
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

**Commit Convention**:
```
type(scope): description

feat(ui): add new button component
fix(api): resolve authentication issue
docs(readme): update installation instructions
```

### Pre-commit Hooks

**Setup**: Using simple git hooks or husky

**Checks**:
- Linting and formatting
- Type checking
- Unit tests
- Build verification

### Code Review Process

1. Create feature branch
2. Implement changes with tests
3. Run quality checks locally
4. Create pull request
5. Automated CI checks
6. Peer review
7. Merge to main

## Performance Tools

### Bundle Analysis

**Vite Bundle Analyzer**:
```bash
# Analyze bundle size
bun run build --analyze
```

**Bundle Size Monitoring**:
- Track bundle size changes
- Set size budgets per application
- Monitor third-party dependency impact

### Performance Monitoring

**Development**:
- React DevTools
- Browser performance timeline
- Network tab analysis

**Production**:
- Web Vitals monitoring
- Error tracking
- Performance metrics collection

## Debugging Tools

### Development Debugging

**Browser DevTools**:
- Source maps for original code
- React component inspector
- Network request monitoring
- Performance profiling

**VS Code Integration**:
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Debug Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

## CI/CD Integration

### GitHub Actions

**Workflow Example**:
```yaml
name: CI
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      
      - run: bun install
      - run: bun run lint
      - run: bun run type-check
      - run: bun run test
      - run: bun run build
```

### Quality Gates

**Required Checks**:
- All linting rules pass
- No TypeScript errors
- All tests pass
- Successful build completion
- Bundle size within limits

## Documentation Tools

### Storybook

**Purpose**: Component documentation and testing

**Location**: `apps/storybook`

**Usage**:
```bash
# Start Storybook
turbo run dev --filter=storybook

# Build static Storybook
turbo run build --filter=storybook
```

### API Documentation

**Tools**:
- JSDoc for code documentation
- OpenAPI for REST API specs
- Markdown for general documentation

## Monitoring & Observability

### Development Monitoring

**Turborepo Dashboard**:
- Build times and cache hit rates
- Task dependency visualization
- Performance metrics

**Package Analysis**:
- Dependency tree visualization
- Bundle composition analysis
- Performance impact assessment

## Troubleshooting

### Common Issues

#### Cache Problems
```bash
# Clear all caches
rm -rf node_modules .turbo dist
bun install

# Force rebuild
turbo run build --force
```

#### TypeScript Errors
```bash
# Check TypeScript configuration
bun run type-check

# Restart TypeScript service in VS Code
# CMD/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

#### Build Failures
```bash
# Check build output
turbo run build --verbose

# Build specific package
turbo run build --filter=@repo/ui
```

### Performance Issues

**Slow Builds**:
- Check Turborepo cache configuration
- Verify dependency graph efficiency
- Monitor build parallelization

**Large Bundle Sizes**:
- Analyze bundle composition
- Review dependency usage
- Implement code splitting

## Future Improvements

### Planned Enhancements

**Development Experience**:
- Enhanced error reporting and debugging
- Automated dependency updates
- Performance regression detection
- Advanced caching strategies

**Quality Assurance**:
- Visual regression testing
- Accessibility testing automation
- Performance budgets and monitoring
- Security vulnerability scanning

**Build Optimization**:
- Module federation for micro-frontends
- Advanced tree-shaking
- Asset optimization pipelines
- CDN integration for static assets

---

This tooling setup provides a robust foundation for development while maintaining flexibility for future enhancements and team growth.