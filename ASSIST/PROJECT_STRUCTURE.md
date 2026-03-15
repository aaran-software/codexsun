# Project Architecture Overview

## Repository Shape

The repository does not use literal top-level folders named `backend`, `frontend`, `modules`, `shared`, `infrastructure`, or `database`. Their concrete equivalents in this codebase are:

- `cxserver` -> backend API, module implementations, EF Core model, migrations
- `cxstore` -> React frontend, layouts, routes, API clients, state, shared UI
- `cx.AppHost` -> Aspire orchestration for backend and frontend
- `.container` -> local PostgreSQL and Redis container infrastructure
- `cxtest` -> integration, security, and database connectivity tests
- `ASSIST` -> architecture, database, security, and task documentation

## Solution Structure

- `cx.AppHost/cx.AppHost.csproj` -> Aspire app host
- `cxserver/cxserver.csproj` -> ASP.NET Core backend on `.NET 10`
- `cxstore/cxstore.esproj` -> React 19 + Vite frontend
- `cxtest/cxtest.csproj` -> xUnit test project targeting the backend
- `codexsun.slnx` -> solution file including all four projects

## Architectural Style

- Backend: modular monolith inside a single ASP.NET Core host
- Persistence: EF Core with PostgreSQL
- Frontend: single React SPA with role-aware routing and reusable admin primitives
- Infrastructure: Aspire for local orchestration, Docker Compose for stateful dependencies
- Security: JWT bearer authentication, seeded role-permission model, policy-based authorization

# Backend Architecture

## Backend Project Structure

`cxserver` is organized around:

- `Program.cs` -> composition root, middleware, authentication, rate limiting, CORS, OpenAPI, EF migrations on startup
- `Extensions.cs` -> Aspire service defaults, health checks, service discovery, OpenTelemetry
- `Infrastructure/` -> `CodexsunDbContext`, seed wiring, design-time DbContext factory
- `Migrations/` -> EF Core schema history
- `Modules/` -> business modules

## Backend Module Pattern

Implemented modules follow a consistent folder pattern where applicable:

- `Entities/` -> domain and persistence entities
- `Configurations/` -> EF Core table mappings, keys, indexes, foreign keys, seed data
- `DTOs/` -> request and response contracts
- `Services/` -> application/service layer logic
- `Controllers/` -> HTTP API endpoints
- `Validators/` -> FluentValidation request validation where used
- `Policies/` and `Security/` -> auth-specific policy and token infrastructure

This is Clean Architecture influenced rather than fully separated into distinct projects. Domain, application, infrastructure, and API layers live inside module folders in one backend project.

## Backend Shared Libraries

There is no separate shared backend class library yet. Shared backend concerns are implemented in-place through:

- `cxserver/Infrastructure/CodexsunDbContext.cs`
- `cxserver/Extensions.cs`
- module base entity types such as `CommonMasterEntity`, `ContactEntity`, `ProductEntity`, `SalesEntity`, `FinanceEntity`, `SystemEntity`
- shared seed sources such as `AuthSeedData`, `LocationSeedData`, `ProductSeedData`, `OperationalSeedData`

## Backend Infrastructure

- EF Core + Npgsql power all persistence
- Migrations are auto-applied at startup with `dbContext.Database.MigrateAsync()`
- Redis is registered through Aspire output caching extensions
- Serilog writes to console
- OpenTelemetry is enabled for logging, metrics, and tracing
- Health endpoints `/health` and `/alive` are exposed in development

## Backend APIs

Active controller groups:

- `AuthController` -> `/auth/*`
- `LocationMastersController` -> `/common/countries|states|districts|cities|pincodes`
- `CatalogMastersController` -> `/common/contact-types|product-types|product-groups|hsn-codes|units|gst-percents|colours|sizes`
- `OrderMastersController` -> `/common/order-types|styles|brands`
- `OperationsMastersController` -> `/common/transports|destinations|currencies|warehouses|payment-terms`
- `ContactsController` -> `/contacts/*`
- `ProductsController` -> `/products/*`
- `CartController` -> `/cart/*`
- `OrdersController` -> `/orders/*`
- `InvoicesController` -> `/invoices/*`
- `PaymentsController` -> `/payments/*`
- `VendorPayoutsController` -> `/vendor-payouts/*`
- `PurchaseOrdersController` -> `/inventory/purchase-orders*`
- `WarehouseTransfersController` -> `/inventory/transfers*`
- `InventoryController` -> `/inventory/products/*`, `/inventory/warehouse/*`, `/inventory/adjustments`
- `StockMovementsController` -> `/inventory/movements`
- `NotificationTemplatesController` -> `/notifications/templates`
- `NotificationLogsController` -> `/notifications/logs`
- `NotificationSettingsController` -> `/notifications/settings`
- `VendorsController` -> `/vendors*`, `/vendors/warehouses`
- `VendorUsersController` -> `/vendors/{vendorId}/users`
- `AnalyticsController` -> `/analytics/*`
- `PromotionsController` -> `/promotions`
- `CouponsController` -> `/coupons/*`
- `ShipmentsController` -> `/shipments*`
- `ReturnsController` -> `/returns*`
- `RefundsController` -> `/refunds*`

Not currently active:

- `Modules/Finance` and `Modules/System` define entities/configurations only

# Backend Modules

## Auth

- Purpose: user identity, JWT issuance, refresh-token rotation, role management, permission assignment, audit logging
- Domain entities: `User`, `Role`, `Permission`, `RolePermission`, `RefreshToken`, `AuditLog`
- Application services: `AuthService`, `JwtTokenService`, `PasswordService`
- Infrastructure/security: `JwtSettings`, `JwtTokenGenerator`, `PasswordHasher`, auth seed data, authorization policies
- API controller: `AuthController`
- Key responsibilities:
  - registration and login
  - token refresh and logout
  - `/auth/me`
  - admin user CRUD
  - admin role CRUD
  - role-permission management

## Common

- Purpose: reusable master data for locations, catalog, ordering, and operations
- Domain entities:
  - location: `Country`, `State`, `District`, `City`, `Pincode`
  - catalog/order: `ContactType`, `ProductType`, `ProductGroup`, `HsnCode`, `Unit`, `GstPercent`, `Colour`, `Size`, `OrderType`, `Style`, `Brand`
  - operations: `Transport`, `Destination`, `Currency`, `Warehouse`, `PaymentTerm`
- Application service: `CommonMasterDataService` split across `Shared`, `Locations`, `Catalog`, `Operations`
- Infrastructure components: EF configurations and heavy seed data for baseline masters
- API controllers:
  - `LocationMastersController`
  - `CatalogMastersController`
  - `OrderMastersController`
  - `OperationsMastersController`
- Responsibility: central source of truth for dropdown/reference data consumed by Contacts, Products, Sales, and frontend lookup flows

## Contacts

- Purpose: contact and contact-group management with address, phone, email, and note subrecords
- Domain entities: `ContactGroup`, `Contact`, `ContactAddress`, `ContactEmail`, `ContactPhone`, `ContactNote`
- Application service: `ContactService`
- Infrastructure components:
  - references Auth users for ownership/vendor scoping
  - references Common masters for contact type and geographic address data
  - writes Auth audit logs
- API controller: `ContactsController`
- Access pattern:
  - Admin can see all contacts
  - Vendors/non-admins are filtered by ownership plus vendor-company membership resolved through `vendor_users`

## Products

- Purpose: product catalog, variants, pricing, images, inventory, vendor links, and product attributes
- Domain entities:
  - `ProductCategory`
  - `Product`
  - `ProductVariant`
  - `ProductPrice`
  - `ProductImage`
  - `ProductInventory`
  - `ProductVendorLink`
  - `ProductAttribute`
  - `ProductAttributeValue`
- Application service: `ProductService`
- Infrastructure components:
  - references Auth users for owner/vendor scope
  - references Common masters for product group, type, unit, currency, GST, brand, HSN, warehouse
  - writes Auth audit logs
- API controller: `ProductsController`
- Access pattern:
  - Admin sees all products
  - Vendors are limited to owned/assigned products
  - pricing now resolves from multi-row `product_prices` entries instead of treating `BasePrice` as the only sell price source

## Sales

- Purpose: cart, checkout, orders, invoices, payments, vendor earnings, vendor payouts
- Domain entities:
  - `Cart`, `CartItem`
  - `Order`, `OrderItem`, `OrderStatusHistory`, `OrderAddress`
  - `Invoice`, `InvoiceItem`
  - `Payment`, `PaymentTransaction`
  - `VendorEarning`, `VendorPayout`, `VendorPayoutItem`
- Application service: `SalesService`
- Infrastructure components:
  - depends on Products for product, variant, tax, vendor pricing, and inventory context
  - depends on Contacts for customer contact references
  - depends on Common for currency and payment references
  - depends on Finance `PaymentMode` for payment method links
  - writes Auth audit logs
- API controllers:
  - `CartController`
  - `OrdersController`
  - `InvoicesController`
  - `PaymentsController`
  - `VendorPayoutsController`

## Inventory

