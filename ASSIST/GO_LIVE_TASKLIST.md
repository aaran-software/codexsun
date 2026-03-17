# Production Ready Plan

This file contains only the practical steps required to make the current Codexsun platform production-ready.

## 1. Production Configuration

1. Set production backend secrets
- database connection string
- Redis connection string
- JWT secret
- Razorpay keys
- Razorpay webhook secret
- notification provider credentials

2. Set required payment configuration
- `Razorpay:Enabled = true`
- `Razorpay:KeyId`
- `Razorpay:KeySecret`
- `Razorpay:WebhookSecret`
- `Razorpay:MerchantName`
- `Razorpay:ThemeColor`
- `Sales:PendingPaymentExpiryMinutes`

3. Set production frontend configuration
- correct API base URL
- correct allowed frontend origin in backend CORS
- correct company branding values

4. Set company runtime data
- display name
- legal name
- billing name
- support email
- phone
- website
- logo
- favicon
- default currency
- timezone
- order prefix
- invoice prefix

## 2. Deployment Infrastructure

1. Prepare production services
- PostgreSQL
- Redis
- backend host
- frontend host
- media storage path or persistent mounted volume

2. Enable HTTPS
- production domain
- SSL certificate
- reverse proxy or ingress

3. Enable backups
- database backup schedule
- media backup plan
- tested restore procedure

## 3. Database Readiness

1. Apply all migrations

2. Verify essential tables exist
- `users`
- `roles`
- `permissions`
- `companies`
- `media_files`
- `products`
- `product_prices`
- `orders`
- `payments`
- `order_inventory_reservations`
- `shipments`
- `returns`
- `notifications`
- `audit_logs`
- `system_logs`
- `error_logs`
- `login_history`

3. Seed required operational data
- currencies
- warehouses
- shipping providers
- shipping methods
- payment modes
- tax masters
- units
- admin user

## 4. Catalog Readiness

1. Verify active public catalog data
- categories
- products
- vendor store data
- images
- prices
- stock

2. Verify pricing rules
- retail price exists for each sellable product
- offer windows are valid
- wholesale rows are valid
- vendor pricing is valid where used

## 5. Storefront Readiness

1. Verify anonymous browsing
- home page
- category page
- search
- product detail
- vendor store page

2. Verify customer account features
- signup or login
- wishlist persistence
- review submission
- account orders page

3. Verify cart behavior
- guest cart
- cart merge after login
- quantity update
- remove item
- clear cart

## 6. Checkout Readiness

1. Verify order creation
- address entry
- shipping selection
- payment selection
- coupon application
- idempotent order submission

2. Verify inventory reservation
- stock is reserved on order creation
- stock is released on cancel
- stock is released on expiry
- stock is released on refund flow where applicable

3. Verify failure safety
- repeat submit does not create duplicate order
- overpayment is blocked
- duplicate payment reference is blocked

## 7. Razorpay And UPI Readiness

1. Verify hosted checkout
- UPI
- card
- netbanking if enabled
- dismiss flow
- success flow
- failed flow

2. Verify server-side security
- checkout signature verification
- webhook signature verification

3. Verify reconciliation
- captured payment updates order
- failed payment updates order
- missed webhook can be repaired by reconciliation

4. Verify expiry
- unpaid Razorpay order expires after configured threshold
- expired order cannot be paid again
- expired order releases inventory reservations

5. Configure live webhook
- public HTTPS webhook URL
- correct Razorpay event subscription

## 8. Shipping Readiness

1. Verify shipping methods are usable from checkout

2. Verify shipment creation
- manual shipment creation
- auto-shipment creation from paid or confirmed orders
- delivered status update

3. Verify customer visibility
- shipment is visible after order payment
- tracking view works

## 9. Returns And Refunds Readiness

1. Verify return request flow
- request return
- approve return
- process refund

2. Verify inventory consistency after return or refund

## 10. Notification Readiness

1. Verify critical notifications
- order created
- payment success
- shipment shipped
- shipment delivered
- return approved

2. Verify provider delivery for production-enabled channels

## 11. Security Readiness

1. Verify role boundaries
- public endpoints only expose intended public data
- customer endpoints require customer auth
- vendor endpoints stay vendor-scoped
- admin endpoints require admin access

2. Verify audit and monitoring
- audit logs are written
- system logs are written
- error logs are written
- login history is written

3. Verify basic production controls
- rate limiting
- CORS
- secure secret storage
- HTTPS only

## 12. Production Validation

Run this exact production smoke test:

1. Open storefront home page
2. Search for a product
3. Open product detail page
4. Add product to cart
5. Sign in as customer
6. Verify cart is preserved
7. Complete checkout with Razorpay UPI
8. Confirm order becomes paid
9. Confirm shipment record exists
10. Open account orders page
11. Confirm payment and shipment status are visible
12. Run one failed-payment scenario
13. Run one payment-reconciliation scenario
14. Run one return or refund scenario if allowed in staging or pre-live

## 13. Production Ready Decision

Production ready means all of the below are true:

- production secrets are configured
- production HTTPS is live
- migrations are applied
- public storefront works anonymously
- cart works
- checkout works
- Razorpay UPI payment works
- missed webhook reconciliation works
- unpaid expiry works
- shipment creation works
- monitoring works
- production smoke test passes

If any one of these is not complete, the system is not production-ready.
