# Codexsun - Security Documentation

## Authentication

- JWT tokens with configurable expiry and refresh tokens
- Secrets must come from environment configuration
- JWT bearer middleware is enabled in the backend pipeline
- Refresh token rotation is enforced on refresh and logout
- Portal-based login checks are enforced for customer, vendor, and admin roles
- Passwords are stored only as BCrypt password hashes
- JWT access tokens include `UserId`, `Username`, `Role`, and `Permissions` claims
- Frontend session restore exchanges the stored refresh token for a fresh access token during app startup

## Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## CORS

- Controlled through `Cors:AllowedOrigins`
- Default local frontend origin is `http://localhost:7023`
- Credentials are allowed where required by auth flows

## Frontend Session Handling

- `cxstore` manages session state centrally in `src/state/authStore.ts`
- Authenticated frontend requests attach `Authorization: Bearer {token}`
- Frontend request handling retries a `401` once after refresh-token exchange
- Failed refresh attempts clear local auth state and return the user to login
- The auth screen now supports both sign-in and self-service signup against the existing backend auth endpoints
- Google sign-in on the frontend is configuration-driven via `VITE_GOOGLE_AUTH_URL`; without that provider URL the button remains a non-authenticating entry point and does not bypass local auth
- Customer storefront pages now also use `src/api/apiClient.ts`, which mirrors the same bearer-token and one-time refresh behavior for Axios-based React Query requests

## Rate Limiting

- Global rate limiting is enforced for all requests
- Anonymous traffic is partitioned per IP and defaults to `100` requests per `60` seconds
- Authenticated traffic is partitioned per user and defaults to `50` requests per `60` seconds
- HTTP 429 is returned on limit exceed

## Audit Logging

- `AuditLog` tracks login, failed login, password change, and admin actions
- Captures user, IP, entity type, and entity id where available
- Auth module currently records register, login, failed login, refresh, and logout actions
- Auth audit IP capture honors `X-Forwarded-For` before falling back to the direct connection address
- Inventory operations also record audit entries for purchase order creation, purchase receiving, warehouse transfer creation/completion, and inventory adjustments
- Promotions record coupon-application audit events
- Shipping records shipment creation and shipment-status updates
- AfterSales records return creation/approval and refund processing
- Notifications record queue processing outcomes in `notification_logs`, while the source business actions continue to be audited in `audit_logs`

## Security Validation

- `cxtest/AuthSecurityTests` covers password hashing, JWT validation, login attack resistance, refresh-token rotation, authorization, rate limiting, and audit logging
- Security tests validate SQL injection rejection, XSS rejection, token tampering rejection, expired-token rejection, and brute-force throttling
- The current security regression suite passes with `30` tests

## Authorization Policies

- `AdminAccess` requires role `Admin`
- `VendorAccess` requires role `Vendor`
- `CustomerAccess` requires role `Customer`
- Frontend route guards support authenticated and role-based route restriction
- All `/common/*` master-data mutation and lookup endpoints are currently protected with `AdminAccess`
- Inventory APIs require authentication and use seeded permission claims `inventory.view`, `inventory.manage`, `inventory.transfer`, and `inventory.adjust` for operation-level authorization
- Vendor-management APIs use the seeded `vendors.view`, `vendors.manage`, and `vendors.users.manage` permissions alongside authenticated role checks
- Analytics, Promotions, Shipping, and AfterSales currently use authenticated role checks and admin route segmentation rather than separate seeded permission codes
- Notifications currently use authenticated admin route segmentation rather than separate seeded permission codes

## Vendor Scope Enforcement

- Vendor access is no longer limited to a single `vendor_user_id`; the runtime now expands vendor visibility through `vendor_users` so multiple staff users in the same vendor company can operate inside one business scope.
- Warehouse access is constrained by `warehouses.vendor_id`, and vendor users can only access purchase orders, transfers, warehouse inventory, product inventory rows, and stock movements for warehouses owned by their vendor company.
- Contact visibility is also widened from single-user scope to vendor-company scope, allowing vendor staff to collaborate on shared contacts without changing the existing contact ownership schema.
- Existing `vendor_user_id` references are preserved for backward compatibility, but business-level access decisions now also consider `vendor_id` membership.

## Common Master Data Validation

- Common master requests are validated with FluentValidation before controller actions continue
- Duplicate names/codes are rejected at both service level and database index level
- Hierarchical foreign keys such as Country/State/District/City relationships are verified before create or update operations succeed
- Destination records require at least one location reference (`CountryId` or `CityId`)
- Inline related-record creation from popup autocompletes still goes through the existing validated backend create endpoints; client-side autocomplete does not bypass server-side foreign-key or uniqueness rules

## Product Pricing Validation

- Product pricing is validated server-side in `ProductService`; the frontend form does not bypass those rules.
- Each product must include at least one retail price row, every price row requires `min_quantity >= 1`, and invalid date windows are rejected before persistence.
- Cart pricing resolution is enforced on the backend, including quantity-threshold and date-window checks, so clients cannot choose a lower tier by posting a manual unit price.

## Vendor Warehouse Frontend Surface

- `cxstore` exposes vendor-specific routes for warehouses and inventory operations under the existing authenticated app shell.
- Vendor pages consume `/vendors/warehouses` instead of unrestricted master-data warehouse endpoints, so the UI receives only warehouses inside the actor's vendor-company scope.
- Backend validation remains authoritative; vendor frontend filtering is a convenience layer and not the security boundary.

## Enterprise Operations Security

