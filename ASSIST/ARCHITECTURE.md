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

## Media Library Update (2026-03-15)

- `cxserver/Modules/Media` adds a centralized media library under the existing modular-monolith pattern with entities, EF configurations, DTOs, services, and controllers only; storage providers stay behind a service abstraction without changing the module folder convention.
- The module persists folder hierarchy, uploaded file metadata, soft-delete state, checksum hashes, and cross-module usage references through `media_folders`, `media_files`, and `media_usage`.
- `LocalFileStorageProvider` is the initial file backend and stores content under `uploads/media`, uses GUID-based safe file names, preserves the original file name separately, and generates thumbnail, medium, and large derivatives for supported raster images.
- The backend now serves `/uploads` as static content, validates upload size, extension, and MIME type, and records media upload, delete, restore, and folder-create actions through the existing audit-log model.
- `cxstore` integrates the module with `mediaApi.ts`, `types/media.ts`, `pages/admin/media/MediaLibraryPage.tsx`, and a reusable `components/media/MediaPicker.tsx` that is already wired into product image rows and vendor logo management.

## Company And Application Settings Update (2026-03-15)

- `cxserver/Modules/Company` adds a centralized platform-configuration layer for display name, legal and billing identity, support contacts, tax fields, branding media, billing address, and global key-value settings without changing the existing modular structure.
- The module persists company profile data in `companies`, billing/location data in `company_addresses`, and cross-cutting configuration values such as order and invoice prefixes in `company_settings`.
- Branding assets are linked through `logo_media_id` and `favicon_media_id` into the existing Media module, which keeps company visuals inside the same managed media lifecycle as other platform assets.
- `CompanyService` provides public profile retrieval plus admin-only update flows and acts as the runtime source for frontend branding instead of the previous hardcoded frontend company constants.
- `cxstore` now uses a shared company provider backed by `companyApi.ts` so layouts, loaders, login branding, contact shortcuts, sidebar branding, and the new admin settings page all consume runtime company data from the backend.

## Monitoring And Audit Update (2026-03-15)

- `cxserver/Modules/Monitoring` adds centralized monitoring using the existing repository pattern: entities, EF configurations, DTOs, services, controllers, and middleware instead of a separate backend architecture tree.
- The implementation extends the existing `audit_logs` table rather than duplicating it, and adds dedicated `system_logs`, `error_logs`, and `login_history` tables for platform diagnostics and security tracking.
- `ErrorLoggingMiddleware` captures unhandled exceptions globally, while `AuditMiddleware` records successful mutating HTTP requests with request metadata and payload snapshots.
- `AuthService` now records login success, login failure, blocked attempts, and logout events into `login_history`, and emits monitoring-oriented system logs for suspicious IP activity and admin permission changes.
- `cxstore` integrates monitoring through `monitoringApi.ts`, `types/monitoring.ts`, and four admin pages under `pages/admin/monitoring`, all wired into the existing `AppLayout` and sidebar grouping model.

## Storefront Frontend Update (2026-03-15)

- The customer storefront was implemented inside the existing `cxstore` application instead of creating a second `/frontend` project, preserving the current monorepo and route architecture.
- `WebLayout` now hosts a richer commerce shell through `MainLayout`, `storefront-header`, `storefront-footer`, `navbar`, `storefront-mobile-menu`, and `storefront-bottom-nav`, while `AppLayout` remains the authenticated admin or vendor workspace.
- The storefront data layer adds `api/apiClient.ts` for Axios-based customer requests, `lib/queryClient.ts` for React Query caching, and Zustand-based `cartStore` and `wishlistStore` for local customer state.
- Public route pages now cover home, category browsing, search, product details, vendor stores, cart, wishlist, checkout, order success, and customer account views, all implemented under the existing `cxstore/src/pages` structure.
- The initial storefront implementation adapted to the existing backend API surface, and wishlist plus review persistence still remain frontend-managed until dedicated customer APIs are added.

## Go-Live Storefront API Hardening (2026-03-16)

- `cxserver` now exposes additive anonymous storefront endpoints through `Modules/Products/Controllers/StorefrontCatalogController.cs` and `Modules/Vendors/Controllers/StorefrontVendorsController.cs` instead of weakening the existing secured admin or vendor APIs.
- Public catalog browsing is now served from dedicated `/storefront/products`, `/storefront/products/{slug}`, `/storefront/categories`, and `/storefront/vendors` endpoints backed by published and active product filtering in `ProductService` and active-vendor filtering in `VendorService`.
- `cxstore` storefront pages for home, category browsing, search, product detail, and vendor stores now consume the public storefront endpoints through `productApi.ts` and `vendorApi.ts`, removing the previous dependency on authenticated discovery APIs for anonymous browsing.

## Storefront Engagement Update (2026-03-16)

