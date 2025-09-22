# Tooling & Development

This document outlines the development tools, build processes, and workflows used across the Hyperbaric monorepo.

## Core Development Tools

### Package Manager - pnpm

**Version**: 9.0.0+

pnpm serves as our primary package manager, providing:
- Fast package installation with efficient disk usage
- Workspace support for monorepo management
- Catalog feature for centralized version management
- Strict dependency resolution
- Built-in security auditing

#### Basic Commands
```bash
# Install dependencies
pnpm install

# Run scripts
pnpm run dev
pnpm run build

# Add dependencies
pnpm add package-name
pnpm add -D dev-package

# Workspace-specific commands
pnpm --filter project-name add package-name
pnpm --filter project-name run dev
```

### Build Orchestration - Turborepo

**Version**: Latest stable

Turborepo manages our monorepo build system with:
- Intelligent task scheduling and parallelization
- Incremental builds with remote caching
- Task dependency graphs
- Cross-project dependency resolution

#### Configuration (`turbo.json`)
```json
{
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "type-check": {}
  }
}
```

#### Common Turbo Commands
```bash
# Run task across all workspaces
turbo run build

# Filter by workspace
turbo run dev --filter=chronicler-client

# Force rebuild (ignore cache)
turbo run build --force

# Run with dependencies
turbo run build --filter=...chronicler-client
```

### Linting - OXLint

**Version**: Latest stable

OXLint provides fast TypeScript/JavaScript linting with:
- Type-aware linting rules
- Performance optimizations
- ESLint compatibility
- Auto-fixing capabilities

#### Commands
```bash
# Lint all files
pnpm run lint

# Fix auto-fixable issues
pnpm run lint:fix

# Basic linting without type checking
pnpm run lint:basic

# Type checking only
pnpm run lint:type-check
```

#### Configuration (`oxlint.json`)
```json
{
  "extends": ["@oxlint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  },
  "ignorePatterns": ["dist/**", "node_modules/**", ".turbo/**"]
}
```

### Code Formatting - Prettier

**Version**: 3.2.5+

Prettier handles code formatting with:
- Consistent style across all files
- Integration with editors
- Pre-commit hooks
- Support for TypeScript, JSON, Markdown

#### Commands
```bash
# Format all files
pnpm run format

# Check formatting without modifying
pnpm exec prettier --check "**/*.{ts,tsx,md}"
```

#### Configuration (`.prettierrc`)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## TypeScript Configuration

### Shared Configuration Package

**Location**: `packages/typescript-config/`

Provides consistent TypeScript settings across all projects:
- Strict type checking
- Modern ES features
- React JSX support
- Path mapping for monorepo imports

#### Base Configuration
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

### Project-Specific Overrides
Each project extends the base configuration:
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

## Runtime Requirements

### Development Environment
- pnpm 9.0.0+
- Node.js 18+ (for compatibility)
- TypeScript 5.5+
- Git 2.30+

#### Setup Verification
```bash
# Check versions
pnpm --version
node --version

# Install dependencies
pnpm install

# Start development
pnpm run dev
```

## Application Development

### Frontend Development

**Framework**: Vite + React

**Key Features**:
- Hot Module Replacement (HMR)
- TypeScript support
- Asset optimization
- Development server with proxy

**Command**: `pnpm run dev`

**Build Output**:
- Optimized JavaScript bundles
- Tree-shaken bundles
- Asset optimization
- Source maps for debugging

**Command**: `pnpm run build`

**Directory Structure**:
```
dist/
├── assets/          # Static assets (images, fonts)
├── *.js             # JavaScript bundles
├── *.css            # Compiled stylesheets
└── index.html       # Entry point
```

### Backend Development

**Framework**: Node.js + Hono

**Test Framework**: Vitest with Testcontainers

**Key Features**:
- TypeScript compilation
- Hot reload in development
- Database integration testing
- Container-based test isolation

#### Test Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    testTimeout: 10000,
    pool: "forks"
  }
});
```

#### Running Tests
```bash
# Run tests
pnpm run test

