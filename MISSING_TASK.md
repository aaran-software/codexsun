# Codexsun Missing Task Review

## Scope

This review compares:

- `ASSIST/*.md`
- `GO_LIVE_TASK.md`
- backend modules, entities, controllers, services, migrations
- frontend routes, pages, APIs, and shared UI structure
- current build and test status

## Current Validation Snapshot

- `npm run build` in `cxstore`: passed
- `dotnet test codexsun.slnx`: passed with 48/48 tests
- `dotnet build codexsun.slnx`: hit a transient `MvcTestingAppManifest.json` file-lock in `cxtest/obj`; this looks like a local concurrency/process issue, not a deterministic compile error

## P0 Missing Go-Live Tasks

### 1. Missing finance operations surface

Implemented in persistence only:

- `cxserver/Modules/Finance/Entities/FinanceEntities.cs`
- `cxserver/Modules/Finance/Configurations/FinanceConfigurations.cs`

Missing:

- finance services
- finance controllers
- finance DTOs
- finance API clients
- admin pages/forms/tables
- ledger posting from sales/refund/payment flows

Impact:

- `banks`, `payment_modes`, `ledger_groups`, and `transactions` exist in schema but are not operationally manageable from the app.

### 2. Missing system administration surface

Implemented in persistence only:

- `cxserver/Modules/System/Entities/SystemEntities.cs`
- `cxserver/Modules/System/Configurations/SystemConfigurations.cs`

Missing:

- CRUD/API for `system_settings`
- CRUD/API for `number_series`
- admin pages/forms/tables for system configuration
- operational ownership for seeded system values

Impact:

- system tables exist but are effectively hidden except for internal notification-setting reads.

### 3. Missing shipping master management

Available:

- shipment execution page and APIs

Missing:

- admin CRUD for `shipping_providers`
- admin CRUD for `shipping_methods`
- provider/service-level validation and maintenance UI

Impact:

- shipping execution exists, but shipping master data governance is incomplete.

### 4. Missing vendor lifecycle actions

Available:

- vendor create
- vendor detail update
- vendor user assignment

Missing:

- vendor deactivate/delete API
- vendor deactivate/delete UI
- vendor auditable lifecycle states beyond active/inactive display

Evidence:

- delete action in `cxstore/src/pages/admin/vendors/VendorsPage.tsx` is disabled.

### 5. Missing customer-facing contact/newsletter workflows

Missing:

- backend contact-us endpoint
- support ticket/inquiry persistence
- newsletter subscription endpoint
- admin review queue for inbound public requests

Evidence:

- `cxstore/src/pages/Contact.tsx` has a form with no connected submit workflow
- `cxstore/src/pages/Home.tsx` explicitly says newsletter is visual only

## P1 Missing Forms, Tables, and Workflow Depth

### 6. Admin forms are incomplete for promotions, shipping, and returns

Pages exist, but they are thin operator utilities rather than full management screens:

- `cxstore/src/pages/admin/promotions/PromotionsPage.tsx`
- `cxstore/src/pages/admin/shipping/ShipmentsPage.tsx`
- `cxstore/src/pages/admin/returns/ReturnsPage.tsx`

Missing:

- structured create/edit/detail flows
- reusable sectioned forms consistent with contacts/products/vendors
- status-driven action menus
- line-item selectors instead of raw numeric ids
- validation feedback and optimistic error handling
- filters, pagination, and detail drilldown parity

Evidence:

- raw fields like `Order Item Id`, `Product Id`, `Approve Return Id`, `Shipment Id`
- hardcoded create defaults for coupons/promotions
- refund amount forced as `0` in the admin refund action

### 7. Missing shipping/return/refund detail pages

Missing dedicated pages:

- shipment detail page
- return detail page
- refund detail page
- promotion detail/edit page
- coupon detail/edit page

Impact:

- current admin workflows do not support investigation-grade operational use.

### 8. Missing common masters for some seeded tables

Common master UI covers many tables, but not all seeded operational tables.

Missing admin masters for:

- banks
- payment modes
- ledger groups

Potentially also missing stronger surfaced ownership for:

- number series
- system settings

## P1 Structural and Concept Gaps

### 9. Documented structure still drifts from the live repository

Outdated docs:

- `ASSIST/STRUCTURE.md`
- `ASSIST/PROJECT_STRUCTURE.md`
- `ASSIST/FRONTEND_STRUCTURE.md`
- `ASSIST/DATABASE_TABLES.md`
- `ASSIST/API_ENDPOINTS.md`

Problems:

- documents still describe stale or partial module shapes
- some docs describe capabilities at a higher completion level than the code currently supports

### 10. Finance and system concepts are modeled but not integrated

Concepts exist in schema, but not in live business flows:

- ledger transactions are not visibly posted by payments/refunds/orders
- number series is seeded, but not exposed as a controllable numbering strategy surface
- system settings are used ad hoc instead of through a consolidated platform settings module

### 11. Frontend testing is missing

Missing:

- component tests
- page tests
- route smoke tests
- storefront checkout UI tests
- admin workflow tests

Current automated coverage is backend-heavy only.

## Tone and UX Consistency Tasks

### 12. Admin pages are not in one UX tone

Higher-quality pattern:

- users
- roles
- contacts
- products
- vendors
- common masters

Lower-consistency pattern:

- promotions
- shipments
- returns
- some monitoring utilities

Main mismatches:

- shared `CommonList` + structured form pages in some modules
- raw `<select>` / raw id-entry operational panels in others
- inconsistent density, action language, and input polish

### 13. Public marketing pages are not in the same code/style tone as storefront pages

Files:

- `cxstore/src/pages/About.tsx`
- `cxstore/src/pages/Contact.tsx`
- `cxstore/src/pages/Services.tsx`

Issues:

- semicolon-heavy style unlike most current frontend files
- raw HTML controls instead of shared UI primitives
- generic brochure copy not aligned with the rest of the storefront tone
- contact form is decorative rather than functional

### 14. Dashboard is still a mock presentation layer

File:

- `cxstore/src/pages/Dashboard.tsx`

Issues:

- KPI cards are hardcoded
- fulfillment queue is hardcoded
- merchandising signals are hardcoded
- operations feed is hardcoded

Task:

- replace dashboard mock sections with real analytics, monitoring, sales, inventory, and notification queries

### 15. Storefront still has demo/fallback language and assets

Files:

- `cxstore/src/config/company.tsx`
- `cxstore/src/pages/CheckoutPage.tsx`
- `cxstore/src/css/app.css`

Issues:

- fallback company still uses `CXStore` and `/Aspire.png`
- checkout has fallback express-delivery placeholder content
- CSS still contains weather/demo naming and dead visual leftovers

## Recommended Execution Order

1. Expose finance and system modules with proper services, DTOs, APIs, and admin UI.
2. Add shipping master management and complete vendor lifecycle actions.
3. Rebuild promotions, shipments, and returns into full detail-driven admin workflows.
4. Add public inquiry/newsletter backend workflows or remove the dormant public forms.
5. Replace dashboard mock data with real API-backed summaries.
6. Normalize public pages and lower-quality admin pages to the same component, copy, and interaction tone.
7. Clean stale docs and align `ASSIST` with the actual repository.
8. Add frontend test coverage and CI smoke gates for the major customer and admin paths.