- Coupon validation and application still execute discount rules on the backend; the admin page is only a client for the server-side decision.
- Shipment creation validates referenced orders, order items, and shipping methods on the backend before persistence.
- AfterSales refund processing validates return status on the backend before creating refunds or restocking inventory.

## Notification Security

- Notification dispatch remains server-side; frontend pages only manage templates, review logs, and update channel settings through authenticated admin APIs.
- Queue processing is centralized in the backend and does not expose provider credentials or delivery logic to the client.
- The current provider implementations are simulated transport adapters, which keeps the notification architecture in place without introducing hardcoded external credentials into the repository.

## Media Security

- Media uploads are validated server-side for maximum size, allowed extension, and MIME type before storage; the frontend media picker is only a client convenience layer.
- Uploaded file names are replaced with GUID-based safe names, while the original name is preserved in metadata, reducing path-collision and unsafe-name risks.
- Media deletion is soft-delete based through `media_files.is_deleted`, so admin actions do not immediately destroy the underlying content reference.
- Media access remains behind authenticated admin APIs for listing, upload, delete, restore, folder creation, move, and usage tracking, while static `/uploads` serving is limited to files that the application has already accepted into managed storage.

## Company Settings Security

- Public `GET /company` is intentionally read-only and limited to platform branding/profile data needed by the frontend shell; write operations stay behind `AdminAccess`.
- `PUT /company` and `PUT /company/settings` are admin-only and validate referenced currency, media, and geography records before persistence.
- Company audit logs record profile updates, address updates, and application-setting changes so branding and billing mutations stay traceable through the existing auth audit model.
- Moving branding into the backend company module removes the previous hardcoded frontend display-name, contact, and logo values from the runtime path, reducing drift between deployed clients and persisted platform configuration.

## Monitoring Security

- `MonitoringController` is restricted with `AdminAccess`, so audit logs, system logs, error logs, and login history remain visible only to admin users.
- `AuditMiddleware` automatically captures successful `POST`, `PUT`, `PATCH`, and `DELETE` requests with actor id, endpoint, IP address, user-agent, and request payload.
- `ErrorLoggingMiddleware` captures unhandled exceptions with stack trace, request path, IP address, and optional user id, then returns a generic error response to the client.
- Suspicious-IP alerts are emitted when repeated failed or blocked login attempts occur from the same IP inside a rolling time window.
- Admin permission changes emit system-log alerts, and repeated `Product.Delete` audit activity emits a mass-deletion security signal for future SIEM or alert integrations.

## Storefront Commerce Security

- Anonymous storefront browsing now uses dedicated `/storefront` endpoints for product listing, product detail, category discovery, and vendor discovery instead of reusing authenticated admin or vendor APIs.
- The new storefront endpoints are additive and read-only; they return only active and published catalog data and do not weaken the permission model on the existing operational controllers.
- Cart APIs already support anonymous or session-backed usage, while checkout and order-history routes remain protected behind authenticated customer access.
- Wishlist persistence now uses authenticated `/wishlist` endpoints bound to the signed-in customer account, and anonymous clients can no longer mutate wishlist state without authentication.
- Product reviews now live in the backend and require a signed-in customer with a verified prior purchase of the reviewed product; duplicate customer reviews for the same product are rejected server-side.
- Customer addresses now live behind authenticated `/storefront/addresses` endpoints instead of browser-local storage, so address data follows the same customer-bound access rules as wishlist and order history.
- Checkout now sends an idempotency key and selected shipping or payment methods to the backend, which blocks duplicate order creation for the same customer request.
- Order creation now performs reservation-backed inventory validation before checkout succeeds, and cancellation or refund flows release reserved stock through persisted reservation records.
- Razorpay checkout signatures are now verified server-side using the gateway `order_id`, returned `payment_id`, and the configured `key_secret` before the payment is accepted as authentic.
- Razorpay webhooks now validate the `X-Razorpay-Signature` header against the raw request body and configured webhook secret before any reconciliation logic runs.
- Payment recording rejects duplicate provider-reference submissions and overpayments, and Razorpay `payment.captured` events reconcile through the same backend payment write path used by manual recordings.
- Unpaid Razorpay orders now expire after the configured `Sales.PendingPaymentExpiryMinutes` threshold, at which point their inventory reservations are released and the order becomes non-payable.
- Storefront retry payment only appears for still-payable Razorpay orders; expired, cancelled, and already-paid orders cannot reopen the hosted payment flow.
- Razorpay reconciliation still requires an authenticated actor with order visibility and only marks an order paid when a captured or authorized gateway payment matching the expected order amount is found.
- Shipment auto-creation is restricted to paid or confirmed orders and returns the existing shipment if one is already present, preventing duplicate fulfillment records from repeated retries.
- Shipment listing and per-order shipment retrieval are now role-aware: customers can only see shipments tied to their own orders, vendors can only see shipments for their order items, and admin or staff retain full access.
- Commerce notification coverage is now integration-tested against real workflows, which reduces the risk of silent regression in order, payment, shipment, return, vendor payout, and low-inventory alert hooks.

## Error Monitoring

- `ErrorLoggingMiddleware` captures unhandled exceptions into `error_logs`
- `system_logs` stores operational and security events for later review
- The admin monitoring dashboard surfaces audit, system, error, and login-history data through centralized APIs

## Environment Security

- Separate development, staging, and production configuration
- Sensitive values must not be committed in source
- Local infrastructure credentials are fixed for development bootstrap only and must be rotated outside development
- Local development also seeds a bootstrap admin account for initial access; that credential must be changed or disabled outside development
- External identity provider URLs such as `VITE_GOOGLE_AUTH_URL` must be environment-specific and should point only to trusted OAuth entry points
