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