- Purpose: warehouse-level stock operations, purchase receiving, transfer execution, stock movement history, and manual inventory adjustments
- Domain entities:
  - `InventoryLedger`
  - `PurchaseOrder`
  - `PurchaseOrderItem`
  - `StockMovement`
  - `WarehouseTransfer`
  - `WarehouseTransferItem`
  - `InventoryAdjustment`
  - `InventoryAdjustmentItem`
- Application service: `InventoryService`
- Infrastructure components:
  - reuses `Warehouse` from `Common`
  - reuses `Product`, `ProductVariant`, and `ProductInventory` from `Products`
  - reuses `User` and `AuditLog` from `Auth`
  - writes operational history into inventory-specific tables while updating the existing `product_inventory` warehouse snapshot
- API controllers:
  - `PurchaseOrdersController`
  - `WarehouseTransfersController`
  - `InventoryController`
  - `StockMovementsController`
- Key responsibilities:
  - purchase order creation and receiving
  - warehouse-to-warehouse stock transfer lifecycle
  - stock movement and inventory-ledger recording
  - manual inventory adjustments
  - warehouse and product inventory summaries
  - vendor-scoped warehouse operations based on vendor-company ownership

## Vendors

- Purpose: vendor business profile management, vendor-user assignment, vendor warehouse visibility, and business-level vendor references across modules
- Domain entities:
  - `Vendor`
  - `VendorUser`
  - `VendorAddress`
  - `VendorBankAccount`
- Application service: `VendorService`
- Infrastructure components:
  - references Auth `User` for vendor staff assignment
  - references Common geography masters for vendor addresses
  - references Finance `Bank` for vendor bank accounts
  - exposes vendor-company scoped warehouse discovery for frontend vendor routes
- API controllers:
  - `VendorsController`
  - `VendorUsersController`
- Key responsibilities:
  - vendor company CRUD
  - multi-user vendor staff assignment
  - vendor profile, tax, address, and banking metadata
  - warehouse discovery for the current vendor company

## Analytics

- Purpose: vendor and product sales reporting plus aggregate sales overview snapshots
- Domain entities:
  - `VendorSalesSummary`
  - `ProductSalesSummary`
- Application service: `AnalyticsService`
- Infrastructure components:
  - reads `Orders`, `OrderItems`, and `VendorEarnings` from `Sales`
  - references `Vendor` and `Product`
  - persists period snapshots in analytics summary tables
- API controller: `AnalyticsController`
- Key responsibilities:
  - vendor sales summary
  - vendor top-product reporting
  - product sales summary
  - sales overview aggregation

## Promotions

- Purpose: product promotions, coupon validation, coupon application, and discount usage tracking
- Domain entities:
  - `Promotion`
  - `PromotionProduct`
  - `Coupon`
  - `CouponUsage`
- Application service: `PromotionService`
- Infrastructure components:
  - references `Product` from `Products`
  - references `Order` from `Sales`
  - references `User` and `AuditLog` from `Auth`
- API controllers:
  - `PromotionsController`
  - `CouponsController`
- Key responsibilities:
  - promotion creation and listing
  - coupon creation
  - coupon validation
  - order-level coupon application and usage logging

## Shipping

- Purpose: shipment creation, shipment status management, tracking, and shipping-method reference data
- Domain entities:
  - `ShippingProvider`
  - `ShippingMethod`
  - `Shipment`
  - `ShipmentItem`
- Application service: `ShippingService`
- Infrastructure components:
  - references `Order` and `OrderItem` from `Sales`
  - seeds baseline provider and shipping-method rows
  - writes Auth audit logs for shipment mutations
- API controller: `ShipmentsController`
- Key responsibilities:
  - create shipment
  - update shipment status
  - track shipment by tracking number
  - expose shipping methods for admin workflows

## Finance

- Purpose: financial master/reference entities and ledger transaction persistence
- Domain entities: `Bank`, `PaymentMode`, `LedgerGroup`, `LedgerTransaction`
- Infrastructure components: EF configurations and seed data
- API layer: none yet
- Current status: persistence model exists, but no service/controller surface is currently exposed

## System

- Purpose: global system settings and number series metadata
- Domain entities: `SystemSetting`, `NumberSeries`
- Infrastructure components: EF configurations and seed data
- API layer: none yet
- Current status: persistence model exists, but document numbering in Sales currently uses runtime counting logic instead of `number_series`

## AfterSales

- Purpose: returns, approvals, restocking, refunds, and refund transaction history
- Domain entities:
  - `Return`, `ReturnItem`, `ReturnStatusHistory`, `ReturnInspection`
  - `RestockEvent`, `InventoryLedgerEntry`
  - `Refund`, `RefundItem`, `RefundTransaction`
- Application service: `AfterSalesService`
- Infrastructure components:
  - references `Order`, `OrderItem`, and `Payment` from `Sales`
  - references `ProductInventory` and `Warehouse` for restocking
  - writes Auth audit logs for return and refund mutations
- API controllers:
  - `ReturnsController`
  - `RefundsController`
- Key responsibilities:
  - return request creation
  - return approval
  - refund processing
  - returned-stock restocking

## Notifications

- Purpose: centralized template-driven notifications across Email, SMS, WhatsApp, and In-App channels
- Domain entities:
  - `NotificationTemplate`
  - `Notification`
  - `NotificationLog`
- Application service: `NotificationService`
- Infrastructure components:
  - `INotificationProvider`
  - `EmailNotificationProvider`
  - `SmsNotificationProvider`
  - `WhatsAppNotificationProvider`
  - `NotificationQueueProcessor`
  - `system_settings` keys for channel toggles and queue batch size
- API controllers:
  - `NotificationTemplatesController`
  - `NotificationLogsController`
  - `NotificationSettingsController`
- Key responsibilities:
  - queue notifications from domain events
  - process the pending notification queue in the background
  - manage templates and channel settings
  - record provider outcomes in `notification_logs`

## Media

- Purpose: centralized file and image management shared by products, vendors, CMS-style assets, user-profile media, shipping documents, and marketing banners
- Domain entities:
  - `MediaFolder`
  - `MediaFile`
  - `MediaUsage`
- Application service: `MediaService`
- Infrastructure components:
  - `IFileStorageProvider`
  - `LocalFileStorageProvider`
  - image-derivative generation for `thumbnail`, `medium`, and `large`
- API controllers:
  - `MediaController`
  - `FoldersController`
- Key responsibilities:
  - upload files and images with server-side validation
  - store metadata, checksums, and soft-delete state
  - manage hierarchical folders and file moves
  - track cross-module media usage references
  - keep storage-provider integration ready for future cloud backends

## Company

- Purpose: centralized company profile, branding, billing identity, and mutable application settings used across the platform
- Domain entities:
  - `Company`
  - `CompanyAddress`
  - `CompanySetting`
- Application service: `CompanyService`
- Infrastructure components:
  - media-backed `logo_media_id` and `favicon_media_id`
  - currency and geography references from `Common`
  - public branding read endpoint plus admin-only mutation endpoints
- API controllers:
  - `CompanyController`
  - `CompanySettingsController`
- Key responsibilities:
  - expose the platform display name, legal and billing names, contacts, and tax metadata
  - manage billing address and branding assets
  - store application-wide values such as order and invoice prefixes
  - provide a single source of truth for frontend branding and future document/email/report configuration

# Frontend Architecture

## Application Root

`cxstore/src` is the frontend root. Main folders:

- `api/` -> HTTP clients per domain, including the storefront axios client
- `components/` -> layouts, admin UI, forms, lookups, shared primitives, shadcn-style UI components
- `config/` -> company metadata
- `css/` -> global app stylesheet
- `hooks/` -> small shared hooks
- `lib/` -> registry/config helpers plus the shared React Query client
- `pages/` -> route-level screens
- `routes/` -> lightweight storefront route constants
- `state/` -> auth store plus storefront cart and wishlist stores
- `types/` -> TypeScript contracts aligned to backend DTOs and storefront view models
- `utils/` -> storefront filtering, formatting, slug, and local persistence helpers

## Frontend Folder Structure

There is no `cxstore/src/modules` folder. The frontend is organized by cross-cutting folders, public storefront pages under `pages/*`, and admin or vendor route folders under `pages/admin/*`.

Main frontend module areas are represented by:

- public/storefront pages under `pages/`
- admin/vendor/business pages under `pages/admin/*`
- reusable domain-specific forms under `components/admin/*` and `components/forms/*`
- shared typed API clients under `api/*`

## Frontend Components

- Layouts:
  - `WebLayout`
  - `AuthLayout`
  - `AppLayout`
- Storefront shell:
  - `MainLayout`
  - `storefront-header.tsx`
  - `storefront-footer.tsx`
  - `navbar.tsx`
  - `storefront-mobile-menu.tsx`
  - `storefront-bottom-nav.tsx`
  - `storefront-search-bar.tsx`
- Shared admin primitives:
  - `CommonList`
  - `CommonUpsertDialog`
  - `AdminTable`
  - lookup components in `components/lookups`
- Navigation:
  - `AppSidebar`
  - `admin-menu.ts`
  - sidebar navigation blocks under `components/blocks/menu/app`
- Shared UI:
  - `components/ui/*` contains the reusable component set