# Watch mode
pnpm --filter project-name run test

# Coverage report
pnpm run test -- --coverage
```

## Monorepo Workspace Management

### Workspace Structure
```
hyperbaric/
├── apps/
│   ├── chronicler/
│   ├── null-horizon/
│   └── portfolio/
├── packages/
│   ├── ui/
│   └── typescript-config/
└── package.json        # Workspace root
```

### Package Linking

**Automatic**: pnpm handles workspace linking automatically
**Manual**: Use `pnpm link` for local development

### Dependency Management

**Workspace Dependencies**:
```json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

### Cross-Package Development

1. **Make Changes**: Edit source in `packages/`
2. **Build Package**: `turbo run build --filter=@repo/package-name`
3. **Test Integration**: Changes are immediately available in consuming apps

## Performance Optimization

### Build Performance

**Turborepo Caching**:
- Local task caching
- Remote cache support (future)
- Incremental builds based on file changes

**Parallel Execution**:
- Tasks run in parallel where possible
- Dependency graph ensures correct order
- Maximum CPU utilization

### Bundle Analysis

**Vite Bundle Analyzer**:
```bash
# Analyze bundle size
pnpm run build -- --analyze
```

**Bundle Size Monitoring**:
- Track bundle size changes
- Set size budgets per application
- Alert on significant increases

## CI/CD Integration

### GitHub Actions Workflow

**Example Configuration**:
```yaml
name: CI
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run type-check
      - run: pnpm run test
      - run: pnpm run build
```

**Quality Gates**:
- All linting passes
- Type checking succeeds
- All tests pass
- Build completes successfully
- Bundle size within limits

## Documentation Tools

### Storybook

**Purpose**: Component documentation and testing
**Location**: `apps/storybook/`
**Command**: `turbo run dev --filter=storybook`

### API Documentation

**Framework**: Auto-generated from TypeScript types
**Output**: JSON schemas and OpenAPI specs

### Architecture Decision Records (ADRs)

**Location**: `docs/projects/*/adrs/`
**Template**: `docs/general/adr-template.md`
**Purpose**: Document significant architectural decisions

## Development Workflow

### Daily Development

1. **Pull Latest**: `git pull`
2. **Install Dependencies**: `pnpm install`
3. **Start Development**: `pnpm run dev`
4. **Make Changes**: Edit code
5. **Run Quality Checks**: `pnpm run lint && pnpm run type-check`
6. **Test Changes**: `pnpm run test`
7. **Commit**: `git commit -m "feat: description"`

### Adding New Features

1. **Create Branch**: `git checkout -b feature/name`
2. **Develop Feature**: Write code and tests
3. **Document Changes**: Update relevant documentation
4. **Quality Checks**: Ensure all checks pass
5. **Create PR**: Submit for review

### Performance Monitoring

**Bundle Analysis**:
- Regular bundle size analysis
- Performance impact assessment
- Optimization recommendations

**Build Performance**:
- Monitor Turborepo cache hit rates
- Track build time trends
- Identify optimization opportunities

## Troubleshooting

### Common Issues

**Dependency Resolution**:
```bash
# Clear all caches
rm -rf node_modules .turbo dist
pnpm install

# Force rebuild
turbo run build --force
```

**TypeScript Errors**:
```bash
# Check TypeScript configuration
pnpm run type-check

# Restart TypeScript service in VS Code
# CMD/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

**Build Failures**:
- Check dependency versions
- Verify TypeScript configuration
- Clear caches and rebuild
- Check for circular dependencies

### Performance Issues

**Slow Builds**:
- Check Turborepo cache utilization
- Verify task dependencies are correct
- Consider task parallelization

**Large Bundle Sizes**:
- Analyze bundle composition
- Review dependency usage
- Implement code splitting

### Getting Help

1. Check project-specific documentation
2. Review existing ADRs for context
3. Examine similar implementations
4. Consult team knowledge base
5. Create new ADR for decisions

---

This tooling setup provides a robust foundation for monorepo development with focus on performance, maintainability, and developer experience.