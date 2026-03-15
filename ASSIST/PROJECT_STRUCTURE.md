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
- `VendorsController` -> `/vendors*`, `/vendors/warehouses`
- `VendorUsersController` -> `/vendors/{vendorId}/users`

Not currently active:

- `Modules/Finance` and `Modules/System` define entities/configurations only
- `Modules/AfterSales` contains entities, DTOs, configurations, and service code, but it is not wired into `Program.cs`, not exposed by `CodexsunDbContext`, has no controllers, and is not present in migrations

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

- Purpose on disk: returns, inspections, restocking, refunds, refund transactions
- Domain entities:
  - `Return`, `ReturnItem`, `ReturnStatusHistory`, `ReturnInspection`
  - `RestockEvent`, `InventoryLedgerEntry`
  - `Refund`, `RefundItem`, `RefundTransaction`
- Application service: partial `AfterSalesService`
- API layer: none
- Database status: not in `CodexsunDbContext` and not migrated
- Architectural conclusion: scaffolded/incomplete module, not part of the active runtime architecture yet

# Frontend Architecture

## Application Root

`cxstore/src` is the frontend root. Main folders:

- `api/` -> HTTP clients per domain
- `components/` -> layouts, admin UI, forms, lookups, shared primitives, shadcn-style UI components
- `config/` -> company metadata
- `css/` -> global app stylesheet
- `hooks/` -> small shared hooks
- `lib/` -> registry/config helpers
- `pages/` -> route-level screens
- `state/` -> auth state store
- `types/` -> TypeScript contracts aligned to backend DTOs

## Frontend Folder Structure

There is no `cxstore/src/modules` folder. The frontend is organized by cross-cutting folders plus route folders under `pages/admin/*`.

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

## Frontend State Management

- Global auth/session state is implemented in `state/authStore.ts`
- Storage-backed state includes access token, refresh token, expiry, and current user
- Session restore runs from `main.tsx` through `initializeAuth()`
- Auth store handles refresh-token retry and logout cleanup
- No Redux, Zustand, MobX, or React Query is used

## Frontend API Integration

- All API calls go through `api/httpClient.ts`
- `requestJson()` injects bearer tokens, retries once on `401` using refresh token flow, and throws typed `HttpError`
- Domain API clients:
  - `authApi.ts`
  - `commonApi.ts`
  - `locationApi.ts`
  - `brandApi.ts`, `colourApi.ts`, `sizeApi.ts`, `unitApi.ts`, `hsnApi.ts`
  - `contactApi.ts`
- `productApi.ts`
- `salesApi.ts`
- `inventoryApi.ts`
- `vendorApi.ts`
- `userApi.ts`, `roleApi.ts`

# Frontend Modules

## Public / Storefront

- Pages: `Home`, `About`, `Services`, `Contact`, `CartPage`, `CheckoutPage`
- Layout: `WebLayout`
- Purpose: marketing/storefront shell plus cart and checkout entry points

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
- `/cart`
- `/checkout`

This is the public storefront shell with top navigation, theme toggle, footer, and optional authenticated dashboard link.

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
  - `/admin/common/*`
- vendor:
  - `/vendor`
  - `/vendor/contacts*`
  - `/vendor/products*`
  - `/vendor/sales/*`
  - `/vendor/warehouses`
  - `/vendor/inventory/*`
- customer:
  - `/account/orders`
  - `/orders/:id`
  - `/account/invoices`
  - `/account/invoices/:id`

`ProtectedRoute` wraps these route groups and enforces allowed roles.

Vendor route usage inside `AppLayout` is now split as:

- `/vendor/contacts*`, `/vendor/products*`, `/vendor/sales/*` -> vendor-scoped transactional pages
- `/vendor/warehouses` -> vendor-company owned warehouse list
- `/vendor/inventory/*` -> vendor-scoped purchase orders, transfers, inventory summaries, and stock movements

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

The active schema currently contains 72 mapped tables.

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

## Inactive / Not-Migrated Database Design

`Modules/AfterSales` defines planned tables:

- `returns`
- `return_items`
- `return_status_history`
- `return_inspections`
- `restock_events`
- `inventory_ledger`
- `refunds`
- `refund_items`
- `refund_transactions`

These are configuration-level definitions only. They are not part of the active schema because they are not registered in `CodexsunDbContext` and do not appear in migrations.

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

## Finance module

- Tables: `banks`, `payment_modes`, `ledger_groups`, `transactions`
- Relationships: transactions reference bank, payment mode, and ledger group

## System module

- Tables: `system_settings`, `number_series`
- Relationships: standalone configuration tables

## AfterSales module

- Planned tables only: `returns`, `return_items`, `return_status_history`, `return_inspections`, `restock_events`, `inventory_ledger`, `refunds`, `refund_items`, `refund_transactions`
- Relationships: designed to bridge orders, order items, products, contacts, warehouses, payments
- Status: not active

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

## Vendors API

- `VendorsController` -> `/vendors`, `/vendors/{id}`, `/vendors/warehouses`
- `VendorUsersController` -> `/vendors/{vendorId}/users`
- Responsible module: `Vendors`

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

## API Protection

- All business APIs except public auth endpoints require authentication
- Security headers are added in middleware:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `X-XSS-Protection`
  - `Referrer-Policy`
- Rate limiting protects anonymous and authenticated traffic
- Audit log entries are written for sensitive auth, contact, product, order, invoice, payment, and payout operations

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

## Planned but inactive dependencies

- `AfterSales -> Sales`
- `AfterSales -> Products`
- `AfterSales -> Common`
- `AfterSales -> Auth`

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

## AfterSales Workflow Status

Return/refund/restock workflows are partially coded in `Modules/AfterSales`, but they are not wired into the active application. They should be treated as planned architecture, not live functionality.
