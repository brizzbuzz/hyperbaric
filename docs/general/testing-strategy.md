# Testing Strategy

This document outlines our comprehensive testing approach across the Hyperbaric monorepo, establishing patterns, tools, and best practices for maintaining code quality and reliability.

## Overview

Our testing strategy follows a layered approach with multiple testing levels, each serving specific purposes in ensuring application reliability, maintainability, and performance.

### Testing Principles

1. **Fast Feedback**: Tests provide quick validation during development
2. **Isolation**: Each test runs independently without side effects
3. **Reliability**: Tests are deterministic and produce consistent results
4. **Maintainability**: Tests are easy to understand, modify, and extend
5. **Realistic**: Test scenarios reflect real-world usage patterns

## Test Architecture

### Testing Pyramid

```
    /\
   /  \     E2E Tests
  /____\    (Few, Critical Paths)
 /      \
/________\   Integration Tests
\        /   (Some, Service Interactions)
 \      /
  \____/     Unit Tests
   \  /      (Many, Fast)
    \/
```

#### 1. Unit Tests (Foundation)
- **Scope**: Individual functions, components, utilities
- **Speed**: Very fast (< 10ms per test)
- **Isolation**: No external dependencies
- **Coverage**: High coverage of business logic

#### 2. Integration Tests (Core)
- **Scope**: Module interactions, database operations, API endpoints
- **Speed**: Moderate (< 1s per test)
- **Dependencies**: Real databases, external services
- **Coverage**: Critical application workflows

#### 3. End-to-End Tests (Peak)
- **Scope**: Complete user journeys
- **Speed**: Slower (5-30s per test)
- **Environment**: Production-like setup
- **Coverage**: Critical business paths only

## Implementation by Project Type

### Backend Applications (Node.js)

#### Test Framework: Vitest

**Configuration Example**:
```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    include: ["test/**/*.test.ts", "test/**/*.spec.ts"],
    exclude: ["node_modules", "dist", "build"],
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
```

#### Database Testing with Testcontainers

**Setup Pattern**:
```typescript
// test/setup.ts
import { beforeAll, afterAll, beforeEach } from "vitest";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

let testContainer: StartedPostgreSqlContainer;
let testDb: Kysely<Database>;

export async function setupTestDatabase() {
  // Start PostgreSQL container
  const container = new PostgreSqlContainer("postgres:17")
    .withDatabase("test")
    .withUsername("test")
    .withPassword("test")
    .withStartupTimeout(5000);

  testContainer = await container.start();
  
  const connectionString = testContainer.getConnectionUri() + "?sslmode=disable";
  
  // Apply schema using Atlas
  execSync(
    `atlas schema apply --env test --config file://atlas-test.hcl --auto-approve`,
    { stdio: "inherit" }
  );

  // Create Kysely instance
  const pool = new Pool({ connectionString, max: 10 });
  testDb = new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
  });

  return { container: testContainer, db: testDb, connectionString };
}

// Global setup and teardown
beforeAll(setupTestDatabase, 10000);
afterAll(async () => {
  if (testDb) await testDb.destroy();
  if (testContainer) await testContainer.stop();
});

// Clean database between tests
beforeEach(async () => {
  const tables = ["auth.session", "auth.account", "auth.user", "asset.assets"];
  for (const table of tables) {
    await testDb.deleteFrom(table as any).execute();
  }
});
```

#### Repository Testing Pattern

**Example Test**:
```typescript
// test/repositories/user.test.ts
import { describe, it, expect } from "vitest";
import { getTestRepositories } from "../setup.js";

describe("UserRepository", () => {
  it("should create a new user", async () => {
    const repositories = getTestRepositories();

    const userData = {
      id: "test-user-123",
      name: "John Doe",
      email: "john@example.com",
      emailVerified: false,
    };

    const user = await repositories.users.create(userData);

    expect(user.id).toBe("test-user-123");
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john@example.com");
    expect(user.createdAt).toBeDefined();
  });

  it("should find user by email", async () => {
    const repositories = getTestRepositories();
    
    await repositories.users.create({
      id: "user-1",
      name: "Jane Doe",
      email: "jane@example.com",
      emailVerified: true,
    });

    const user = await repositories.users.findByEmail("jane@example.com");
    
    expect(user).toBeDefined();
    expect(user?.name).toBe("Jane Doe");
  });
});
```

#### API Testing Pattern

**Example Test**:
```typescript
// test/api/auth.test.ts
import { describe, it, expect } from "vitest";
import { app } from "../src/app.js";
import { getTestConnectionString } from "./setup.js";

describe("Authentication API", () => {
  it("should register new user", async () => {
    const response = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "newuser@example.com",
        password: "securepassword",
        name: "New User"
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.user.email).toBe("newuser@example.com");
  });

  it("should authenticate valid user", async () => {
    // Setup: Create user first
    await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "auth@example.com",
        password: "password123",
        name: "Auth User"
      }),
    });

    // Test: Login
    const response = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "auth@example.com",
        password: "password123",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.token).toBeDefined();
  });
});
```

### Frontend Applications (React)

#### Test Framework: Vitest + Testing Library

**Configuration Example**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
});
```

**Setup File**:
```typescript
// test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

#### Component Testing Pattern

**Example Test**:
```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('applies variant styles correctly', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });
});
```

#### Hook Testing Pattern

**Example Test**:
```typescript
// src/hooks/__tests__/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from '../useAuth';

const mockAuthContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider value={mockAuthContext}>
    {children}
  </AuthProvider>
);

describe('useAuth', () => {
  it('returns auth context', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.login).toBe('function');
  });

  it('handles login action', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });
    
    expect(mockAuthContext.login).toHaveBeenCalledWith('user@example.com', 'password');
  });
});
```

## Test Data Management

### Test Data Strategy

1. **Factories**: Generate realistic test data
2. **Fixtures**: Static data for consistent testing
3. **Builders**: Flexible data construction
4. **Cleanup**: Ensure test isolation

#### Data Factory Example

```typescript
// test/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export class UserFactory {
  static build(overrides: Partial<User> = {}): User {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      emailVerified: faker.datatype.boolean(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  static buildMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }
}
```

#### Usage Example

```typescript
// test/repositories/user.test.ts
import { UserFactory } from '../factories/user.factory.js';

describe('UserRepository', () => {
  it('should handle user creation with realistic data', async () => {
    const userData = UserFactory.build({
      email: 'specific@example.com'
    });

    const user = await repositories.users.create(userData);
    
    expect(user.email).toBe('specific@example.com');
    expect(user.name).toMatch(/^[A-Za-z\s]+$/); // Realistic name format
  });
});
```

## Test Organization

### Directory Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── __tests__/
│   │       └── useAuth.test.tsx
│   └── utils/
│       ├── validation.ts
│       └── __tests__/
│           └── validation.test.ts
├── test/
│   ├── setup.ts
│   ├── factories/
│   │   ├── user.factory.ts
│   │   └── asset.factory.ts
│   ├── fixtures/
│   │   └── sample-data.json
│   ├── repositories/
│   │   ├── user.test.ts
│   │   └── asset.test.ts
│   └── api/
│       ├── auth.test.ts
│       └── portfolio.test.ts
└── vitest.config.ts
```

### Naming Conventions

- **Unit Tests**: `*.test.ts` or `*.spec.ts`
- **Integration Tests**: `*.integration.test.ts`
- **E2E Tests**: `*.e2e.test.ts`
- **Test Utilities**: `test-utils.ts`
- **Factories**: `*.factory.ts`
- **Fixtures**: `*.fixture.json`

## Running Tests

### Command Patterns

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage

# Run specific test file
pnpm run test user.test.ts

# Run tests for specific project
pnpm --filter null-horizon-server run test

# Run integration tests only
pnpm run test -- --grep "integration"

# Run tests in CI mode
pnpm run test:ci
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=junit",
    "test:integration": "vitest run --grep integration",
    "test:unit": "vitest run --grep -v integration"
  }
}
```

## Continuous Integration

### GitHub Actions Integration

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 9
          
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run unit tests
        run: pnpm run test:unit
        
      - name: Run integration tests
        run: pnpm run test:integration
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Performance Testing

### Load Testing Strategy

1. **API Performance**: Response time and throughput testing
2. **Database Performance**: Query optimization validation
3. **Frontend Performance**: Bundle size and runtime performance
4. **Memory Usage**: Memory leak detection

#### API Load Testing Example

```typescript
// test/performance/api-load.test.ts
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('API Performance', () => {
  it('should handle concurrent user creation requests', async () => {
    const concurrent = 10;
    const startTime = performance.now();
    
    const promises = Array.from({ length: concurrent }, async (_, i) => {
      return app.request('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `user${i}@example.com`,
          name: `User ${i}`,
        }),
      });
    });
    
    const responses = await Promise.all(promises);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(201);
    });
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(2000); // 2 seconds
  });
});
```

## Quality Metrics

### Coverage Targets

- **Unit Tests**: 80%+ line coverage
- **Integration Tests**: 70%+ critical path coverage  
- **E2E Tests**: 100% critical user journey coverage

### Test Quality Indicators

1. **Test Speed**: Unit tests < 10ms, Integration tests < 1s
2. **Test Stability**: < 1% flaky test rate
3. **Coverage Trends**: Maintain or improve coverage over time
4. **Test Maintenance**: Tests updated with feature changes

## Best Practices

### Writing Effective Tests

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Single Responsibility**: One assertion per test when possible
3. **Descriptive Names**: Test names should describe expected behavior
4. **Independent Tests**: No dependencies between tests
5. **Realistic Scenarios**: Test real-world usage patterns

### Test Maintenance

1. **Regular Review**: Periodically review and clean up tests
2. **Refactor with Code**: Update tests when refactoring code
3. **Remove Obsolete Tests**: Delete tests for removed features
4. **Document Complex Tests**: Add comments for non-obvious test logic

### Common Anti-Patterns to Avoid

1. **Testing Implementation Details**: Focus on behavior, not internals
2. **Overly Complex Tests**: Keep tests simple and focused
3. **Shared Test State**: Avoid dependencies between tests
4. **Testing Third-Party Code**: Don't test external library behavior
5. **Ignoring Test Failures**: Fix or remove consistently failing tests

## Future Enhancements

### Planned Improvements

1. **Visual Regression Testing**: Implement screenshot comparison testing
2. **Mutation Testing**: Add mutation testing to validate test effectiveness
3. **Property-Based Testing**: Explore property-based testing for complex logic
4. **Performance Regression Testing**: Automated performance baseline testing
5. **Accessibility Testing**: Automated a11y testing integration

---

This testing strategy provides a comprehensive foundation for maintaining code quality and reliability across the Hyperbaric monorepo while supporting rapid development and deployment cycles.