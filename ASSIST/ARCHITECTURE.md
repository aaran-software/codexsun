# Codexsun - Architecture

## System Overview

Codexsun is a modular multi-vendor ecommerce platform with ERP-style shared master data, 
admin control, storefront access, and vendor-facing operations. The current implementation 
is organized as a monorepo with a .NET Aspire host, an ASP.NET Core backend, a React frontend, 
and shared domain libraries.

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| C# | 13 | Primary language |
| .NET | 10 | Runtime |
| ASP.NET Core | 10 | Web API framework |
| .NET Aspire | 10 | Orchestration and service defaults |
| Entity Framework Core | 10 | ORM for transactional writes and migrations |
| Dapper | Latest | Reporting and analytics queries |
| PostgreSQL | 17 | Current database target for CXCore and new platform work |
| FluentValidation | 12.1.1 | Input validation |
| Serilog | 10.0.0 | Structured logging |
| Asp.Versioning | 8.1.1 | API versioning |

### Frontend

| Technology | Purpose |
|------------|---------|
| React + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| shadcn-style components | UI primitives |
| Framer Motion | Shared loader animation |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| .NET Aspire | Local orchestration |
| Redis 7 | Caching |
| Docker | Containerization |
| GitHub Actions | CI/CD target |

## Solution Structure

```text
codexsun.slnx
|-- cx.AppHost   -> .NET Aspire host
|-- cxserver     -> Backend API
|-- cxstore      -> React frontend
`-- cxtest       -> Infrastructure validation tests
```

## Local Runtime Ports

| Service | Port |
|---------|------|
| Aspire host | 7020 |
| cxserver HTTP | 7021 |
| cxserver HTTPS | 7022 |
| cxstore | 7023 |
| Redis | 7024 |
| PostgreSQL | 7025 |

## Architecture Principles

1. Modular monorepo
2. API-first backend
3. Clean Architecture service flow
4. Strongly typed contracts
5. Vendor isolation by data ownership rules
6. Shared master-data foundation for cross-module reuse

## Middleware Pipeline

1. Error monitoring
2. Security headers
3. Global exception handler
4. Serilog request logging
5. Request context enrichment
6. HTTPS redirection outside development
7. CORS
8. Rate limiting
9. Authentication and authorization
10. Controllers and health endpoints

## Auth Architecture Update (2026-03-09)

- `cxserver/Modules/Auth` implements register, login, refresh-token rotation, and logout.
- JWT bearer authentication is configured in `Program.cs`.
- Portal-aware role checks are enforced for customer, vendor, and admin login paths.
- Frontend layouts are split between storefront, auth, and app/dashboard areas.

## Common Master Data Architecture Update (2026-03-14)

- `cxserver/Modules/Common` now provides reusable master-data APIs for location, contact, product, order, transport, and shared operational masters.
- The Common module uses integer identity keys, EF Core `IEntityTypeConfiguration` mappings, seed data, FluentValidation request validation, and admin-protected CRUD/search/activate/deactivate endpoints.
- Hierarchical address flows are supported through Country -> State -> District -> City -> Pincode with filterable list/search APIs for autocomplete-driven forms.
- Recommended shared masters were added for `Currency`, `Warehouse`, and `PaymentTerm` so future billing, logistics, and vendor workflows can consume the same backend datasets.

## Frontend Admin UX Update (2026-03-14)

- `cxstore` now centralizes admin list and popup workflows through `CommonList` and `CommonUpsertDialog`, with shared rounded input primitives, dim focus rings, and consistent status-badge rendering.
- The application uses a single app-level `GlobalLoader` fallback, while page and table fetches use in-place skeleton states to avoid multi-loader flicker.
- The app sidebar now treats grouped headers such as `Common` as in-place expand/collapse toggles instead of navigational links.
- Common master popup selects now provide shared autocomplete behavior, render option labels instead of IDs, and support inline option creation where the backing API can safely create related records.

## Shared Lookup Architecture Update (2026-03-14)

- `cxstore/src/components/lookups` now holds the reusable autocomplete primitive and common-master lookup wrappers instead of keeping create-capable select logic duplicated inside individual forms.
- `AutocompleteLookup` is the single UI behavior for filterable dropdowns, while `CommonMasterLookup`, `CountryLookup`, `StateLookup`, `DistrictLookup`, and `CityLookup` add common-module create rules and parent-context defaults.
- `CommonUpsertDialog`, `ContactForm`, and `ProductForm` now consume the same lookup pattern so popup forms and page forms stay behaviorally aligned.

## Contacts And Products Module Update (2026-03-14)

- `cxserver/Modules/Contacts` and `cxserver/Modules/Products` were added as transactional modules on top of the existing Auth and Common foundations instead of introducing a separate company or vendor domain.
- Vendor isolation is implemented with user ownership and optional `VendorUserId` scoping tied to the current Auth role model, allowing Admin to see everything while Vendor users only see their own contact and product data.
- Contacts reuse existing Common contact and location masters, while Products reuse Common catalog, pricing, and warehouse masters and add their own transactional tables for categories, variants, prices, images, inventory, vendor links, and attributes.
- `cxstore` integrates these modules through dedicated admin and vendor pages plus shared editor forms rather than a separate `src/modules` folder, which keeps the implementation aligned with the current frontend architecture.
