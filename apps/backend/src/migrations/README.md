# Database Migrations

This directory contains SQL migration files for database schema management.

## Naming Convention

Migrations follow the pattern: `{number}_{description}.sql`

Example: `001_create_users_table.sql`

## Running Migrations

### Development

```bash
pnpm migrate:dev
```

### Production

```bash
pnpm migrate:prod
```

## Creating a New Migration

1. Create a new file in this directory with the next sequential number
2. Write your SQL statements (use idempotent commands like `CREATE TABLE IF NOT EXISTS`)
3. Run the migration script

## Migration Files

- `001_create_users_table.sql` - Creates the users table with email and password fields
