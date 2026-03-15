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

Latest incremental pricing migration:

- `AddMultiChannelProductPricing`

Latest incremental vendor-warehouse migration:

- `AddVendorWarehouseOwnership`

Latest enterprise-modules migration:

- `AddEnterpriseModules`

Latest notification migration:

- `AddNotificationsModule`

Latest media migration:

- `AddMediaModule`

Latest company migration:

- `AddCompanyModule`

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

Warehouse ownership extension:

- `warehouses.vendor_id -> vendors.id` is now nullable so existing shared warehouses remain valid while vendor-owned warehouses can be scoped to a vendor company.

The current frontend Common admin area is aligned only to these existing baseline-backed Common tables. It does not assume Prompt 013 tables that are not yet present in the live schema.

Additional baseline tables:

- `banks`
- `payment_modes`
- `ledger_groups`
- `transactions`
- `system_settings`
- `number_series`

Inventory module tables:

- `inventory_ledgers`
- `purchase_orders`
- `purchase_order_items`
- `stock_movements`
- `warehouse_transfers`
- `warehouse_transfer_items`
- `inventory_adjustments`
- `inventory_adjustment_items`

Vendor business tables:

- `vendors`
- `vendor_users`
- `vendor_addresses`
- `vendor_bank_accounts`

Analytics tables:

- `vendor_sales_summary`
- `product_sales_summary`

Promotion and coupon tables:

- `promotions`
- `promotion_products`
- `coupons`
- `coupon_usages`

Shipping tables:

- `shipping_providers`
- `shipping_methods`
- `shipments`
- `shipment_items`

AfterSales tables:

- `returns`
- `return_items`
- `return_status_history`
- `return_inspections`
- `restock_events`
- `inventory_ledger`
- `refunds`
- `refund_items`
- `refund_transactions`

Notification tables:

- `notification_templates`
- `notifications`
- `notification_logs`

Media tables:

- `media_folders`
- `media_files`
- `media_usage`

Company tables:

- `companies`
- `company_addresses`
- `company_settings`

Extended product pricing table:

- `product_prices`
  - `product_id`
  - `product_variant_id`
  - `currency_id`
  - `price`
  - `price_type`
  - `sales_channel`
  - `min_quantity`
  - `start_date`
  - `end_date`

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

## Inventory Schema

The `AddInventoryWarehouseModule` migration extends the active schema with warehouse-operation history and document tables while reusing the existing `warehouses` master and `product_inventory` snapshot table.

Relationships:

- `inventory_ledgers` references `products`, optional `product_variants`, `warehouses`, and `users`
- `purchase_orders` references vendor `users`, `currencies`, and creator `users`
- `purchase_order_items` references `purchase_orders`, `products`, and optional `product_variants`
- `stock_movements` references `products`, optional `product_variants`, `warehouses`, and creator `users`
- `warehouse_transfers` references source and destination `warehouses` plus creator `users`
- `warehouse_transfer_items` references `warehouse_transfers`, `products`, and optional `product_variants`
- `inventory_adjustments` references `warehouses` and creator `users`
- `inventory_adjustment_items` references `inventory_adjustments`, `products`, and optional `product_variants`

Operational note:

- `product_inventory` remains the source of truth for current warehouse quantity on hand.
- `stock_movements` and `inventory_ledgers` are append-only history tables for inventory transactions.

## Vendor Company And Warehouse Ownership Schema

The `AddVendorCompanySupport` and `AddVendorWarehouseOwnership` migrations extend the schema with a vendor business layer plus additive warehouse ownership, without removing any existing `vendor_user_id` relationships.

Relationships:

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
- `warehouses.vendor_id -> vendors.id`
- `products.vendor_id -> vendors.id`
- `product_vendor_links.vendor_id -> vendors.id`
- `purchase_orders.vendor_id -> vendors.id`
- `vendor_earnings.vendor_id -> vendors.id`
- `vendor_payouts.vendor_id -> vendors.id`

Operational note:

- `users` still represent authenticated actors, while `vendors` represent the business entity shared by multiple vendor staff users.
- Warehouse ownership is enforced in the application layer for vendor routes and inventory APIs, but the nullable foreign key keeps non-vendor shared warehouses compatible with existing data.

## Enterprise Modules Schema

The `AddEnterpriseModules` migration adds analytics, promotions, shipping, and active aftersales persistence without changing the current modular-monolith shape.

Relationships:

- `vendor_sales_summary.vendor_id -> vendors.id`
- `product_sales_summary.product_id -> products.id`
- `promotion_products.promotion_id -> promotions.id`
- `promotion_products.product_id -> products.id`
- `coupon_usages.coupon_id -> coupons.id`
- `coupon_usages.order_id -> orders.id`
- `coupon_usages.user_id -> users.id`
- `shipping_methods.provider_id -> shipping_providers.id`
- `shipments.order_id -> orders.id`
- `shipments.shipping_method_id -> shipping_methods.id`
- `shipment_items.shipment_id -> shipments.id`
- `shipment_items.order_item_id -> order_items.id`
- `returns.order_id -> orders.id`
- `returns.customer_user_id -> users.id`
- `return_items.return_id -> returns.id`
- `return_items.order_item_id -> order_items.id`
- `restock_events.warehouse_id -> warehouses.id`
- `refunds.return_id -> returns.id`
- `refund_transactions.payment_id -> payments.id`