- Commerce components:
  - `components/product/*` for cards, filters, galleries, reviews, and merchandising sections
  - `components/cart/*` for cart rows, coupon entry, and totals
  - `components/checkout/*` for stepper, address, shipping, payment, and review blocks

## Frontend State Management

- Global auth/session state is implemented in `state/authStore.ts`
- Storage-backed state includes access token, refresh token, expiry, and current user
- Session restore runs from `main.tsx` through `initializeAuth()`
- Auth store handles refresh-token retry and logout cleanup
- Storefront cart state is implemented in `state/cartStore.ts` using Zustand persistence
- Storefront wishlist state is implemented in `state/wishlistStore.ts` using Zustand persistence
- Cart persistence is local-storage backed and synchronizes against the existing cart APIs
- React Query is now used for customer-facing data fetching and cache management through `lib/queryClient.ts`

## Frontend API Integration

- Existing business APIs still use `api/httpClient.ts`
- Storefront pages use `api/apiClient.ts`, an Axios client that attaches JWT access tokens when present and retries once after refresh
- Domain API clients:
  - `authApi.ts`
  - `commonApi.ts`
  - `locationApi.ts`
  - `brandApi.ts`, `colourApi.ts`, `sizeApi.ts`, `unitApi.ts`, `hsnApi.ts`
  - `contactApi.ts`
- `productApi.ts`
- `salesApi.ts`
- `apiClient.ts`
- `inventoryApi.ts`
- `companyApi.ts`
- `mediaApi.ts`
- `vendorApi.ts`
- `analyticsApi.ts`
- `promotionApi.ts`
- `shippingApi.ts`
- `returnsApi.ts`
- `notificationApi.ts`
- `userApi.ts`, `roleApi.ts`

# Frontend Modules

## Public / Storefront

- Pages:
  - `Home`
  - `About`
  - `Services`
  - `Contact`
  - `CategoryPage`
  - `SearchPage`
  - `ProductPage`
  - `VendorStorePage`
  - `CartPage`
  - `CheckoutPage`
  - `OrderSuccessPage`
  - `WishlistPage`
  - `AccountPage`
- Layout: `WebLayout`
- Supporting files:
  - `routes/router.tsx`
  - `hooks/usePageMeta.ts`
  - `types/storefront.ts`
  - `utils/storefront.ts`
- Purpose: customer ecommerce shell covering merchandising, browsing, cart, checkout, account, wishlist, and order-success flows without introducing a second frontend application

## Storefront Commerce

- Home:
  - merchandising sections for hero, featured products, category grid, best sellers, top vendors, trending products, deal banner, and newsletter CTA
- Catalog:
  - category and search pages provide client-side filtering, sorting, pagination, and vendor-aware product cards
- Product detail:
  - gallery, pricing, stock status, vendor link, quantity selection, related products, local reviews, and wishlist actions
- Cart and checkout:
  - Zustand-backed cart with quantity editing, coupon entry, shipping selection, payment-method selection, and order submission against the existing Sales APIs
- Account:
  - one route-aware account page renders profile, addresses, order history, wishlist, and reviews views under `/account/*`
- Vendor storefront:
  - vendor landing pages are resolved from vendor-company data and render vendor profile plus catalog slices
- Constraint:
  - the current backend product and vendor discovery APIs require authentication, so the storefront shows an auth notice for live catalog data when no session is present
- Constraint:
  - wishlist and review persistence are currently frontend-managed because dedicated backend wishlist and product-review APIs do not yet exist

## Authentication

- Page: `Login`
- Layout: `AuthLayout`
- Shared component: `components/forms/login-form.tsx`
- Purpose: sign in, sign up, and auth entry

## Dashboard / Workspace

- Page: `Dashboard`
- Layout: `AppLayout`
- Routes: `/dashboard`, `/admin`, `/vendor`
- Purpose: authenticated landing area reused across role segments

## Admin User and Role Management

- Pages:
  - `pages/admin/users/*`
  - `pages/admin/roles/*`
  - `pages/admin/permissions/*`
- APIs: `userApi.ts`, `roleApi.ts`, `authApi.ts`
- Purpose: user CRUD, role CRUD, role-permission editing

## Common Master Management

- Routes: `/admin/common/:masterKey`
- Page: `CommonMasterPage`
- Registry-driven definitions: `lib/common-master-registry.tsx`
- Shared UI:
  - `CommonList`
  - `CommonUpsertDialog`
  - `useCommonMasterState`
- Purpose: one generic page renders all common-master admin screens using metadata

## Contacts

- Pages: `pages/admin/contacts/*`
- Shared form: `components/admin/contacts/ContactForm.tsx`
- API: `contactApi.ts`
- Types: `types/contact.ts`
- Purpose: contact CRUD for admin and vendor routes

## Products

- Pages: `pages/admin/products/*`
- Shared form: `components/admin/products/ProductForm.tsx`
- API: `productApi.ts`
- Types: `types/product.ts`
- Purpose: category and product CRUD, vendor-assigned catalog management, and multi-row channel-aware pricing maintenance

## Sales

- Pages: `pages/admin/sales/*`
- API: `salesApi.ts`
- Types: `types/sales.ts`
- Purpose: orders, invoices, payments, vendor payout request/list flows

## Inventory

- Pages: `pages/admin/inventory/*`
- API: `inventoryApi.ts`
- Types: `types/inventory.ts`
- Purpose: purchase order intake, warehouse transfers, stock visibility, and movement tracking for both admin and vendor-scoped routes

## Vendors

- Pages: `pages/admin/vendors/*`
- APIs: `vendorApi.ts`
- Types: `types/vendor.ts`
- Purpose: vendor-company administration, vendor-user assignment, and vendor-scoped warehouse visibility

## Analytics

- Pages: `pages/admin/analytics/*`
- API: `analyticsApi.ts`
- Types: `types/analytics.ts`
- Purpose: admin reporting for vendor performance, product sales, and overall sales totals

## Promotions

- Pages: `pages/admin/promotions/*`
- API: `promotionApi.ts`
- Types: `types/promotion.ts`
- Purpose: admin management of promotions, coupons, validation, and coupon application flows

## Shipping

- Pages: `pages/admin/shipping/*`
- API: `shippingApi.ts`
- Types: `types/shipping.ts`
- Purpose: shipment creation, shipping-method visibility, and delivery-status tracking

## Returns

- Pages: `pages/admin/returns/*`
- API: `returnsApi.ts`
- Types: `types/returns.ts`
- Purpose: return approval, refund processing, and warehouse restocking workflows

## Notifications

- Pages:
  - `pages/admin/notifications/templates/NotificationTemplatesPage.tsx`
  - `pages/admin/notifications/logs/NotificationLogsPage.tsx`
  - `pages/admin/notifications/settings/NotificationSettingsPage.tsx`
- API: `notificationApi.ts`
- Types: `types/notification.ts`
- Purpose: admin management of templates, queue settings, and delivery logs

## Media

- Pages:
  - `pages/admin/media/MediaLibraryPage.tsx`
- API: `mediaApi.ts`
- Types: `types/media.ts`
- Shared component:
  - `components/media/MediaPicker.tsx`
- Purpose: admin media browsing, upload, folder management, soft delete/restore, and reusable asset selection for product and vendor forms

## Company Settings

- Pages:
  - `pages/admin/settings/company/CompanySettingsPage.tsx`
- API: `companyApi.ts`
- Types: `types/company.ts`
- Shared runtime config:
  - `config/company.tsx`
- Purpose: admin management of company profile, branding assets, billing address, and mutable application defaults while also feeding frontend runtime branding

## Lookups and Reusable Form Infrastructure

- `components/lookups/*` -> autocomplete lookup primitives
- `components/forms/useCommonMasterState.tsx` -> dynamic common-master page state
- `components/forms/useCommonListState.tsx` -> list/filter/pagination helpers
- Purpose: reduce page-specific duplication across admin experiences

# Routing Structure

## WebLayout

Routes using `WebLayout`:

- `/`
- `/about`
- `/contact`
- `/services`
- `/search`
- `/category/:slug`
- `/product/:slug`
- `/store/:vendorSlug`
- `/cart`
- `/wishlist`
- authenticated storefront routes still rendered inside `WebLayout`:
  - `/checkout`
  - `/order-success/:orderId`
  - `/account`
  - `/account/profile`
  - `/account/addresses`
  - `/account/orders`
  - `/account/wishlist`
  - `/account/reviews`

This is the storefront shell with customer navigation, search, wishlist, cart badge, mobile menu, footer, and account entry points.

## AuthLayout

Routes using `AuthLayout`:

- `/login`

This is the dedicated authentication shell.

## AppLayout

Routes using `AppLayout`:

- shared authenticated workspace:
  - `/dashboard`
- admin:
  - `/admin`
  - `/admin/users/*`
  - `/admin/roles/*`
  - `/admin/permissions*`
  - `/admin/contacts*`
  - `/admin/products*`
  - `/admin/sales/*`
  - `/admin/settings/company`
  - `/admin/media`
  - `/admin/promotions`
  - `/admin/shipping`
  - `/admin/returns`
  - `/admin/analytics`
  - `/admin/common/*`
