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

## Common Master Data Schema

The `CommonMasterData` migration creates reusable master tables, and the `RenameCommonTables` migration normalizes them to direct snake_case entity names without a `common_` prefix.

Naming rule:

- Common master tables must not use the `common_` prefix.

Current Common master tables:

- `countries`
- `states`
- `districts`
- `cities`
- `pincodes`
- `contact_types`
- `product_types`
- `product_groups`
- `hsn_codes`
- `units`
- `gst_percents`
- `colours`
- `sizes`
- `order_types`
- `styles`
- `brands`
- `transports`
- `destinations`
- `currencies`
- `warehouses`
- `payment_terms`

All Common tables use integer identities plus `IsActive`, `CreatedAt`, and `UpdatedAt`.

## Common Indexes

Representative indexes and uniqueness rules:

- `countries.Name` unique
- `states(CountryId, Name)` unique
- `states(CountryId, StateCode)` unique
- `districts(StateId, Name)` unique
- `cities(DistrictId, Name)` unique
- `pincodes.Code` unique
- `hsn_codes.Code` unique
- `units.Name` unique
- `units.ShortName` unique
- `gst_percents.Percentage` unique
- `destinations(Name, CountryId, CityId)` unique
- `currencies.Name` unique
- `currencies.Code` unique
- `payment_terms.Name` unique

Search-oriented indexes are also present on common master names and active flags to support autocomplete-style queries.

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

Common master seeds:

- Countries: `India`, `United States`
- States: `Tamil Nadu`, `Karnataka`, `California`
- Contact types: `Customer`, `Vendor`, `Supplier`, `Employee`
- GST percentages: `0`, `5`, `12`, `18`, `28`
- Units: `Nos`, `Kg`, `Mtr`

Dynamic SQL from user input is forbidden.
