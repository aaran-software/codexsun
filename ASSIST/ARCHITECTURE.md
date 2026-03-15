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

## Sales Commerce Module Update (2026-03-14)

- `cxserver/Modules/Sales` now groups cart, orders, invoices, payments, vendor earnings, and vendor payouts into one transaction-focused module while still exposing separate REST controllers for each workflow.
- The sales module reuses existing Common and Finance masters instead of duplicating them: `Currency`, `Warehouse`, `Contact`, `Product`, `ProductVariant`, and `PaymentMode` remain the source of truth for shared references.
- Order creation is checkout-driven from the cart, automatically creates an invoice, calculates line tax from existing GST percentages, and generates vendor earnings for vendor-owned order items using the current Auth user model for isolation.
- `cxstore` integrates the module through `salesApi`, storefront cart and checkout pages, and shared admin/vendor Sales pages under the existing route structure instead of introducing the prompt's nonexistent `src/modules` directory.

## Inventory Module Update (2026-03-15)

- `cxserver/Modules/Inventory` adds warehouse operations without changing the modular-monolith structure: entities, EF configurations, DTOs, service logic, and controllers all follow the existing `Modules/<ModuleName>` convention.
- The module reuses `Warehouse` from `Common`, `Product` and `ProductVariant` from `Products`, and `User` plus `AuditLog` from `Auth`; current stock snapshots continue to live in the existing `product_inventory` table rather than in a new duplicate warehouse-stock table.
- The new backend APIs cover purchase orders, purchase receiving, warehouse transfers, inventory adjustments, warehouse inventory summaries, product inventory summaries, and stock movement history.
- `cxstore` integrates the module through `src/api/inventoryApi.ts`, `src/types/inventory.ts`, four admin inventory pages, and admin sidebar wiring under the existing `AppLayout`.

## Multi-Channel Product Pricing Update (2026-03-15)

- The existing `Modules/Products` and `Modules/Sales` architecture was preserved; multi-channel pricing was implemented by extending the existing `product_prices` table and request/response contracts rather than introducing separate retail or wholesale catalog tables.
- `ProductService` now enforces a mandatory retail price row, normalizes supported price types and sales channels, and persists quantity-based and date-ranged price rows on the existing product aggregate.
- `SalesService` now resolves unit price from `product_prices` in priority order: active offer, wholesale threshold, vendor-context price, then retail, with the legacy vendor-link price retained as a backward-compatible fallback.
- `cxstore/src/components/admin/products/ProductForm.tsx` was extended in place so product admins can manage multiple price rows with type, channel, quantity, and seasonal date windows without changing the existing page structure.

## Vendor Company And Warehouse Ownership Update (2026-03-15)

- `cxserver/Modules/Vendors` remains the business layer above vendor users, but the shared `Warehouse` master in `Modules/Common` now carries an optional `VendorId` ownership link instead of introducing a separate vendor-warehouse table.
- Vendor-company membership is resolved through `vendor_users`, allowing multiple vendor staff users to share the same warehouse, product, purchasing, and inventory visibility boundary.
- `InventoryService` now enforces warehouse ownership for vendor users on purchase orders, transfers, warehouse inventory views, product inventory summaries, and stock movement history, while admins and staff continue to see the full operational dataset.
- `ContactService` now treats vendor-company membership as an additive access scope, so vendor staff users can work with contacts assigned to other users in the same vendor business without changing existing `vendor_user_id` references.
- `VendorService` exposes a vendor-scoped warehouse discovery endpoint consumed by the frontend, and `cxstore` now includes vendor warehouse and vendor inventory routes under the existing `AppLayout` instead of introducing a new frontend architecture.

## Enterprise Modules Update (2026-03-15)

- The existing `Inventory` module remains the active warehouse-operations implementation; this phase did not replace or restructure it.
- `cxserver/Modules/Analytics` was added for vendor and product sales summaries plus aggregate sales-overview reporting, with summary snapshots stored in dedicated analytics tables.
- `cxserver/Modules/Promotions` was added for promotions, coupon validation, coupon application, and coupon-usage tracking against live orders.
- `cxserver/Modules/Shipping` was added for shipping providers, shipping methods, shipments, and shipment-item tracking, with seeded baseline delivery methods for admin workflows.
- The previously scaffolded `cxserver/Modules/AfterSales` module is now active in the runtime through registered DbSets, services, controllers, and migrations, enabling returns, approvals, refunds, and optional warehouse restocking.
- `cxstore` now includes admin pages and typed API clients for analytics, promotions, shipping, and returns under the existing `AppLayout` and sidebar grouping model.

## Notification System Update (2026-03-15)

- `cxserver/Modules/Notifications` adds a centralized notification layer using the existing modular-monolith pattern: entities, EF configurations, DTOs, providers, services, controllers, and a hosted background worker.
- Notification delivery is template-driven through `notification_templates`, queue-backed through `notifications`, and operationally traceable through `notification_logs`.
- The backend keeps channel dispatch behind `INotificationProvider` implementations for `Email`, `SMS`, and `WhatsApp`, while `InApp` notifications are stored and marked sent inside the same queue flow.
- `NotificationQueueProcessor` runs as a hosted background worker and processes pending notifications in configurable batches stored through existing `system_settings`.
- Existing domain services now enqueue notifications for user registration, password update/reset, order creation, payment success, shipment shipped, shipment delivered, return approval, vendor payout creation, and low-inventory alerts.
- `cxstore` integrates the module with `notificationApi.ts`, `types/notification.ts`, and admin pages for templates, logs, and settings under the existing route and sidebar structure.