- vendor:
  - `/vendor`
  - `/vendor/contacts*`
  - `/vendor/products*`
  - `/vendor/sales/*`
  - `/vendor/warehouses`
  - `/vendor/inventory/*`

`ProtectedRoute` wraps these route groups and enforces allowed roles.

Vendor route usage inside `AppLayout` is now split as:

- `/vendor/contacts*`, `/vendor/products*`, `/vendor/sales/*` -> vendor-scoped transactional pages
- `/vendor/warehouses` -> vendor-company owned warehouse list
- `/vendor/inventory/*` -> vendor-scoped purchase orders, transfers, inventory summaries, and stock movements
- `/admin/promotions`, `/admin/shipping`, `/admin/returns`, `/admin/analytics` -> enterprise operations and reporting screens for admin users

# Database Structure

## Active Database Implementation

The active database structure is defined by:

- `Infrastructure/CodexsunDbContext.cs`
- EF configurations under `Modules/*/Configurations`
- migrations:
  - `20260314133756_ProductionBaseline`
  - `20260314143943_ExpandedAuthAndCommonSeedData`
  - `20260314165636_AddContactsAndProductsModules`
  - `20260314184850_AddSalesCommerceModule`
  - `20260315132411_AddInventoryWarehouseModule`
  - `20260315134829_AddMultiChannelProductPricing`
  - `20260315143615_AddVendorCompanySupport`
  - `20260315151649_AddVendorWarehouseOwnership`
  - `20260315153639_AddEnterpriseModules`
  - `20260315160147_AddNotificationsModule`
  - `20260315161557_AddMediaModule`
  - `20260315163720_AddCompanyModule`

The active schema currently contains 94 mapped tables.

## Identity Tables

- `users`
- `roles`
- `permissions`
- `role_permissions`
- `refresh_tokens`
- `audit_logs`

Key relationships:

- `users.role_id -> roles.id`
- `role_permissions.role_id -> roles.id`
- `role_permissions.permission_id -> permissions.id`
- `refresh_tokens.user_id -> users.id`
- `audit_logs.user_id -> users.id`

## Common Master Tables

- Location: `countries`, `states`, `districts`, `cities`, `pincodes`
- Catalog/order: `contact_types`, `product_types`, `product_groups`, `hsncodes`, `units`, `gst_percents`, `colours`, `sizes`, `order_types`, `styles`, `brands`
- Operations: `transports`, `destinations`, `currencies`, `warehouses`, `payment_terms`

Key relationships:

- `states.country_id -> countries.id`
- `districts.state_id -> states.id`
- `cities.district_id -> districts.id`
- `pincodes.city_id -> cities.id`
- `destinations.country_id -> countries.id`
- `destinations.city_id -> cities.id`
- `warehouses.vendor_id -> vendors.id` (nullable ownership link)

## Company Tables

- `companies`
- `company_addresses`
- `company_settings`

Key relationships:

- `companies.logo_media_id -> media_files.id`
- `companies.favicon_media_id -> media_files.id`
- `companies.currency_id -> currencies.id`
- `company_addresses.company_id -> companies.id`
- `company_addresses.country_id -> countries.id`
- `company_addresses.state_id -> states.id`
- `company_addresses.city_id -> cities.id`
- `company_addresses.pincode_id -> pincodes.id`
- `company_settings.company_id -> companies.id`

## Contact Tables

- `contact_groups`
- `contacts`
- `contact_addresses`
- `contact_emails`
- `contact_phones`
- `contact_notes`

Key relationships:

- `contacts.owner_user_id -> users.id`
- `contacts.vendor_user_id -> users.id`
- `contacts.contact_type_id -> contact_types.id`
- `contacts.group_id -> contact_groups.id`
- `contact_addresses.contact_id -> contacts.id`
- `contact_addresses.country_id -> countries.id`
- `contact_addresses.state_id -> states.id`
- `contact_addresses.district_id -> districts.id`
- `contact_addresses.city_id -> cities.id`
- `contact_emails.contact_id -> contacts.id`
- `contact_phones.contact_id -> contacts.id`
- `contact_notes.contact_id -> contacts.id`

## Product Tables

- `product_categories`
- `products`
- `product_variants`
- `product_prices`
- `product_images`
- `product_inventory`
- `product_vendor_links`
- `product_attributes`
- `product_attribute_values`

Key relationships:

- `products.owner_user_id -> users.id`
- `products.vendor_user_id -> users.id`
- `products.group_id -> product_groups.id`
- `products.type_id -> product_types.id`
- `products.category_id -> product_categories.id`
- `products.unit_id -> units.id`
- `products.currency_id -> currencies.id`
- `products.gst_percent_id -> gst_percents.id`
- `products.brand_id -> brands.id`
- `products.hsn_code_id -> hsncodes.id`
- `product_variants.product_id -> products.id`
- `product_prices.product_id -> products.id`
- `product_prices.product_variant_id -> product_variants.id`
- `product_prices.currency_id -> currencies.id`
- `product_images.product_id -> products.id`
- `product_inventory.product_id -> products.id`
- `product_inventory.warehouse_id -> warehouses.id`
- `product_vendor_links.product_id -> products.id`
- `product_vendor_links.vendor_user_id -> users.id`
- `product_attributes.product_id -> products.id`
- `product_attribute_values.product_attribute_id -> product_attributes.id`
- `product_attribute_values.product_variant_id -> product_variants.id`

## Sales Tables

- `carts`
- `cart_items`
- `orders`
- `order_items`
- `order_status_history`
- `order_addresses`
- `invoices`
- `invoice_items`
- `payments`
- `payment_transactions`
- `vendor_earnings`
- `vendor_payouts`
- `vendor_payout_items`

## Inventory Tables

- `inventory_ledgers`
- `purchase_orders`
- `purchase_order_items`
- `stock_movements`
- `warehouse_transfers`
- `warehouse_transfer_items`
- `inventory_adjustments`
- `inventory_adjustment_items`

Key relationships:

- `inventory_ledgers.product_id -> products.id`
- `inventory_ledgers.product_variant_id -> product_variants.id`
- `inventory_ledgers.warehouse_id -> warehouses.id`
- `inventory_ledgers.created_by_user_id -> users.id`
- `purchase_orders.vendor_user_id -> users.id`
- `purchase_orders.currency_id -> currencies.id`
- `purchase_orders.created_by_user_id -> users.id`
- `purchase_order_items.purchase_order_id -> purchase_orders.id`
- `purchase_order_items.product_id -> products.id`
- `purchase_order_items.product_variant_id -> product_variants.id`
- `stock_movements.product_id -> products.id`
- `stock_movements.product_variant_id -> product_variants.id`
- `stock_movements.warehouse_id -> warehouses.id`
- `stock_movements.created_by_user_id -> users.id`
- `warehouse_transfers.from_warehouse_id -> warehouses.id`
- `warehouse_transfers.to_warehouse_id -> warehouses.id`
- `warehouse_transfers.created_by_user_id -> users.id`
- `warehouse_transfer_items.transfer_id -> warehouse_transfers.id`
- `warehouse_transfer_items.product_id -> products.id`
- `warehouse_transfer_items.product_variant_id -> product_variants.id`
- `inventory_adjustments.warehouse_id -> warehouses.id`
- `inventory_adjustments.created_by_user_id -> users.id`
- `inventory_adjustment_items.adjustment_id -> inventory_adjustments.id`
- `inventory_adjustment_items.product_id -> products.id`
- `inventory_adjustment_items.product_variant_id -> product_variants.id`

## Vendor Tables

- `vendors`
- `vendor_users`
- `vendor_addresses`
- `vendor_bank_accounts`

Key relationships:

- `vendor_users.vendor_id -> vendors.id`
- `vendor_users.user_id -> users.id`
- `vendor_addresses.vendor_id -> vendors.id`
- `vendor_addresses.country_id -> countries.id`
- `vendor_addresses.state_id -> states.id`
- `vendor_addresses.district_id -> districts.id`
- `vendor_addresses.city_id -> cities.id`
- `vendor_addresses.pincode_id -> pincodes.id`
- `vendor_bank_accounts.vendor_id -> vendors.id`
- `vendor_bank_accounts.bank_id -> banks.id`

## Analytics Tables

- `vendor_sales_summary`
- `product_sales_summary`

Key relationships:

- `vendor_sales_summary.vendor_id -> vendors.id`
- `product_sales_summary.product_id -> products.id`

## Promotion Tables

- `promotions`
- `promotion_products`
- `coupons`
- `coupon_usages`

Key relationships:

- `promotion_products.promotion_id -> promotions.id`
- `promotion_products.product_id -> products.id`
- `coupon_usages.coupon_id -> coupons.id`
- `coupon_usages.order_id -> orders.id`
- `coupon_usages.user_id -> users.id`

## Shipping Tables

- `shipping_providers`
- `shipping_methods`
- `shipments`
- `shipment_items`

Key relationships:

- `shipping_methods.provider_id -> shipping_providers.id`
- `shipments.order_id -> orders.id`
- `shipments.shipping_method_id -> shipping_methods.id`
- `shipment_items.shipment_id -> shipments.id`
- `shipment_items.order_item_id -> order_items.id`

