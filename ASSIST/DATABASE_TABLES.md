# Database Structure

Central Database Context: `CodexsunDbContext`
Provider: PostgreSQL via Entity Framework Core

## Auth & Permissions
- `users`, `roles`, `permissions`, `role_permissions`, `refresh_tokens`, `audit_logs`
- **Keys**: `Id` as Primary Keys. `UserId`, `RoleId`, `PermissionId` as Foreign Keys.

## System & Settings
- `system_settings`, `number_series`, `system_logs`, `error_logs`, `login_history`

## Geographical & Locations
- `countries`, `states`, `districts`, `cities`, `pincodes`

## Common Masters
- `contact_types`, `product_types`, `product_groups`, `hsn_codes`, `units`, `gst_percents`, `colours`, `sizes`, `order_types`, `styles`, `brands`, `transports`, `destinations`, `currencies`, `payment_terms`, `payment_modes`, `banks`

## Company & Contacts
- `companies`, `company_addresses`, `company_settings`
- `contact_groups`, `contacts`, `contact_addresses`, `contact_emails`, `contact_phones`, `contact_notes`
- **Relationships**: `ContactId` maps to its respective entities.

## Products & Catalog
- `product_categories`, `products`, `product_variants`, `product_prices`, `product_images`, `product_inventory`, `product_vendor_links`, `product_attributes`, `product_attribute_values`
- **Relationships**: Products map to Variants, Categories, and Brands.

## Vendors
- `vendors`, `vendor_users`, `vendor_addresses`, `vendor_bank_accounts`, `vendor_sales_summaries`, `vendor_earnings`, `vendor_payouts`, `vendor_payout_items`
- **Relationships**: `VendorId` is central, linking back to Products (`product_vendor_links`) and Sales.

## Sales, Cart & Orders
- `carts`, `cart_items`
- `orders`, `order_items`, `order_status_history`, `order_addresses`
- `invoices`, `invoice_items`
- `payments`, `payment_transactions`

## Inventory
- `warehouses`, `inventory_ledgers`, `purchase_orders`, `purchase_order_items`, `stock_movements`, `warehouse_transfers`, `warehouse_transfer_items`, `inventory_adjustments`, `inventory_adjustment_items`

## Promotions & Shipping
- `promotions`, `promotion_products`, `coupons`, `coupon_usages`
- `shipping_providers`, `shipping_methods`, `shipments`, `shipment_items`

## Media & Notifications
- `media_folders`, `media_files`, `media_usages`
- `notification_templates`, `notifications`, `notification_logs`

## After-Sales
- `returns`, `return_items`, `return_status_history`, `return_inspections`, `restock_events`, `refunds`, `refund_items`, `refund_transactions`
