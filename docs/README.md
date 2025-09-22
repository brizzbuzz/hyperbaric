# Hyperbaric Documentation

Welcome to the comprehensive documentation for the Hyperbaric monorepo. This documentation covers both project-agnostic patterns and practices as well as detailed information about each individual project.

## 📋 Table of Contents

### General Documentation
- [Getting Started](./general/getting-started.md) - Setup and development workflow
- [Architecture Overview](./general/architecture.md) - Monorepo structure and design principles
- [Database Management](./general/database-management.md) - Atlas migrations and schema management
- [Authentication](./general/authentication.md) - How we handle auth across projects
- [UI Components & Design System](./general/ui-components.md) - Shared UI package usage
- [Package Management](./general/packages.md) - How we structure and use shared packages
- [Tooling & Development](./general/tooling.md) - Build tools, linting, and development workflow
- [Testing Strategy](./general/testing-strategy.md) - Comprehensive testing approach and patterns
- [Deployment](./general/deployment.md) - How we deploy and manage environments
- [ADR Template](./general/adr-template.md) - Template for Architecture Decision Records

### Projects

#### 🔍 Null Horizon
*Financial analysis tool*
- [Overview](./projects/null-horizon/README.md)
- [Getting Started](./projects/null-horizon/getting-started.md)
- [Architecture](./projects/null-horizon/architecture.md)
- [API Documentation](./projects/null-horizon/api.md)
- [ADRs](./projects/null-horizon/adrs/README.md)

#### 📰 Chronicler
*AI-native RSS feed reader tool*
- [Overview](./projects/chronicler/README.md)
- [Getting Started](./projects/chronicler/getting-started.md)
- [Architecture](./projects/chronicler/architecture.md)
- [API Documentation](./projects/chronicler/api.md)
- [ADRs](./projects/chronicler/adrs/README.md)

#### 🎨 Portfolio
*Personal portfolio showcasing work*
- [Overview](./projects/portfolio/README.md)
- [Getting Started](./projects/portfolio/getting-started.md)
- [Architecture](./projects/portfolio/architecture.md)
- [Content Management](./projects/portfolio/content.md)
- [ADRs](./projects/portfolio/adrs/README.md)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hyperbaric
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development**
   ```bash
   # Start all projects
   pnpm run dev
   
   # Or start specific project
   turbo run dev --filter=chronicler-client
   ```

## 🏗️ Monorepo Structure

```
hyperbaric/
├── apps/
│   ├── chronicler/         # AI-native RSS feed reader
│   │   ├── client/         # React frontend
│   │   └── server/         # Backend API
│   ├── null-horizon/       # Financial analysis tool
│   │   ├── client/         # React frontend
│   │   └── server/         # Backend API
│   ├── portfolio/          # Personal portfolio
│   │   └── client/         # React frontend
│   └── storybook/          # Component documentation
├── packages/
│   ├── ui/                 # Shared UI components
│   └── typescript-config/  # Shared TypeScript configuration
└── docs/                   # This documentation
```

## 🤝 Contributing

Please refer to the [Getting Started](./general/getting-started.md) guide for development workflow and contribution guidelines.

## 📝 Documentation Standards

This documentation follows a structured approach designed for future rendering systems:

- **General docs** contain project-agnostic information
- **Project docs** contain specific implementation details
- **ADRs** document architectural decisions with rationale
- All markdown files use consistent formatting for automated processing
- Code examples include proper language tagging
- Cross-references use relative links for portability

---

*Last updated: $(date)*