Key relationships:

- `carts.user_id -> users.id`
- `carts.vendor_user_id -> users.id`
- `carts.currency_id -> currencies.id`
- `cart_items.cart_id -> carts.id`
- `cart_items.product_id -> products.id`
- `cart_items.product_variant_id -> product_variants.id`
- `cart_items.vendor_user_id -> users.id`
- `orders.customer_user_id -> users.id`
- `orders.customer_contact_id -> contacts.id`
- `orders.currency_id -> currencies.id`
- `order_items.order_id -> orders.id`
- `order_items.product_id -> products.id`
- `order_items.product_variant_id -> product_variants.id`
- `order_items.vendor_user_id -> users.id`
- `order_status_history.order_id -> orders.id`
- `order_addresses.order_id -> orders.id`
- `order_addresses.contact_id -> contacts.id`
- `invoices.order_id -> orders.id`
- `invoices.customer_contact_id -> contacts.id`
- `invoices.currency_id -> currencies.id`
- `invoice_items.invoice_id -> invoices.id`
- `invoice_items.product_id -> products.id`
- `payments.invoice_id -> invoices.id`
- `payments.payment_mode_id -> payment_modes.id`
- `payments.currency_id -> currencies.id`
- `payment_transactions.payment_id -> payments.id`
- `vendor_earnings.vendor_user_id -> users.id`
- `vendor_earnings.order_item_id -> order_items.id`
- `vendor_earnings.product_id -> products.id`
- `vendor_earnings.order_id -> orders.id`
- `vendor_payouts.vendor_user_id -> users.id`
- `vendor_payouts.currency_id -> currencies.id`
- `vendor_payout_items.vendor_payout_id -> vendor_payouts.id`
- `vendor_payout_items.vendor_earning_id -> vendor_earnings.id`

## AfterSales Tables

- `returns`
- `return_items`
- `return_status_history`
- `return_inspections`
- `restock_events`
- `inventory_ledger`
- `refunds`
- `refund_items`
- `refund_transactions`

Key relationships:

- `returns.order_id -> orders.id`
- `returns.customer_user_id -> users.id`
- `returns.customer_contact_id -> contacts.id`
- `return_items.return_id -> returns.id`
- `return_items.order_item_id -> order_items.id`
- `return_items.product_id -> products.id`
- `return_status_history.return_id -> returns.id`
- `return_inspections.return_item_id -> return_items.id`
- `return_inspections.inspector_user_id -> users.id`
- `restock_events.return_item_id -> return_items.id`
- `restock_events.warehouse_id -> warehouses.id`
- `restock_events.product_id -> products.id`
- `inventory_ledger.return_item_id -> return_items.id`
- `inventory_ledger.warehouse_id -> warehouses.id`
- `inventory_ledger.product_id -> products.id`
- `refunds.order_id -> orders.id`
- `refunds.return_id -> returns.id`
- `refunds.currency_id -> currencies.id`
- `refund_items.refund_id -> refunds.id`
- `refund_items.order_item_id -> order_items.id`
- `refund_items.product_id -> products.id`
- `refund_transactions.refund_id -> refunds.id`
- `refund_transactions.payment_id -> payments.id`

## Finance Tables

- `banks`
- `payment_modes`
- `ledger_groups`
- `transactions`

Key relationships:

- `transactions.bank_id -> banks.id`
- `transactions.payment_mode_id -> payment_modes.id`
- `transactions.ledger_group_id -> ledger_groups.id`

## System Tables

- `system_settings`
- `number_series`

# Module Database Mapping

## Auth module

- Tables: `users`, `roles`, `permissions`, `role_permissions`, `refresh_tokens`, `audit_logs`
- Relationships: users belong to roles; roles map to permissions; refresh tokens and audit logs attach to users

## Common module

- Tables: `countries`, `states`, `districts`, `cities`, `pincodes`, `contact_types`, `product_types`, `product_groups`, `hsncodes`, `units`, `gst_percents`, `colours`, `sizes`, `order_types`, `styles`, `brands`, `transports`, `destinations`, `currencies`, `warehouses`, `payment_terms`
- Relationships: hierarchical geography plus shared reference links into Contacts, Products, Sales, and Finance

## Contacts module

- Tables: `contact_groups`, `contacts`, `contact_addresses`, `contact_emails`, `contact_phones`, `contact_notes`
- Relationships:
  - contacts reference users, contact type, and optional group
  - child address/email/phone/note tables cascade from contacts
  - addresses bridge contacts to Common geography tables

## Products module

- Tables: `product_categories`, `products`, `product_variants`, `product_prices`, `product_images`, `product_inventory`, `product_vendor_links`, `product_attributes`, `product_attribute_values`
- Relationships:
  - products depend on Auth users and Common masters
  - most child tables cascade from `products`
  - `product_prices` stores channel-aware retail, wholesale, vendor, and offer rows with quantity thresholds and optional date windows
  - vendor links join products to vendor users
  - inventory joins products to warehouses
  - attribute values optionally bind to variants

## Sales module

- Tables: `carts`, `cart_items`, `orders`, `order_items`, `order_status_history`, `order_addresses`, `invoices`, `invoice_items`, `payments`, `payment_transactions`, `vendor_earnings`, `vendor_payouts`, `vendor_payout_items`
- Relationships:
  - cart items join carts to products and optional variants/vendors
  - orders join customers, contacts, and currencies
  - invoices attach to orders
  - payments attach to invoices
  - vendor earnings derive from order items
  - vendor payouts aggregate vendor earnings

## Inventory module

- Tables: `inventory_ledgers`, `purchase_orders`, `purchase_order_items`, `stock_movements`, `warehouse_transfers`, `warehouse_transfer_items`, `inventory_adjustments`, `inventory_adjustment_items`
- Relationships:
  - purchase orders link vendors, currencies, creators, and purchased products
  - warehouse transfers link source warehouse, destination warehouse, creator, and transferred products
  - adjustments link a warehouse and actor to item-level before/after quantity corrections
  - stock movements and inventory ledgers record warehouse-level operational history against products, optional variants, and acting users
  - the module also updates `product_inventory` in `Products` as the current quantity snapshot per warehouse
  - vendor users are constrained to warehouses owned by their vendor company through `warehouses.vendor_id`

## Vendors module

- Tables: `vendors`, `vendor_users`, `vendor_addresses`, `vendor_bank_accounts`
- Relationships:
  - vendor businesses group multiple existing Auth users under one company record
  - vendor addresses bridge vendor companies to Common geography masters
  - vendor bank accounts bridge vendor companies to Finance bank masters
  - warehouse ownership is modeled indirectly through `Common.warehouses.vendor_id`

## Analytics module

- Tables: `vendor_sales_summary`, `product_sales_summary`
- Relationships:
  - vendor summary rows cache vendor-level order, sales, and earnings totals for a period
  - product summary rows cache product-level quantity and revenue totals for a period
  - source data is derived from live Sales transactions

## Promotions module

- Tables: `promotions`, `promotion_products`, `coupons`, `coupon_usages`
- Relationships:
  - promotions map to products through `promotion_products`
  - coupons track order usage through `coupon_usages`
  - coupon application updates live order discounts in `Sales`

## Shipping module

- Tables: `shipping_providers`, `shipping_methods`, `shipments`, `shipment_items`
- Relationships:
  - providers own shipping methods
  - shipments link orders to selected shipping methods
  - shipment items link shipments to order items and quantities

## Finance module

- Tables: `banks`, `payment_modes`, `ledger_groups`, `transactions`
- Relationships: transactions reference bank, payment mode, and ledger group

## System module

- Tables: `system_settings`, `number_series`
- Relationships: standalone configuration tables

## Company module

- Tables: `companies`, `company_addresses`, `company_settings`
- Relationships:
  - company profile links to optional Media assets for logo and favicon
  - address bridges the company record to Common geography masters
  - settings store mutable application configuration values under one company record

## AfterSales module

- Tables: `returns`, `return_items`, `return_status_history`, `return_inspections`, `restock_events`, `inventory_ledger`, `refunds`, `refund_items`, `refund_transactions`
- Relationships:
  - returns link orders, optional customer users, optional customer contacts, and returned order items
  - refunds link approved returns back to orders and optional payments
  - restock events and return inventory ledger rows bridge return items to warehouses and product stock
- Status: active

# API Architecture

## Auth API

- Controller: `AuthController`
- Endpoint groups:
  - `/auth/register`
  - `/auth/login`
  - `/auth/refresh`
  - `/auth/logout`
  - `/auth/me`
  - `/auth/access/admin|vendor|customer`
  - `/auth/users*`
  - `/auth/roles*`
  - `/auth/permissions`
  - `/auth/roles/{id}/permissions`
- Responsible module: `Auth`

## Common Master APIs

- Controllers:
  - `LocationMastersController`
  - `CatalogMastersController`
  - `OrderMastersController`
  - `OperationsMastersController`
- Endpoint groups:
  - `/common/countries|states|districts|cities|pincodes`
  - `/common/contact-types|product-types|product-groups|hsn-codes|units|gst-percents|colours|sizes`
  - `/common/order-types|styles|brands`
  - `/common/transports|destinations|currencies|warehouses|payment-terms`
