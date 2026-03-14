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

## Production Baseline

The database now uses a consolidated `ProductionBaseline` migration as the clean schema baseline for local and production-oriented deployments.

## Auth Schema

The baseline creates the security tables below in PostgreSQL:

- `users`
- `roles`
- `permissions`
- `role_permissions`
- `refresh_tokens`
- `audit_logs`

## Common Master Data Schema

The baseline creates reusable Common master tables directly with snake_case names and default `"-"` records where appropriate.

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
- `hsncodes`
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

The current frontend Common admin area is aligned only to these existing baseline-backed Common tables. It does not assume Prompt 013 tables that are not yet present in the live schema.

Additional baseline tables:

- `banks`
- `payment_modes`
- `ledger_groups`
- `transactions`
- `system_settings`
- `number_series`

All Common tables use integer identities plus `IsActive`, `CreatedAt`, and `UpdatedAt`.

## Common Indexes

Representative indexes and uniqueness rules:

- `countries.Name` unique
- `countries.CountryCode` unique
- `states(CountryId, Name)` unique
- `states(CountryId, StateCode)` unique
- `districts(StateId, Name)` unique
- `cities(DistrictId, Name)` unique
- `pincodes.Code` unique
- `hsncodes.Code` unique
- `units.Name` unique
- `units.ShortName` unique
- `gst_percents.Percentage` unique
- `destinations(Name, CountryId, CityId)` unique
- `currencies.Name` unique
- `currencies.Code` unique
- `payment_terms.Name` unique
- `banks.Name` unique
- `payment_modes.Name` unique
- `ledger_groups.Name` unique
- `transactions.ReferenceNo` unique
- `system_settings.Key` unique
- `number_series.Name` unique

Search-oriented indexes are also present on common master names and active flags to support autocomplete-style queries.

Frontend note:

- Shared popup autocomplete selects rely on the existing `/search` endpoints and the current uniqueness/foreign-key rules; no schema change was required for the inline create-and-select UX.

## Auth Indexes

Unique indexes:

- `users.Email`
- `users.Username`
- `roles.Name`
- `permissions.Code`

Additional indexes:

- `refresh_tokens.Token`
- `refresh_tokens(UserId, ExpiresAt)`
- `audit_logs.Action`
- `audit_logs.CreatedAt`

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
- `management@codexsun.com` mapped to role `Admin`
- `backoffice@codexsun.com` mapped to role `Staff`
- `storefront@codexsun.com` mapped to role `Customer`

Common master seeds:

- Countries: `- (-- )`, `India (IN)`, `United States (US)`
- States: `-`, all states and union territories of India, plus `California`
- Districts: `-`, all Tamil Nadu districts, plus major metro districts used by seeded cities
- Cities: `-`, major Tamil Nadu cities plus key Indian metros such as `Bengaluru`, `Mumbai`, `Delhi`, `Hyderabad`, `Kolkata`, and `Kochi`
- Pincodes: `-`, seeded known pincodes for the major seeded cities
- Contact types: `-`, `Customer`, `Vendor`, `Supplier`, `Employee`, `Distributor`, `Retailer`
- Product groups: `-`, `Apparel`, `Accessories`
- Product types: `-`, `T-Shirt`, `Shirt`, `Hoodie`, `Polo`
- HSN codes: `-`, plus seeded apparel/tee-shirt codes including `61091000`
- GST percentages: `0`, `5`, `12`, `18`, `28`
- Units: `-`, `PCS`, `KG`, `MTR`, `LTR`, `BOX`, `PAIR`
- Colours: `-`, `Black`, `White`, `Blue`, `Navy`, `Grey`, `Red`, `Maroon`, `Olive`, `Green`, `Yellow`
- Sizes: `-`, `Free Size`, `XS`, `S`, `M`, `L`, `XL`, `XXL`, `3XL`
- Brands: `-`, `Codexsun`, `Nike`, `Adidas`, `Puma`
- Transports: `-`, `Road Transport`, `Air Cargo`, `Courier`, `Self Pickup`
- Destinations: `-`, seeded hub destinations for `Chennai`, `Coimbatore`, `Bengaluru`, `Mumbai`, and `Delhi`
- Currencies: `-`, `INR`, `USD`
- Warehouses: `-`, seeded Chennai, Coimbatore, and Bengaluru warehouse records
- Payment terms: `-`, `Advance`, `Net 15`, `Net 30`, `Net 45`
- Banks: `-`, `State Bank of India`, `Bank of America`
- Payment modes: `-`, `Cash`, `Bank Transfer`, `Card`
- Ledger groups: `-`, `Sales`, `Purchases`, `Expenses`
- Number series: `-`, `Sales Order`

Dynamic SQL from user input is forbidden.
