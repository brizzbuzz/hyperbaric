# Architecture Overview

This document provides a high-level overview of the Hyperbaric monorepo architecture, design principles, and system organization.

## System Architecture

### Monorepo Structure

The Hyperbaric monorepo follows a domain-driven architecture with clear separation between shared infrastructure and application-specific code:

```
hyperbaric/
├── apps/                   # Application layer
│   ├── chronicler/         # AI RSS feed reader
│   ├── null-horizon/       # Financial analysis platform
│   ├── portfolio/          # Personal portfolio
│   └── storybook/          # Component documentation
├── packages/               # Shared infrastructure
│   ├── ui/                 # Design system & components
│   └── typescript-config/  # Shared configurations
└── docs/                   # Documentation
```

### Design Principles

#### 1. **Separation of Concerns**
- **Applications** (`/apps`) contain business logic and application-specific code
- **Packages** (`/packages`) contain shared, reusable infrastructure
- Clear boundaries between domains prevent tight coupling

#### 2. **Dependency Direction**
- Apps depend on packages, never the reverse
- Packages can depend on other packages with careful consideration
- External dependencies are consolidated to reduce bundle size

#### 3. **Consistency Through Constraints**
- Shared TypeScript configuration ensures type safety
- Unified linting and formatting rules
- Common build patterns via Turborepo

#### 4. **Progressive Enhancement**
- Start with minimal viable implementations
- Add complexity only when justified by requirements
- Maintain backward compatibility when possible

## Application Architecture Patterns

### Client-Server Architecture

Most applications follow a client-server pattern:

```
┌─────────────────┐    ┌─────────────────┐
│   Client (SPA)  │◄──►│  Server (API)   │
│   - React/Vite  │    │  - Node.js      │
│   - UI Package  │    │  - Database     │
│   - State Mgmt  │    │  - Auth         │
└─────────────────┘    └─────────────────┘
```

### Shared Package Architecture

#### UI Package Structure
```
packages/ui/
├── src/
│   ├── components/     # Reusable React components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # Shared TypeScript types
│   └── index.ts        # Public API exports
├── package.json
└── tsconfig.json
```

#### Component Design Philosophy
- **Atomic Design**: Components built from atoms → molecules → organisms
- **Composition over Inheritance**: Favor composable patterns
- **Accessibility First**: WCAG 2.1 AA compliance by default
- **Theme Consistency**: Centralized design tokens

## Technology Stack

### Frontend Stack
- **React** - UI framework for interactive interfaces
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first styling (where applicable)

### Backend Stack
- **Node.js** - JavaScript runtime
- **TypeScript** - End-to-end type safety
- **Better Auth** - Authentication and session management
- **PostgreSQL** - Primary database for all applications

### Development & Build Tools
- **Turborepo** - Monorepo orchestration and caching
- **OXLint** - Fast TypeScript/JavaScript linter
- **Prettier** - Code formatting
- **pnpm** - Package manager with workspace support

## Data Flow Architecture

### Authentication Flow
```
Client Request → Auth Middleware → Route Handler → Response
                      ↓
                PostgreSQL ← Better Auth
```

### Component Data Flow
```
App State → Context/Props → UI Components → User Actions → State Updates
```

### API Communication
```
Client → HTTP Request → Server Router → Business Logic → PostgreSQL → Response
```

## Scalability Patterns

### Horizontal Scaling
- **Stateless Services**: All applications designed to be stateless
- **Database Scaling**: PostgreSQL connection pooling and read replicas
- **CDN Integration**: Static asset distribution
- **Caching Strategies**: Application-level caching

### Development Scaling
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **Incremental Builds**: Turborepo caching reduces build times
- **Parallel Development**: Clear boundaries enable team parallelization
- **Testing Strategy**: Unit, integration, and E2E testing at appropriate levels

## Security Architecture

### Authentication & Authorization
- **Session-based Auth**: Better Auth provides secure session management
- **CSRF Protection**: Built-in request validation
- **Secure Headers**: Content Security Policy and security headers
- **Environment Isolation**: Separate configs for dev/staging/production

### Data Protection
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries with PostgreSQL
- **XSS Protection**: Content Security Policy and output encoding
- **Sensitive Data**: Environment variables for secrets and API keys

## Performance Architecture

### Build Performance
- **Turborepo Caching**: Intelligent build caching across projects
- **Incremental Builds**: Only rebuild changed dependencies
- **Parallel Execution**: Multi-core build processes
- **Tree Shaking**: Eliminate unused code from bundles

### Runtime Performance
- **Code Splitting**: Load only necessary JavaScript
- **Asset Optimization**: Image compression and modern formats
- **Bundle Analysis**: Regular monitoring of bundle sizes
- **Progressive Loading**: Critical path optimization

## Monitoring & Observability

### Development Monitoring
- **TypeScript Compiler**: Compile-time error detection
- **Linting**: Runtime error prevention
- **Build Metrics**: Turborepo provides build timing and cache hit rates

### Production Readiness
Each application implements:
- Error boundaries for graceful failure handling
- Logging strategies for debugging and monitoring
- Performance metrics collection
- Health check endpoints
- PostgreSQL connection health monitoring

## Migration & Evolution Strategy

### Incremental Migration
- New features built with current architecture
- Legacy code updated during maintenance cycles
- PostgreSQL migrations handled by Better Auth and application-specific scripts
- API versioning for backward compatibility

### Technology Updates
- Regular dependency updates via automated tools
- Breaking changes documented in project ADRs
- Feature flags for gradual rollouts
- Rollback strategies for failed deployments

## Cross-Cutting Concerns

### Error Handling
- Consistent error response formats across APIs
- Client-side error boundaries
- Graceful degradation patterns
- User-friendly error messaging

### Logging & Debugging
- Structured logging in production
- Development-friendly error messages
- Source maps for production debugging
- Request tracing across services

### Configuration Management
- Environment-specific configuration
- Type-safe configuration objects
- Runtime configuration validation
- Secrets management best practices

## Future Architectural Considerations

### Potential Evolution Paths
- **Micro-frontends**: If apps grow significantly independent
- **GraphQL**: For complex data fetching requirements
- **Server-Side Rendering**: For SEO-critical applications
- **Real-time Features**: WebSocket integration patterns
- **Mobile Applications**: React Native or native app considerations

### Technical Debt Management
- Regular architecture reviews
- Dependency updates and security patches
- Performance monitoring and optimization
- Documentation maintenance and updates

---

This architecture is designed to evolve with the needs of the projects while maintaining consistency and developer productivity across the monorepo.