- Responsible module: `Common`

## Contacts API

- Controller: `ContactsController`
- Endpoint groups:
  - `/contacts`
  - `/contacts/{id}`
  - `/contacts/groups`
- Responsible module: `Contacts`

## Products API

- Controller: `ProductsController`
- Endpoint groups:
  - `/products`
  - `/products/{id}`
  - `/products/vendor/{vendorId}`
  - `/products/category/{categoryId}`
  - `/products/categories`
- Responsible module: `Products`

## Sales APIs

- `CartController` -> `/cart`, `/cart/items`
- `OrdersController` -> `/orders`
- `InvoicesController` -> `/invoices`
- `PaymentsController` -> `/payments`
- `VendorPayoutsController` -> `/vendor-payouts`
- Responsible module: `Sales`

## Inventory APIs

- `PurchaseOrdersController` -> `/inventory/purchase-orders`, `/inventory/purchase-orders/{id}`, `/inventory/purchase-orders/{id}/receive`
- `WarehouseTransfersController` -> `/inventory/transfers`, `/inventory/transfers/{id}/complete`
- `InventoryController` -> `/inventory/products/{productId}`, `/inventory/warehouse/{warehouseId}`, `/inventory/adjustments`
- `StockMovementsController` -> `/inventory/movements`
- Responsible module: `Inventory`

## Notifications API

- `NotificationTemplatesController` -> `/notifications/templates`
- `NotificationLogsController` -> `/notifications/logs`
- `NotificationSettingsController` -> `/notifications/settings`, `/notifications/settings/process`
- Responsible module: `Notifications`

## Media API

- `MediaController` -> `/media/upload`, `/media/files`, `/media/files/{id}`, `/media/files/{id}/restore`, `/media/files/{id}/move`, `/media/files/{id}/usage`
- `FoldersController` -> `/media/folders`, `/media/folders/{id}`
- Responsible module: `Media`

## Company API

- `CompanyController` -> `/company`
- `CompanySettingsController` -> `/company/settings`
- Responsible module: `Company`

## Vendors API

- `VendorsController` -> `/vendors`, `/vendors/{id}`, `/vendors/warehouses`
- `VendorUsersController` -> `/vendors/{vendorId}/users`
- Responsible module: `Vendors`

## Analytics API

- `AnalyticsController` -> `/analytics/vendors/{vendorId}/sales`, `/analytics/products/{productId}/sales`, `/analytics/sales-overview`
- Responsible module: `Analytics`

## Promotions API

- `PromotionsController` -> `/promotions`
- `CouponsController` -> `/coupons`, `/coupons/validate`, `/coupons/apply`
- Responsible module: `Promotions`

## Shipping API

- `ShipmentsController` -> `/shipments`, `/shipments/methods`, `/shipments/{id}/status`, `/shipments/{trackingNumber}`
- Responsible module: `Shipping`

## AfterSales API

- `ReturnsController` -> `/returns`, `/returns/{id}`, `/returns/{id}/approve`
- `RefundsController` -> `/refunds`, `/refunds/process`
- Responsible module: `AfterSales`

# Infrastructure Components

## Aspire App Host

`cx.AppHost/AppHost.cs`:

- runs backend as project `server`
- runs frontend as JavaScript app `cxstore`
- injects connection strings to backend
- publishes frontend into backend `wwwroot` during container publish flow

## Local Containers

`.container/docker-compose.yml` defines:

- PostgreSQL on host port `7025`
- Redis on host port `7024`
- named volumes for both services

`.container/env/dev.env` seeds database credentials. `.container/postgres/init/init.sql` currently contains only `SELECT 1;`.

## Backend Runtime Infrastructure

- ASP.NET Core controllers
- JWT bearer authentication
- policy authorization
- global rate limiting partitioned by authenticated user or remote IP
- CORS for `http://localhost:7023`
- output caching backed by Redis
- problem details
- OpenAPI in development
- Serilog console logging
- OpenTelemetry metrics/tracing/logging
- EF migrations now extend `product_prices` in place for multi-channel pricing instead of introducing separate retail or wholesale product tables
- EF migrations also extend the shared `warehouses` master with nullable `vendor_id` ownership instead of introducing a parallel vendor warehouse table
- `AddEnterpriseModules` activates the runtime `AfterSales` schema and adds analytics, promotions, coupon usage, shipping, and shipment tracking tables
- `AddNotificationsModule` adds centralized template, queue, and provider-log tables plus template seed data
- `AddMediaModule` adds centralized media folders, media-file metadata, usage tracking, and seed root folders for local file storage
- `AddCompanyModule` adds centralized company profile, billing-address, and application-setting tables plus the default platform record and initial document/localization settings
- `/uploads` is served from the backend runtime so locally stored managed media files are reachable by the frontend through generated `file_url` values

## Frontend Runtime Infrastructure

- Vite dev server on port `7023`
- React Router for SPA navigation
- lazy-loaded pages via `React.lazy`
- shadcn-style UI component set under `components/ui`
- localStorage-backed auth persistence

# Security Architecture

## Authentication

- Backend uses JWT bearer authentication
- Tokens are generated by `JwtTokenService` and `JwtTokenGenerator`
- Refresh tokens are stored in `refresh_tokens`
- Frontend stores access/refresh tokens and refreshes on unauthorized responses

## Authorization

- Policies are defined in `Modules/Auth/Policies/AuthorizationPolicies.cs`
- Controllers use `[Authorize]` or `[Authorize(Policy = ...)]`
- Admin-only control is enforced for Common master APIs and auth-management APIs
- Frontend also enforces role access with `ProtectedRoute`, but backend remains the primary enforcement layer
- Vendor warehouse and inventory access is further narrowed at service level by vendor-company membership and warehouse ownership

## Role Permissions

- Role-permission many-to-many is stored in `role_permissions`
- Permission codes are embedded in issued JWT claims
- Admin pages include role-permission editing against `/auth/roles/{id}/permissions`
- Inventory uses `inventory.view`, `inventory.manage`, `inventory.transfer`, and `inventory.adjust`
- Vendor management uses `vendors.view`, `vendors.manage`, and `vendors.users.manage`
- The newly added enterprise modules currently rely on authenticated role checks and admin route segmentation rather than separate seeded permission codes
- Notifications currently follow the same authenticated admin route segmentation model
- Media currently follows the same authenticated admin route segmentation model, with upload validation and audit logging enforced in the backend service layer
- Company settings currently use `AdminAccess` policy protection rather than separate seeded permission codes

## API Protection

- All business APIs except public auth endpoints require authentication
- Security headers are added in middleware:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `X-XSS-Protection`
  - `Referrer-Policy`
- Rate limiting protects anonymous and authenticated traffic
- Audit log entries are written for sensitive auth, contact, product, order, invoice, payment, payout, coupon application, shipment updates, and refund processing operations
- Media uploads additionally enforce extension, MIME-type, and file-size validation before content is accepted into managed storage
- Company profile and setting mutations are audit logged and validate referenced currency, media, and geography records on the server

# Module Dependencies

## Implemented dependencies

- `Contacts -> Auth`
  - ownership, vendor scoping, audit logs
- `Contacts -> Common`
  - contact type and address reference data
- `Products -> Auth`
  - owner/vendor scoping, audit logs
- `Products -> Common`
  - product taxonomy, currency, GST, warehouse references
- `Sales -> Products`
  - product, variant, tax, vendor pricing, inventory context
- `Sales -> Contacts`
  - customer contact references, order/invoice associations
- `Sales -> Common`
  - currency references
- `Sales -> Finance`
  - payment mode references
- `Sales -> Auth`
  - customer/vendor user relationships, audit logs
- `Inventory -> Products`
  - product, variant, and current warehouse inventory snapshot updates
- `Inventory -> Common`
  - warehouse and currency references
- `Inventory -> Auth`
  - acting user references, permission checks, audit logs
- `Inventory -> Vendors`
  - vendor-company warehouse ownership and vendor scope checks
- `Contacts -> Vendors`
  - vendor-company membership expansion for shared vendor contact visibility
- `Products -> Vendors`
  - business-level `vendor_id` persistence alongside existing `vendor_user_id`
- `Sales -> Vendors`
  - business-level vendor earnings and payout references
- `Vendors -> Auth`
  - vendor staff users are mapped from existing platform users
- `Vendors -> Common`
  - vendor address and warehouse ownership references
- `Vendors -> Finance`
  - vendor bank-account references
- `Analytics -> Sales`
  - vendor earnings, orders, and order items are the source data for summaries
- `Analytics -> Products`
  - product references for product-sales summaries
- `Analytics -> Vendors`
  - vendor references for vendor-sales summaries
- `Promotions -> Sales`
  - coupon application updates order discounts and records coupon usage against orders
- `Promotions -> Products`
  - promotion-product mappings
- `Promotions -> Auth`
  - coupon usages record the acting user and audit log activity
- `Shipping -> Sales`
  - shipments and shipment items depend on orders and order items