Operational note:

- analytics summaries are derived from live `orders`, `order_items`, and `vendor_earnings`
- coupon application updates order discount totals directly and records an immutable `coupon_usages` history row
- aftersales restocking updates the existing `product_inventory` snapshot rather than introducing another warehouse-balance table

## Notification Schema

The `AddNotificationsModule` migration adds centralized queue-backed notifications without changing the current module or table layout elsewhere.

Relationships:

- `notifications.template_id -> notification_templates.id`
- `notifications.user_id -> users.id`
- `notification_logs.notification_id -> notifications.id`

Operational note:

- active templates are seeded for registration, password updates, orders, payments, shipping events, returns, vendor payouts, and low inventory alerts
- `system_settings` stores operational toggles such as `notifications.email.enabled` and `notifications.batch-size`
- `notifications` acts as the queue and delivery record, while `notification_logs` stores provider-level responses for each send attempt

## Media Schema

The `AddMediaModule` migration adds a centralized media library and local file-storage metadata model without changing the existing module layout elsewhere.

Relationships:

- `media_folders.parent_folder_id -> media_folders.id`
- `media_files.folder_id -> media_folders.id`
- `media_files.uploaded_by_user_id -> users.id`
- `media_usage.media_file_id -> media_files.id`

Operational note:

- files are initially stored under `uploads/media` through the local storage provider
- `media_files` keeps the storage path, public URL, checksum, soft-delete flag, and original upload name separately from the generated safe file name
- `media_usage` tracks where a file is used across modules such as products, vendors, CMS, users, and documents
- raster image uploads generate `thumbnail`, `medium`, and `large` derivatives, while non-raster supported files keep only the original asset

## Company Schema

The `AddCompanyModule` migration adds centralized platform company and application settings without replacing the existing `system_settings` infrastructure tables.

Relationships:

- `companies.logo_media_id -> media_files.id`
- `companies.favicon_media_id -> media_files.id`
- `companies.currency_id -> currencies.id`
- `company_addresses.company_id -> companies.id`
- `company_addresses.country_id -> countries.id`
- `company_addresses.state_id -> states.id`
- `company_addresses.city_id -> cities.id`
- `company_addresses.pincode_id -> pincodes.id`
- `company_settings.company_id -> companies.id`

Operational note:

- `companies` holds the platform branding and billing identity used by the frontend and future downstream documents
- `company_addresses` stores the current billing/location record while staying aligned with existing Common geography masters
- `company_settings` stores mutable application values such as `order_prefix`, `invoice_prefix`, `default_language`, and `date_format`
- media-backed branding keeps logo and favicon selection inside the existing managed media lifecycle instead of storing unmanaged URLs

## Monitoring Schema

The `AddMonitoringModule` migration completes the monitoring data model by extending the existing auth audit table and adding dedicated monitoring tables.

Relationships:

- `audit_logs.user_id -> users.id` (nullable)
- `error_logs.user_id -> users.id` (nullable)
- `login_history.user_id -> users.id` (nullable in practice to allow failed attempts before a user is resolved)

Operational note:

- `audit_logs` now stores `module`, `old_values`, `new_values`, and `user_agent` in addition to the existing actor/action fields
- `system_logs` stores service-level operational events with `event_type`, `message`, `details`, and severity values `Info`, `Warning`, `Critical`, and `Debug`
- `error_logs` stores exception message, stack trace, request path, source, IP, and optional user reference for unhandled failures
- `login_history` stores login success, failure, blocked attempts, and logout timestamps with device/browser/OS parsing from user-agent metadata

## Multi-Channel Product Pricing Schema

The `AddMultiChannelProductPricing` migration updates the existing `product_prices` table in place instead of introducing parallel product or price tables.

Relationships:

- `product_prices.product_id -> products.id`
- `product_prices.product_variant_id -> product_variants.id`
- `product_prices.currency_id -> currencies.id`

Behavioral constraints enforced in the application layer:

- every product must have at least one `Retail` price row
- `min_quantity` must be `>= 1`
- `start_date` and `end_date` must form a valid optional offer window
- pricing resolution order is offer -> wholesale -> vendor -> retail

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
- `audit_logs.UserId`
- `audit_logs.Module`
- `audit_logs.CreatedAt`
- `system_logs.Service`
- `error_logs.CreatedAt`
- `login_history.UserId`
- `login_history.LoginTime`

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
- `inventory.view`
- `inventory.manage`
- `inventory.transfer`
- `inventory.adjust`
- `vendors.view`
- `vendors.manage`
- `vendors.users.manage`

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
