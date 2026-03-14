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

The `CommonMasterData` migration creates reusable master tables:

- `common_countries`
- `common_states`
- `common_districts`
- `common_cities`
- `common_pincodes`
- `common_contact_types`
- `common_product_types`
- `common_product_groups`
- `common_hsn_codes`
- `common_units`
- `common_gst_percents`
- `common_colours`
- `common_sizes`
- `common_order_types`
- `common_styles`
- `common_brands`
- `common_transports`
- `common_destinations`
- `common_currencies`
- `common_warehouses`
- `common_payment_terms`

All Common tables use integer identities plus `IsActive`, `CreatedAt`, and `UpdatedAt`.

## Common Indexes

Representative indexes and uniqueness rules:

- `common_countries.Name` unique
- `common_states(CountryId, Name)` unique
- `common_states(CountryId, StateCode)` unique
- `common_districts(StateId, Name)` unique
- `common_cities(DistrictId, Name)` unique
- `common_pincodes.Code` unique
- `common_hsn_codes.Code` unique
- `common_units.Name` unique
- `common_units.ShortName` unique
- `common_gst_percents.Percentage` unique
- `common_destinations(Name, CountryId, CityId)` unique
- `common_currencies.Name` unique
- `common_currencies.Code` unique
- `common_payment_terms.Name` unique

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