- `Shipping -> Auth`
  - shipment mutations are audit logged by actor
- `AfterSales -> Sales`
  - returns, refunds, order items, and optional payment references
- `AfterSales -> Products`
  - returned products and restocked inventory rows
- `AfterSales -> Common`
  - warehouse references for restocking
- `AfterSales -> Auth`
  - customer users, inspectors, and audit logs
- `Notifications -> Auth`
  - target users and operational audit context
- `Notifications -> System`
  - queue settings and channel toggles stored in `system_settings`
- `Auth -> Notifications`
  - registration and password update notifications
- `Sales -> Notifications`
  - order, payment, and vendor payout notifications
- `Shipping -> Notifications`
  - shipment shipped and delivered notifications
- `Inventory -> Notifications`
  - low inventory alerts
- `AfterSales -> Notifications`
  - return approval notifications
- `Media -> Auth`
  - uploader identity, admin access, audit logging
- `Products -> Media`
  - product image selection and media-usage tracking
- `Vendors -> Media`
  - vendor logo selection and media-usage tracking
- `Company -> Media`
  - logo and favicon references reuse managed media files
- `Company -> Common`
  - currency and geography references
- `Frontend Shell -> Company`
  - layouts, loader, login, and contact widgets consume runtime company branding/profile data

# System Workflows

## Product Creation

1. Frontend product pages submit `ProductUpsertRequest` through `productApi.ts`.
2. `ProductsController` passes the request to `ProductService`.
3. `ProductService` validates Common-master references, vendor assignments, uniqueness of SKU/slug, and multi-channel pricing rules including a mandatory retail row and valid quantity/date metadata.
4. EF persists products, variants, prices, images, inventory, vendor links, and attributes.
5. An audit log entry is written.

## Multi Channel Product Pricing

- `product_prices` is the single extension point for retail, wholesale, vendor, and offer prices; the product catalog remains unified under `products` and `product_variants`.
- Each price row can carry `price_type`, `sales_channel`, `min_quantity`, `start_date`, and `end_date`, with optional `product_variant_id` targeting for variant-scoped pricing.
- `ProductService` requires at least one retail row and keeps `products.base_price` aligned with the primary retail price for backward compatibility with existing list/detail views.
- `SalesService` resolves cart pricing in this order:
  1. active `Offer` row within the date window
  2. matching `Wholesale` row when cart quantity meets `min_quantity`
  3. matching `Vendor` row when vendor context exists
  4. matching `Retail` row
- Legacy `product_vendor_links.vendor_specific_price` remains as a fallback after vendor-price rows so existing vendor integrations keep working.

## Vendor Companies

- `Modules/Vendors` adds a dedicated business layer above vendor users without changing the existing module pattern or removing any `vendor_user_id` references.
- The new `vendors` table stores company profile fields such as company/legal name, GST, PAN, email, phone, website, logo, and status.
- `vendor_addresses` and `vendor_bank_accounts` extend the business profile with address and payout/banking metadata using existing Common and Finance masters.
- `VendorService` is the orchestration point for vendor creation, profile updates, user assignment, and vendor detail aggregation.

## Vendor User Assignment

- `vendor_users` maps one vendor business to multiple existing `users` rows that already hold the `Vendor` platform role.
- Assignment roles are stored as business roles (`Owner`, `Manager`, `Staff`) separately from the platform auth role model.
- The API surface is exposed through `/vendors` and `/vendors/{vendorId}/users` and is consumed by the new admin pages under `cxstore/src/pages/admin/vendors`.
- Vendor-company membership is now used additively when resolving vendor visibility in Products and Sales so multiple vendor staff users can work under the same business scope.

## Vendor Business Structure

- `products.vendor_id` and `product_vendor_links.vendor_id` now store the vendor company alongside existing `vendor_user_id` links.
- `purchase_orders.vendor_id`, `vendor_earnings.vendor_id`, and `vendor_payouts.vendor_id` extend Inventory and Sales records with the business-level vendor reference while keeping all current user-level references intact.
- Product creation and vendor-link updates resolve `vendor_id` from `vendor_users` automatically, so existing product forms can continue to submit `vendor_user_id`.
- Sales order settlement and vendor payouts also resolve and persist `vendor_id`, allowing reporting and future storefront/payout flows to aggregate at the company level.

## Vendor-Owned Warehouses

- Warehouse ownership is implemented by extending the existing Common `warehouses` table with nullable `vendor_id`, preserving the current master-data architecture.
- A warehouse can remain platform-owned or be assigned to a vendor company without changing the inventory table design.
- `VendorService` exposes `/vendors/warehouses` so vendor-facing frontend pages receive only warehouses owned by the actor's vendor company.
- The Common warehouse admin form now supports assigning a vendor company during create or update.

## Vendor-Scoped Access Rules

- Inventory visibility for vendor users is no longer limited to the acting `vendor_user_id`; it is expanded through `vendor_users` membership into vendor-company scope.
- `InventoryService` restricts purchase orders, transfers, warehouse inventory, product inventory, and stock movements to warehouses owned by one of the actor's vendor companies.
- `ContactService` similarly allows vendor users to collaborate on contacts assigned to other users in the same vendor company while leaving the existing contact schema unchanged.
- Admin and staff roles retain unrestricted operational access.

## Contact Creation

1. Frontend contact pages submit `ContactUpsertRequest`.
2. `ContactsController` resolves actor identity from JWT.
3. `ContactService` validates contact type/group and vendor scope.
4. EF persists contact plus addresses, emails, phones, and notes.
5. An audit log entry is written.

## Cart and Checkout

1. Storefront or authenticated user adds items using `salesApi.ts`.
2. `SalesService` resolves product, variant, vendor pricing, and session/user cart identity.
3. Cart items are created or updated in `carts` and `cart_items`.
4. Checkout converts cart items into `orders`, `order_items`, `order_status_history`, `order_addresses`, and an initial `invoice`.
5. Vendor earnings are generated per vendor order item.
6. Cart items are cleared after order creation.

## Payment Processing

1. Admin or authorized role records payment through `/payments`.
2. `SalesService` creates a `payment` plus child `payment_transaction`.
3. Invoice status is updated to `Paid` or `Partially Paid`.
4. Related order payment status is updated.
5. An audit log entry is written.

## Inventory Receiving Workflow

1. Admin creates a purchase order through `/inventory/purchase-orders`.
2. `InventoryService` validates vendor, currency, and product references, computes totals, stores `purchase_orders` and `purchase_order_items`, and writes an audit log entry.
3. Admin receives the purchase order through `/inventory/purchase-orders/{id}/receive` with a target warehouse.
4. `InventoryService` updates the existing `product_inventory` row for that product and warehouse, writes `stock_movements` and `inventory_ledgers`, marks the PO as received, and writes an audit log entry.

## Warehouse Transfer Workflow

1. Admin creates a transfer between two warehouses through `/inventory/transfers`.
2. `InventoryService` stores the transfer header and items and writes an audit log entry.
3. Completing the transfer writes paired `TRANSFER_OUT` and `TRANSFER_IN` stock movements, creates corresponding ledger records, updates source and destination `product_inventory` rows, marks the transfer completed, and writes an audit log entry.

## Vendor Warehouse Operations Workflow

1. Admin assigns a warehouse to a vendor company through the existing Common warehouse master.
2. Vendor users discover accessible warehouses through `/vendors/warehouses`.
3. Vendor inventory pages use those warehouses for purchase-order receiving, transfers, stock review, and movement history.
4. `InventoryService` enforces ownership checks on every warehouse-bound operation so vendor users cannot cross into another vendor company's stock.

## Inventory Adjustment Workflow

1. Admin posts an adjustment request to `/inventory/adjustments` with warehouse, items, and target quantities.
2. `InventoryService` compares requested quantity with the current `product_inventory` snapshot for each item.
3. The service stores `inventory_adjustments` and `inventory_adjustment_items`, writes `ADJUSTMENT` movements and ledger rows, updates snapshot quantities, and records the adjustment in the audit log.

## Vendor Analytics

- `AnalyticsService` reads live Sales data and persists period snapshots into `vendor_sales_summary` and `product_sales_summary`.
- `/analytics/vendors/{vendorId}/sales` returns vendor-level totals plus top products for the requested period.
- `/analytics/products/{productId}/sales` returns product-level quantity and revenue totals.
- `/analytics/sales-overview` returns aggregate totals for orders, sales, tax, discounts, and vendor earnings.

## Promotions and Coupons

- Promotions are stored in `promotions` and optionally targeted to products through `promotion_products`.
- Coupons are validated against active date range, usage limit, and prior order usage before application.
- Applying a coupon records `coupon_usages`, increments `used_count`, updates the target order discount, and writes an audit log entry.
- The frontend admin page supports promotion creation, coupon creation, validation, and application testing.

## Shipping and Logistics

1. Admin creates a shipment against an existing order and shipping method through `/shipments`.
2. `ShippingService` validates the order, order items, shipping method, and tracking-number uniqueness before persisting `shipments` and `shipment_items`.
3. Shipment status updates are posted to `/shipments/{id}/status` and audit logged.
4. `/shipments/{trackingNumber}` exposes tracking lookup, while `/shipments/methods` feeds the admin shipment page.

