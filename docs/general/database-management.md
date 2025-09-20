# Database Management

Our database management approach uses Atlas for declarative schema management and PostgreSQL across all projects.

## Key Tools

- **[Atlas](https://atlasgo.io/)**: Schema migration and management tool
- **Better Auth**: Authentication system with automatic table generation
- **PostgreSQL**: Primary database for all applications

## Core Concepts

- **Declarative Schema Management**: Define desired schema state, Atlas handles migrations
- **Schema Registry**: Centralized versioning via `atlas schema push --env {{env}}`
- **Environment-Specific Configs**: Separate dev/prod configurations

## Atlas Configuration

Each project that requires a database includes an `atlas.hcl` configuration file in its server directory. This file defines environments, connection strings, and schema sources.

### Configuration Structure

```hcl
env "dev" {
  url = "postgres://username:password@localhost:5432/database_name?sslmode=disable"
  dev = "docker://postgres/17/dev"

  schema {
    src = "file://schemas"
    # Atlas Registry config
    repo {
      name = "project-name"
    }
  }
  schemas = ["auth", "asset", "public"]
}

env "prod" {
  url = env("DATABASE_URL")
  schema {
    src = "file://schemas"
    repo {
      name = "project-name"
    }
  }
  schemas = ["auth", "asset", "public"]
}
```

### Environment Variables

- **Development**: Connection strings are defined directly in the configuration
- **Production**: Uses `DATABASE_URL` environment variable for security
- **Schema Registry**: Each project has its own named repository in Atlas Registry

## Schema Management

### Directory Structure

Each project with database requirements follows this structure:

```
apps/project-name/server/
├── atlas.hcl              # Atlas configuration
└── schemas/               # Schema definitions
    ├── auth.sql          # Better Auth tables
    ├── public.sql        # Default schema
    └── [domain].sql      # Domain-specific schemas
```

### Schema Organization

We organize database schemas by domain:

- **`auth`**: Authentication-related tables (managed by Better Auth)
- **`public`**: Default PostgreSQL schema for general tables
- **Domain-specific schemas**: Business logic tables grouped by domain (e.g., `asset`, `portfolio`, `feed`)

### Schema Files

Each `.sql` file in the `schemas/` directory represents a complete schema definition:

```sql
CREATE SCHEMA IF NOT EXISTS domain_name;

-- Table definitions
CREATE TABLE domain_name.table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- other columns
);

-- Indexes
CREATE INDEX idx_table_name_column ON domain_name.table_name(column);

-- Triggers and functions
CREATE OR REPLACE FUNCTION domain_name.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_table_name_updated_at
  BEFORE UPDATE ON domain_name.table_name
  FOR EACH ROW
  EXECUTE FUNCTION domain_name.update_updated_at_column();
```

## Migration Workflow

### 1. Development Workflow

```bash
# 1. Make changes to schema files in schemas/
# 2. Generate migration (Atlas compares current state with desired state)
atlas migrate diff --env dev --name "descriptive_migration_name"

# 3. Review generated migration files
# 4. Apply migration
atlas migrate apply --env dev

# 5. Check migration status
atlas migrate status --env dev
```

### 2. Schema Registry Integration

Push schema changes to the registry for team collaboration:

```bash
# Push current schema to registry
atlas schema push --env dev

# Apply schema from registry
atlas schema apply --env dev
```

### 3. Production Deployment

```bash
# 1. Push schema to registry from development
atlas schema push --env dev

# 2. Apply schema in production
atlas schema apply --env prod
```

## Better Auth Integration

Better Auth automatically generates SQL for authentication tables, but we manage them declaratively through Atlas.

### Generating Auth Schema

1. **Generate Better Auth SQL**:
   ```bash
   bunx @better-auth/cli generate
   ```

2. **Manual Integration Process**:
   - Copy the generated SQL output
   - Paste into `schemas/auth.sql`
   - **Important**: Edit the SQL to ensure all tables are created in the `auth` schema
   - Wrap table and column names in double quotes for PostgreSQL compatibility

### Auth Schema Structure

The `auth.sql` file should always start with:

```sql
CREATE SCHEMA IF NOT EXISTS auth;
```

Then include all Better Auth tables with proper schema qualification:

```sql
create table auth."user" (
  "id" text not null primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  -- ... other columns
);

create table auth."session" (
  "id" text not null primary key,
  "expiresAt" timestamptz not null,
  "userId" text not null references auth."user" ("id") on delete cascade,
  -- ... other columns
);

-- Additional auth tables...
```

### Integration Notes

The manual process is necessary because:

1. Better Auth generates unqualified SQL that needs `auth` schema prefixes
2. PostgreSQL requires proper quoting for mixed-case identifiers
3. Atlas needs complete declarative schema files

## Environment Setup

### Development Environment

1. **Start PostgreSQL** (via Docker Compose):
   ```bash
   docker-compose up -d postgres
   ```

2. **Initialize Database**:
   ```bash
   # Create database if it doesn't exist
   createdb -h localhost -U hyperbaric_admin null_horizon
   
   # Apply schema
   atlas schema apply --env dev
   ```

### Package.json Scripts

Each server package includes these Atlas commands:

```json
{
  "scripts": {
    "migrate:diff": "atlas migrate diff --env dev",
    "migrate:apply": "atlas migrate apply --env dev",
    "migrate:status": "atlas migrate status --env dev",
    "schema:inspect": "atlas schema inspect --env dev",
    "schema:push": "atlas schema push --env dev",
    "schema:apply": "atlas schema apply --env dev"
  }
}
```

## Common Commands

### Schema Operations

```bash
# Push schema to registry
atlas schema push --env {{env}}

# Apply schema from registry
atlas schema apply --env {{env}}

# Inspect current database schema
atlas schema inspect --env {{env}}

# Compare local schema with database
atlas schema diff --env {{env}}
```

### Migration Operations

```bash
# Generate new migration
atlas migrate diff --env {{env}} --name "migration_name"

# Apply pending migrations
atlas migrate apply --env {{env}}

# Check migration status
atlas migrate status --env {{env}}

# Validate migrations
atlas migrate validate --env {{env}}
```

### Registry Operations

```bash
# List schema versions in registry
atlas registry schema list --repo project-name

# Show specific schema version
atlas registry schema show --repo project-name --version {{version}}
```

## Best Practices

### Schema Design

- Group related tables into logical schemas
- Include `created_at` and `updated_at` timestamps
- Use UUIDs for primary keys
- Index foreign keys and commonly queried columns
- Add update triggers for `updated_at` columns

### Migration Management

- Use descriptive migration names
- Review generated migrations before applying
- Test thoroughly in development
- Backup production databases before migrations

### Schema Registry

- Push changes to registry after local success
- Use registry for team collaboration
- Treat schema versions as documented releases

## Troubleshooting

### Common Issues

**Atlas Connection Errors**
- Verify database is running: `docker-compose ps postgres`
- Check connection string in `atlas.hcl`
- Ensure database exists: `createdb -h localhost -U hyperbaric_admin database_name`

**Schema Drift**
```bash
atlas schema inspect --env dev    # Check current state
atlas schema diff --env dev       # Compare with files
atlas schema apply --env dev      # Apply changes
```

**Auth Schema Issues**
1. Regenerate: `bunx @better-auth/cli generate`
2. Edit to include `auth.` schema prefix and proper quoting
3. Apply: `atlas schema apply --env dev`

---

## Related Documentation

- [Authentication](./authentication.md) - Better Auth configuration and usage
- [Environment Setup](./getting-started.md) - Development environment configuration
- [Project-Specific Guides](../projects/) - Individual project database configurations

*Last updated: December 2024*