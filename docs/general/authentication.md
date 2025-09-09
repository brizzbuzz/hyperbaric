# Authentication

This document outlines the planned authentication strategy for the Hyperbaric monorepo.

## Overview

We plan to use [Better Auth](https://www.better-auth.com/) as our primary authentication solution. Better Auth is included as a dependency in the Chronicler project and will provide a secure, flexible, and developer-friendly authentication system across all applications.

## Authentication Strategy

### Design Principles

1. **Unified Authentication**: Single authentication system across all apps
2. **Session-Based Security**: Secure session management with HTTP-only cookies
3. **Extensibility**: Plugin architecture for adding authentication methods
4. **Type Safety**: Full TypeScript support throughout the auth flow
5. **Security First**: Built-in protection against common vulnerabilities

### Authentication Flow

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client    │    │  Better Auth    │    │   Database      │
│             │    │   Middleware    │    │                 │
│             │    │                 │    │                 │
│ 1. Login    │───▶│ 2. Validate     │───▶│ 3. User Lookup  │
│             │    │                 │    │                 │
│ 6. Response │◀───│ 5. Create       │◀───│ 4. Session      │
│             │    │    Session      │    │    Storage      │
└─────────────┘    └─────────────────┘    └─────────────────┘
```

## Implementation Details

### Better Auth Configuration

Each application includes Better Auth configuration in their server setup:

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgres://user:password@localhost:5432/database?options=-c%20search_path%3Dauth%2Cpublic",
});

pool.on("connect", async (client) => {
  try {
    // Create the auth schema if it doesn't exist
    await client.query("CREATE SCHEMA IF NOT EXISTS auth");
  } catch (error) {
    console.error("Error setting up database schema:", error);
    throw error;
  }
});

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

### Client-Side Integration

Applications use Better Auth's React integration for client-side authentication:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001", // Server port varies by app
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Usage in components
const { data: session, isPending } = useSession()
```

## Authentication Methods

### Primary Methods

#### Email & Password
- **Status**: Enabled by default
- **Features**: 
  - Email verification required
  - Password reset functionality
  - Secure password hashing (Argon2)
- **Use Case**: Planned primary authentication method for all applications

#### Session Management
- **Type**: HTTP-only cookies
- **Duration**: 7 days (configurable per application)
- **Security**: CSRF protection, secure flags, SameSite attributes
- **Cross-domain**: Configured for subdomain sharing when needed

### Future Authentication Methods

Additional authentication methods planned for future implementation:

#### OAuth Providers
- **Google**: For Chronicler (RSS feed management)
- **GitHub**: For Portfolio (showcasing development work)
- **LinkedIn**: For professional networking features

#### Two-Factor Authentication
- **TOTP**: Time-based one-time passwords
- **SMS**: Text message verification (country-specific)
- **Email**: Backup verification method

## Security Features

### Built-in Protection

#### CSRF Protection
```typescript
// Will be automatically enabled with Better Auth
// No additional configuration required
```

#### Rate Limiting
```typescript
// Authentication attempts will be rate-limited by default
// Configurable per endpoint and user
```

#### Session Security
- HTTP-only cookies prevent XSS attacks
- Secure flag ensures HTTPS-only transmission
- SameSite attribute prevents CSRF attacks
- Automatic session rotation for security

### Password Security

#### Hashing
- **Algorithm**: Argon2id (industry standard)
- **Salt**: Unique per password
- **Iterations**: Automatically tuned for performance/security balance

#### Password Requirements
- Minimum 8 characters
- Complexity requirements (configurable per app)
- Common password detection
- Breach database checking (HaveIBeenPwned integration)

## Per-Application Configuration

### Null Horizon (Financial Tool)
- **Enhanced Security**: Will implement extended session timeout controls
- **Audit Logging**: Plan to log all authentication events
- **MFA Ready**: Architecture prepared for two-factor authentication
- **Privacy Controls**: Will implement GDPR-compliant data handling

### Chronicler (RSS Reader)
- **Social Integration**: Will be OAuth ready for feed sharing
- **Quick Access**: Remember device functionality
- **Offline Support**: Token refresh for offline reading
- **Import Features**: Account data portability

### Portfolio (Personal Site)
- **Admin Access**: Single admin account management
- **Public/Private**: Content visibility controls
- **Analytics Integration**: View tracking for logged-in users
- **CMS Access**: Content management authentication

### Database Configuration

#### PostgreSQL Setup
Both Null Horizon and Chronicler use PostgreSQL with dedicated databases:
- Null Horizon: `null_horizon` database
- Chronicler: `chronicler` database

Each database uses an `auth` schema for Better Auth tables, with the connection configured to search both `auth` and `public` schemas.

#### Schema Creation
Better Auth automatically creates the necessary tables in the `auth` schema when the server starts. The schema is created automatically if it doesn't exist:

```sql
CREATE SCHEMA IF NOT EXISTS auth;
```

Better Auth handles all table creation and migrations automatically.

### Environment Variables

### Required Configuration
```env
# Authentication
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"

# Database is configured directly in auth.ts with connection strings
# Null Horizon: postgres://user:password@localhost:5432/null_horizon
# Chronicler: postgres://user:password@localhost:5432/chronicler
```

### Port Configuration
Each application runs on different ports:
- Null Horizon Client: `http://localhost:3000`
- Null Horizon Server: `http://localhost:3001` 
- Chronicler Client: `http://localhost:3002`
- Chronicler Server: `http://localhost:3003`

### Security Considerations
- Use strong, randomly generated secrets
- Rotate secrets regularly in production
- Store sensitive values in secure secret management
- Never commit secrets to version control

## API Endpoints

### Authentication Routes
```
POST /api/auth/sign-up        # User registration
POST /api/auth/sign-in        # User login
POST /api/auth/sign-out       # User logout
GET  /api/auth/session        # Get current session
POST /api/auth/verify-email   # Email verification
POST /api/auth/forgot-password # Password reset request
POST /api/auth/reset-password  # Password reset completion
```

### Protected Routes
```typescript
// Middleware usage
app.use('/api/protected/*', authMiddleware)

// Route-level protection
app.get('/api/user/profile', requireAuth, handleProfile)
```

## Client-Side Usage

### React Hooks
```typescript
import { useSession, signIn, signUp, signOut } from './lib/auth'

// Session management
const { data: session, isPending, error } = useSession()

// Authentication actions are imported directly
// signIn, signUp, signOut

// Protected routes
const ProtectedComponent = () => {
  const { data: session } = useSession()
  
  if (!session) {
    return <LoginForm />
  }
  
  return <DashboardContent />
}
```

### Route Protection
```typescript
// Higher-order component for route protection
const withAuth = (Component: React.ComponentType) => {
  return (props: any) => {
    const { data: session, isPending } = useSession()
    
    if (isPending) return <LoadingSpinner />
    if (!session) return <Navigate to="/login" />
    
    return <Component {...props} />
  }
}
```

## Error Handling

### Common Error Types
- `INVALID_CREDENTIALS`: Wrong email/password combination
- `EMAIL_NOT_VERIFIED`: User needs to verify email
- `RATE_LIMITED`: Too many authentication attempts
- `SESSION_EXPIRED`: User session has expired
- `ACCOUNT_LOCKED`: Account temporarily locked due to security

### Error Response Format
```typescript
interface AuthError {
  code: string
  message: string
  details?: Record<string, any>
}
```

## Testing Authentication

### Unit Tests
```typescript
// Mock authentication for component testing
const mockAuth = {
  session: { user: { id: '1', email: 'test@example.com' } },
  isAuthenticated: true
}

// Test protected components
render(<ProtectedComponent />, {
  wrapper: ({ children }) => (
    <AuthProvider value={mockAuth}>
      {children}
    </AuthProvider>
  )
})
```

### Integration Tests
```typescript
// Test authentication flow
describe('Authentication Flow', () => {
  test('successful login redirects to dashboard', async () => {
    await signIn({ email: 'user@example.com', password: 'password' })
    expect(window.location.pathname).toBe('/dashboard')
  })
})
```

## Monitoring & Analytics

### Authentication Metrics
- Login success/failure rates
- Session duration analytics
- Popular authentication methods
- Failed login attempt patterns
- Password reset frequency

### Security Monitoring
- Unusual login patterns detection
- Geographic location analysis
- Device fingerprinting
- Suspicious activity alerts
- Brute force attempt detection

## Troubleshooting

### Common Issues

#### Session Not Persisting
1. Check cookie configuration (domain, secure flags)
2. Verify HTTPS in production
3. Confirm SameSite attribute settings

#### Email Verification Not Working
1. Check SMTP configuration
2. Verify email templates
3. Check spam/junk folders
4. Validate email address format

#### Cross-Origin Issues
1. Configure CORS properly
2. Set appropriate cookie domains
3. Verify API base URLs

### Debug Tools
- Better Auth provides debug logging in development
- Session inspection tools in browser dev tools
- Server-side authentication logs
- Database session query tools

## Migration & Updates

### Version Updates
- Follow Better Auth changelog for breaking changes
- Test authentication flow after updates
- Update client-side dependencies accordingly
- Review security patches and apply promptly

### Data Migration
- User data migration scripts when needed
- Session cleanup and optimization
- Account merging utilities
- Backup and restore procedures

---

This authentication system provides a secure, scalable foundation for all applications in the Hyperbaric monorepo while maintaining flexibility for future enhancements and integrations.