## AfterSales Returns and Refunds

1. Admin or an authorized actor creates a return request through `/returns`.
2. `AfterSalesService` validates the order and return items, then stores `returns`, `return_items`, and initial `return_status_history`.
3. Admin or staff approves the return through `/returns/{id}/approve`.
4. Refund processing through `/refunds/process` creates `refunds` and `refund_transactions`, optionally restocks inventory into a warehouse, closes the return, and writes an audit log entry.

## Vendor Payout Workflow

1. Vendor or admin requests a payout from unsettled `vendor_earnings`.
2. `SalesService` creates a `vendor_payout` and `vendor_payout_items`.
3. Admin or staff can approve and optionally mark the payout as paid.
4. When marked paid, linked vendor earnings are set to settled.

## Authentication Workflow

1. User registers or logs in through `/auth/register` or `/auth/login`.
2. `AuthService` validates credentials, writes audit logs, and issues access/refresh tokens.
3. Frontend persists tokens, then loads `/auth/me` for hydrated user state.
4. On token expiry, `httpClient.ts` triggers refresh once using the refresh token.

## Inventory Module

- The `Inventory` module remains the active warehouse-operations implementation for purchase orders, transfers, adjustments, and stock history.
- This enterprise-module phase did not replace the existing inventory architecture; it kept the current module and added Analytics, Promotions, Shipping, and active AfterSales around it.

## Notification System

- `Modules/Notifications` centralizes delivery for Email, SMS, WhatsApp, and In-App channels without introducing channel-specific tables outside the module.
- Notification dispatch is template-driven from `notification_templates`, queued in `notifications`, and operationally traced through `notification_logs`.
- `NotificationQueueProcessor` runs as a hosted worker and processes pending notifications in configurable batches.

## Email SMS WhatsApp Integration

- Channel dispatch is abstracted behind `INotificationProvider`.
- The current repository implementation includes `EmailNotificationProvider`, `SmsNotificationProvider`, and `WhatsAppNotificationProvider` as simulated transport adapters, which keeps the architecture ready for real provider credentials later.
- `InApp` notifications reuse the same queue and template system and are completed without an external transport provider.

## Notification Templates

- Seeded template codes cover:
  - `USER_REGISTRATION`
  - `PASSWORD_RESET`
  - `ORDER_CREATED`
  - `PAYMENT_SUCCESS`
  - `SHIPMENT_SHIPPED`
  - `SHIPMENT_DELIVERED`
  - `RETURN_APPROVED`
  - `VENDOR_PAYOUT_CREATED`
  - `LOW_INVENTORY_ALERT`
- Each template is channel-specific and managed through `/notifications/templates`.

## Notification Queue Processing

- Domain services enqueue notifications as part of the existing business flows instead of sending directly inside controllers.
- `NotificationQueueProcessor` polls for `Pending` rows and writes `Sent`, `Failed`, or `Skipped` outcomes with provider responses to `notification_logs`.
- Admin users can also trigger immediate queue processing through `/notifications/settings/process` and monitor queue health from the notification settings page.

## Media Library

- `Modules/Media` centralizes uploaded files and images in one module instead of letting Products, Vendors, or future CMS features store unmanaged file paths directly.
- The module stores folder hierarchy in `media_folders`, file metadata and lifecycle state in `media_files`, and cross-module attachment references in `media_usage`.
- The frontend admin surface is `pages/admin/media/MediaLibraryPage.tsx`, while reusable picking is handled through `components/media/MediaPicker.tsx`.

## File Storage Architecture

- Storage is abstracted behind `IFileStorageProvider`, with `LocalFileStorageProvider` as the current implementation.
- Files are written under `uploads/media` using GUID-based names, while `original_file_name` preserves the uploaded name for display and auditability.
- The implementation is prepared for future providers such as S3, Cloudflare R2, or Azure Blob without changing the current media data model.

## Image Processing

- Supported raster image uploads generate `thumbnail`, `medium`, and `large` derivatives under the media storage root.
- Supported document uploads keep the original asset only and still participate in the same metadata, folder, and usage-tracking flows.
- Image processing currently happens inside the media storage provider during upload, which keeps derivative creation close to the storage concern.

## Media Usage Tracking

- `MediaService.RecordUsage` and `MediaService.RemoveUsage` track where a file is attached by module, entity type, entity id, and usage type.
- Product image rows and vendor logo forms already consume the shared picker and can record usage against the central media library.
- Soft delete keeps file records recoverable through `is_deleted`, allowing admins to restore mistakenly removed assets without reuploading them.

## Company & Application Settings

- `Modules/Company` centralizes platform-level branding, billing identity, support contacts, tax details, and mutable application defaults instead of leaving those values hardcoded in the frontend or scattered across module-specific settings.
- `CompanyController` exposes the public company profile used by the frontend shell, while `CompanySettingsController` manages admin-only key-value configuration updates.
- The admin surface lives in `pages/admin/settings/company/CompanySettingsPage.tsx` and is reachable through the new `Settings -> Company` menu group.

## Company Profile Configuration

- `companies` stores display name, legal name, billing name, company code, contact details, tax identifiers, default currency, timezone, and Media-backed logo/favicon references.
- `company_addresses` stores the billing address against existing Common geography masters rather than duplicating country/state/city data outside the shared reference model.
- Frontend layouts, sidebar branding, loader visuals, login branding, and contact shortcuts now read their runtime company profile from the backend company module through `config/company.tsx`.

## Application Configuration Management

- `company_settings` stores mutable platform values such as `order_prefix`, `invoice_prefix`, `default_language`, and `date_format`.
- `CompanyService.GetApplicationSetting` provides a service-level access point for future module integrations that need centralized configuration at runtime.
- Audit logs capture `Company.ProfileUpdated`, `Company.AddressUpdated`, and `Company.SettingUpdated` so configuration changes remain traceable.

## Branding Settings

- Company logo and favicon reuse the existing Media module through `logo_media_id` and `favicon_media_id`, keeping branding assets under managed upload, checksum, and soft-delete workflows.
- The frontend company provider updates document title and favicon dynamically from backend company data, eliminating the previous hardcoded brand constants from the active runtime path.

## System Configuration Values

- Current managed values include company currency, timezone, order prefix, invoice prefix, default language, and date format.
- The design keeps the older `system_settings` infrastructure table intact while making `Modules/Company` the authoritative source for platform-facing branding and business-identity configuration.

## Audit Logs and System Monitoring

- `Modules/Monitoring` implements centralized monitoring through the existing repository module pattern: `Entities`, `Configurations`, `DTOs`, `Services`, and `Controllers`.
- The module does not create a second audit table. Instead, it extends the existing `audit_logs` model and adds `system_logs`, `error_logs`, and `login_history` as dedicated monitoring tables.
- `MonitoringController` exposes admin-only endpoints under `/api/admin/monitoring` for audit logs, system logs, error logs, and login history.
- The frontend integrates monitoring through `cxstore/src/api/monitoringApi.ts`, `cxstore/src/types/monitoring.ts`, and four admin pages under `cxstore/src/pages/admin/monitoring`.

## Audit Trail

- `audit_logs` now captures `module`, `old_values`, `new_values`, and `user_agent` in addition to actor, action, entity, IP, and timestamp.
- Existing service-level audit logging remains in place across Auth, Company, Inventory, Shipping, Promotions, Media, Products, Sales, Contacts, and AfterSales.
- `AuditMiddleware` adds centralized coverage for successful `POST`, `PUT`, `PATCH`, and `DELETE` requests and stores request-body snapshots as the new-value payload when a module does not already provide a richer diff.

## System Logs

- `system_logs` stores service-level events from monitoring and operational workflows with `service`, `event_type`, `message`, `details`, `severity`, and `created_at`.
- Current high-signal system events include `ApplicationStarted`, `SuspiciousIpActivity`, `AdminPermissionChange`, and `MassProductDeletion`.
- Severity values implemented in the service layer are `Info`, `Warning`, `Critical`, and `Debug`.

## Error Logs

- `ErrorLoggingMiddleware` captures unhandled exceptions globally and stores exception message, stack trace, source, path, actor id, IP address, and creation time in `error_logs`.
- The middleware returns a generic HTTP 500 payload to callers after logging, keeping stack traces out of client responses.
- Admin users can review error records through `/api/admin/monitoring/error-logs` and the `ErrorLogsPage` frontend screen.

## Login History

- `login_history` records login success, login failure, blocked attempts, and logout timestamps with email, IP address, device, browser, and OS metadata.
- `AuthService` now calls `ILoginHistoryService` during login success, failed login, blocked login, and logout.
- Failed and blocked attempts are stored even when no resolved user exists yet, so the persisted `user_id` is nullable in practice for that flow.

## Security Activity Tracking

- Repeated failed or blocked logins from the same IP generate a `SuspiciousIpActivity` system log.
- Role-permission updates generate an `AdminPermissionChange` system log.
- Repeated `Product.Delete` audit activity inside a short time window generates a `MassProductDeletion` monitoring event.
- The design is ready for later SIEM export or alert delivery without changing the monitoring schema.