- `cxserver/Modules/Storefront` now owns persistent customer wishlist and product-review behavior without changing the modular-monolith structure used by the rest of the backend.
- Wishlist persistence is customer-authenticated through `/wishlist`, while product reviews are split between anonymous public reads at `/storefront/products/{productId}/reviews` and customer-authenticated writes at `/reviews`.
- Product list and detail responses now include backend `averageRating` and `reviewCount` values, so storefront cards, vendor-store summaries, and product pages no longer infer engagement metrics from browser-local storage.

## Checkout Resilience Update (2026-03-16)

- `cxserver/Modules/Sales` now persists checkout idempotency keys plus the selected shipping and payment methods directly on the `orders` aggregate.
- Order placement now writes explicit `order_inventory_reservations` records instead of only inferring reserved stock from aggregate counters, which makes later cancellation and refund release flows deterministic.
- The current reservation flow first uses available `product_inventory` rows and falls back to vendor-link inventory when warehouse-backed stock is unavailable for that item.
- Payment recording now rejects duplicate provider-reference submissions, prevents overpayment, and automatically promotes a fully paid pending order to `Confirmed`.
- `cxstore/src/pages/CheckoutPage.tsx` now sends a generated idempotency key with the selected shipping and payment options so browser refresh or repeated clicks do not create duplicate orders.

## Razorpay Payment Integration Update (2026-03-16)

- The production payment path now stays inside `cxserver/Modules/Sales`; no separate payment module was introduced.
- `RazorpayGatewayService` creates Razorpay Orders through the official Orders API, verifies checkout signatures server-side, fetches payment details for confirmation, and validates webhook signatures against the raw request body.
- `RazorpayPaymentsController` exposes three focused endpoints: authenticated checkout initialization, authenticated storefront verification, and an anonymous Razorpay webhook callback.
- Storefront online payments now use a single hosted provider option, `Razorpay`, which includes UPI inside the same checkout experience. Cash on Delivery remains the second customer-facing option.
- Webhook and storefront verification both reconcile through the existing Sales payment write path, so invoices, orders, payment summaries, audit logging, and notifications remain in one aggregate flow.

## Razorpay Retry And Expiry Update (2026-03-16)

- `Modules/Sales` now applies a payment-expiry policy to unpaid Razorpay orders through `SalesSettings.PendingPaymentExpiryMinutes` without introducing a scheduler-specific module or background queue dependency.
- Stale unpaid Razorpay orders are marked `Expired`, their inventory reservations are released, and the order timeline records the expiry reason before the storefront or order APIs return those orders.
- Storefront retry remains additive: customer account order history can reopen Razorpay Checkout for still-payable orders through the same backend initialization and verification endpoints already used by checkout.

## Payment Reconciliation And Shipping Automation Update (2026-03-16)

- `RazorpayGatewayService` now supports order-payment lookup, allowing the backend to reconcile a local unpaid order against Razorpay even when a webhook is delayed or missed.
- `RazorpayPaymentsController` now exposes an authenticated reconciliation endpoint that uses the existing Sales payment write path, so repaired orders still flow through the same invoice, order-status, notification, and audit logic.
- `ShippingService` now supports auto-creating a shipment from a paid or confirmed order using the order's selected shipping method and full order-item quantities.
- Successful payment completion now provisions a fulfillment shipment record automatically through the existing Shipping module instead of leaving paid orders waiting for manual shipment data entry.

## Customer Shipment Visibility Update (2026-03-16)

- The Shipping module now applies role-aware shipment visibility so customer shipment queries return only the signed-in customer's orders, vendor shipment queries stay vendor-scoped, and admin or staff still see the full shipment dataset.
- `ShipmentsController` now exposes `GET /shipments/order/{orderId}` for per-order shipment retrieval under the existing authenticated API surface.
- `cxstore` storefront account and order-success views now consume shipment data directly so customers can see tracking numbers, provider names, and shipment status without leaving the storefront flow.

## Storefront Customer Address Update (2026-03-17)

- `cxserver/Modules/Storefront` now also owns persistent customer address-book data through the new `customer_addresses` table and authenticated `/storefront/addresses` endpoints.
- Checkout address capture no longer depends on browser-local storage; signed-in storefront customers now reuse and update backend-backed addresses from checkout and account pages.
- `cxstore/src/pages/AccountPage.tsx` now provides a lightweight customer address-book editor while `CheckoutPage.tsx` hydrates from the default saved address when available.

## Commerce Notification Coverage Validation (2026-03-17)

- Commerce notification coverage is now protected by an integration test in `cxtest/NotificationsModuleTests.cs` that exercises the real order, payment, shipment, return, vendor-payout, and low-inventory workflows.
- The validated event set is: `ORDER_CREATED`, `PAYMENT_SUCCESS`, `SHIPMENT_SHIPPED`, `SHIPMENT_DELIVERED`, `RETURN_APPROVED`, `VENDOR_PAYOUT_CREATED`, and `LOW_INVENTORY_ALERT`.
- While adding that coverage, `SalesService.CreateOrderAsync` was corrected to attach product navigation data before invoice-line generation, and the Razorpay expiry query was corrected to use SQL-translatable predicates.
