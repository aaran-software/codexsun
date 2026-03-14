# Codexsun - Database Strategy

## Engine

PostgreSQL

## Local Development Container

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `7025` |
| Database | `codexsun` |
| Username | `cxadmin` |
| Password | `DbPass1@@` |

Connection string:

`Host=localhost;Port=7025;Database=codexsun;Username=cxadmin;Password=DbPass1@@`

## Access Strategy

| Tool | Use Case |
|------|----------|
| EF Core | Entity persistence, transactional writes, migrations |
| Dapper | Analytics, reporting, dashboards, search |

## Auth Schema

The `IdentityAuthSystem` migration creates the security tables below in PostgreSQL:

- `auth_users`
- `auth_roles`
- `auth_permissions`
- `auth_role_permissions`
- `auth_refresh_tokens`
- `auth_audit_logs`

## Auth Indexes

Unique indexes:

- `auth_users.Email`
- `auth_users.Username`
- `auth_roles.Name`
- `auth_permissions.Code`

Additional indexes:

- `auth_refresh_tokens.Token`
- `auth_refresh_tokens(UserId, ExpiresAt)`
- `auth_audit_logs.Action`
- `auth_audit_logs.CreatedAt`

## Seed Data

Roles:

- `Admin`
- `Vendor`
- `Customer`
- `Staff`

Permissions:

- `User.Create`
- `User.Read`
- `User.Update`
- `User.Delete`

Bootstrap user:

- `sundar@sundar.com` mapped to role `Admin`

Dynamic SQL from user input is forbidden.
