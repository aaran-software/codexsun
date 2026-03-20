# Codexsun - Project Log

---

CX-042
- Added `cxserver/Modules/Company` with centralized company profile, billing address, application-setting persistence, public branding retrieval, admin update APIs, audit logging, and the `AddCompanyModule` EF migration under the existing backend module pattern.
- Wired company branding to Media-backed logo and favicon references, registered the new entities in `CodexsunDbContext`, and exposed `/company` plus `/company/settings` as the platform source of truth for display name, contact details, billing identity, currency, timezone, and document prefixes.
- Added `cxstore` company APIs, types, `CompanySettingsPage`, admin menu and route wiring, runtime company provider integration for public/admin branding, and integration coverage in `cxtest/CompanyModuleTests.cs`, then revalidated backend build, frontend build, solution build, and the full test suite with 46 passing tests.

CX-041
- Added `cxserver/Modules/Media` with media folders, media files, usage tracking, local file storage, checksum generation, soft delete/restore, upload validation, and media/folder APIs under the existing backend module pattern.
- Wired static serving for `/uploads`, generated the `AddMediaModule` EF migration, added raster thumbnail generation for local image uploads, and logged media upload/delete/restore/folder-create actions through the existing audit log model.
- Added `cxstore` media APIs, types, `MediaLibraryPage`, and reusable `MediaPicker` integration for product image rows and vendor logos, then revalidated backend/frontend builds, solution build, and the full `cxtest` suite with 45 passing tests.

CX-040
- Added `cxserver/Modules/Notifications` with notification templates, queued notifications, provider logs, simulated Email/SMS/WhatsApp providers, a hosted queue processor, and admin APIs for templates, logs, and channel settings.
- Integrated notification events into the existing Auth, Sales, Shipping, Inventory, and AfterSales services for user registration, password updates, order creation, payment success, shipment shipped/delivered, return approval, vendor payout creation, and low-inventory alerts.
- Added `cxstore` notification APIs, types, admin pages, routes, and sidebar menu entries, generated the `AddNotificationsModule` EF migration, updated ASSIST documentation, and revalidated backend/frontend builds plus the full test suite with 44 passing tests.

CX-039
- Preserved the existing live `Inventory` module, activated the previously scaffolded `AfterSales` module, and added the new `Analytics`, `Promotions`, and `Shipping` modules under the existing `Modules/<ModuleName>` backend pattern.
- Registered the new entities in `CodexsunDbContext`, wired runtime services/controllers in `Program.cs`, generated the `AddEnterpriseModules` migration, and extended audit logging for coupon usage, shipment updates, and refund processing.
- Added frontend admin APIs, types, pages, routes, and sidebar groups for analytics, promotions, shipping, and returns, then revalidated the frontend build, full solution build, and the `cxtest` suite with 43 passing tests including new enterprise-module coverage.

CX-038
- Extended the existing Common `warehouses` master with nullable `vendor_id` ownership, generated the `AddVendorWarehouseOwnership` migration, and kept the current architecture intact instead of introducing a parallel vendor-warehouse table.
- Updated vendor scope enforcement across Contacts and Inventory so vendor users inherit warehouse and contact visibility through `vendor_users` company membership while preserving all existing `vendor_user_id` references.
- Added vendor-facing warehouse and inventory frontend routes, the `/vendors/warehouses` API flow, `VendorWarehousesPage`, warehouse ownership fields in the Common master UI, and `VendorWarehouseAccessTests.cs`, then revalidated backend/frontend builds and the full test suite with 40 passing tests.

CX-036
- Extended the existing `product_prices` model with multi-channel pricing fields, generated the `AddMultiChannelProductPricing` migration, and updated Products/Sales pricing logic to resolve offer, wholesale, vendor, and retail prices without splitting the product catalog.
- Updated the admin product editor and shared product types so pricing rows now capture `price_type`, `sales_channel`, `min_quantity`, and seasonal date windows on the existing product form.
- Added pricing integration coverage in `cxtest/ProductPricingTests.cs`, then revalidated backend build, frontend production build, full solution build, and the complete `cxtest` suite with 36 passing tests.

CX-035
- Added `cxserver/Modules/Inventory` with inventory ledger, purchase order, stock movement, warehouse transfer, and inventory adjustment entities, EF configurations, DTOs, services, controllers, DbContext registration, permission seeding, and the `AddInventoryWarehouseModule` migration.
- Reused the existing `warehouses` Common master and `product_inventory` Products snapshot table instead of changing the current architecture, while writing inventory history and document flows into inventory-specific tables with audit-log coverage.
- Added `cxstore` inventory APIs, types, admin pages, and sidebar navigation, then revalidated backend build, frontend production build, full solution build, and the `cxtest` integration suite including the new inventory integration test.

CX-034
- Captured the repository architecture-discovery prompt in `prompts/038.md` and updated `ASSIST/TASK.md` for a documentation-only repository analysis task.
- Analyzed the active solution structure across `cxserver`, `cxstore`, `cx.AppHost`, `.container`, `cxtest`, EF configurations, migrations, routing, and frontend API/state layers.
- Added `ASSIST/PROJECT_STRUCTURE.md` as the canonical architecture report, documenting the active backend/frontend modules, route/layout map, 60-table active schema, infrastructure wiring, security model, module dependencies, and the inactive `AfterSales` scaffolding separately from the live system.

CX-033
- Added `cxserver/Modules/Sales` with EF entities, configurations, services, REST controllers, permission seed expansion, and the `AddSalesCommerceModule` migration for carts, orders, invoices, payments, vendor earnings, and vendor payouts.
- Reused the existing Contacts, Products, Common, and Finance modules instead of creating parallel transaction masters, wiring order checkout from cart items, invoice generation from orders, payment recording against invoices, and vendor settlement generation from vendor order items.
- Added `cxstore` sales APIs, transaction types, storefront cart and checkout pages, admin and vendor Sales pages, route integration, and sidebar Sales navigation, then revalidated backend and frontend production builds.

CX-032
- Extracted a reusable frontend lookup layer under `cxstore/src/components/lookups`, including a shared `AutocompleteLookup` primitive plus common-master wrappers for country, state, district, city, and other create-capable master selections.
- Refactored `CommonUpsertDialog`, `ContactForm`, and `ProductForm` to use the same autocomplete pattern so master popups and page forms share selection, filtering, and create-on-no-results behavior.
- Kept create-on-no-results limited to common-master-backed lookups, retained non-common selectors like vendor and contact group in the same UI pattern without inline create, and revalidated the frontend production build.

CX-031
- Added `cxserver/Modules/Contacts` and `cxserver/Modules/Products` with EF entities, configurations, CRUD services, REST controllers, expanded auth permission seeds, and the `AddContactsAndProductsModules` migration.
- Reused the existing Common masters instead of duplicating them, wiring Contacts to `contact_types` and shared location masters, and wiring Products to `product_groups`, `product_types`, `units`, `currencies`, `gst_percents`, `brands`, `hsn_codes`, and `warehouses`.
- Added frontend contact/product APIs, shared editor forms, admin and vendor pages, product-category management, and sidebar/route integration, then revalidated both `cxserver` and `cxstore` builds.

CX-030
- Reworked the frontend admin UX across shared form primitives and common popup dialogs by standardizing `rounded-md` inputs, thinner dimmed focus styling, blue focus fills, keyboard submit behavior, popup spacing, and title-only modal headers.
- Updated admin list behavior with consistent sticky-row hover states, `Sl.No` naming, brighter filled status badges, single global suspense loading, and collapsible sidebar section headers that expand and collapse in place instead of navigating.
- Added `framer-motion`-powered global loader animation plus shared popup autocomplete selects that render option labels instead of IDs and support safe inline creation flows, including country creation and city-form district creation using selected state context.

CX-029
- Refactored Auth and Common seed data into cleaner reusable seed definition files, keeping `sundar@sundar.com` as the super admin while adding seeded `management`, `backoffice`, and `storefront` users mapped to the existing role model.
- Expanded the Common master seed dataset with all Indian states and union territories, all Tamil Nadu districts, major Tamil Nadu and India cities, known pincodes, richer contact/product masters, apparel-focused HSN codes, and more practical operational master defaults.
- Generated and applied the incremental `ExpandedAuthAndCommonSeedData` migration, recreated the PostgreSQL database from scratch, and revalidated backend builds, solution builds, and the full test suite.

CX-028
- Verified the frontend Common registry and Common side menu against the live backend Common controller endpoints and confirmed coverage for all currently exposed Common masters in the `ProductionBaseline` schema.
- Confirmed the Admin Common area already routes every current Common master through the shared `CommonMasterPage` instead of requiring duplicate per-master page files.
- Revalidated the frontend production build after the coverage check.

CX-027
- Reworked the frontend Common admin area to align with the actual `ProductionBaseline` schema by replacing the local placeholder Common pages with a registry-driven `CommonMasterPage` backed by live Common API clients.
- Added dedicated Common admin navigation, reusable Common API wrappers, dynamic form option loading for location-linked masters, and API-backed popup upsert flows using the existing `CommonList` and `CommonUpsertDialog` components.
- Revalidated the frontend production build and backend API project build without changing the current database baseline or breaking the existing Auth/Common module structure.

CX-026
- Deleted the previous incremental EF migration files and regenerated the backend schema as a single `ProductionBaseline` migration.
- Expanded the backend model with `banks`, `payment_modes`, `ledger_groups`, `transactions`, `system_settings`, and `number_series`, while also renaming the Auth tables to `users`, `roles`, `permissions`, `role_permissions`, `refresh_tokens`, and `audit_logs`.
- Added `country_code`, refreshed `"-"` default seed data across the shared master tables, and revalidated PostgreSQL migration application, backend tests, and full solution builds against the new baseline.

CX-025
- Renamed all Common master EF table mappings from `common_*` names to direct snake_case entity table names such as `cities`, `brands`, and `contact_types`.
- Generated and applied the `RenameCommonTables` migration so PostgreSQL tables, primary keys, foreign keys, and indexes were renamed without changing Common API routes or entity class names.
- Revalidated the backend build, Common integration tests, full solution build, and direct database table presence after the naming convention cleanup.

CX-024
- Added reusable frontend common-master management components in `cxstore/src/components/admin/CommonMasterListPage.tsx` and `cxstore/src/components/admin/CommonMasterUpsertDialog.tsx` on top of the shared `ListCommon` layout.
- Replaced the placeholder common master pages for cities, states, product types, units, and brands with shared list screens that support local search, filters, activate/deactivate actions, and popup upsert forms.
- Revalidated the frontend production build after the common-master list and modal upsert workflow rollout.

CX-023
- Added route-aware app breadcrumbs with a `Home` entry, home icon, and parent navigation back to dashboard and admin list pages from the shared `AppLayout`.
- Refined the shared admin list shell styling with tighter rounded corners, a borderless search section, a compact breadcrumb header, and sticky left/right table columns for serial numbers and action controls.
- Revalidated the frontend production build after the breadcrumb and list-shell usability updates.

CX-022
- Rebuilt `cxstore/src/components/admin/ListCommon.tsx` into a generic list-page skeleton with structured props for header, search, filters, active filter chips, table rendering, footer summaries, column visibility, sorting, and pagination.
- Refactored the existing user and role admin pages to drive the shared skeleton with page-level search, filter, and pagination state instead of duplicating list layout markup.
- Added and aligned placeholder admin list pages for permissions and selected common masters with the shared skeleton, then revalidated the frontend production build.

CX-021
- Added a reusable frontend admin header template in `cxstore/src/components/admin/ListCommon.tsx` to standardize list-page titles, descriptions, and right-aligned primary add actions.
- Updated the existing user and role admin list pages to use the shared template and added placeholder admin pages plus route wiring for permissions and selected common masters under `AppLayout`.
- Centralized admin sidebar links in `cxstore/src/components/admin/menu/admin-menu.ts` and revalidated the frontend production build after the template rollout.

CX-020
- Added `cxserver/Modules/Common` with reusable entities, EF configurations, validators, grouped controllers, and service logic for location, contact, product, order, transport, and operational master data.
- Registered the Common module in `CodexsunDbContext`, generated/applied the `CommonMasterData` migration, and seeded baseline countries, states, contact types, GST percentages, and units.
- Added `cxtest/CommonMasterDataTests.cs`, verified the Common APIs through integration tests, and revalidated the full solution build after the master-data module rollout.

CX-019
- Read `ASSIST/AI_RULES.md` and aligned the repository handoff with its prompt-capture, logging, and commit-message requirements.
- Captured the source-control request in `prompts/018.md` and updated task tracking for the full-worktree handoff.
- Prepared the repository for a full-worktree commit and push on `main`, covering the current backend, frontend, test, prompt, and documentation changes.

CX-018
- Added the supplied palette as a named `blue` theme variant in the frontend token system for both light and dark modes.
- Activated the `blue` theme at application startup so existing pages and components inherit the new palette without structural changes.
- Revalidated the frontend production build after the named theme update.

CX-017
- Replaced the frontend base theme tokens with the supplied neutral OKLCH palette for light and dark modes.
- Aligned the auth layout and login-card surfaces with the shared token system instead of older hardcoded color accents.
- Revalidated the frontend production build after the theme normalization update.

CX-016
- Tightened the auth layout and login-form spacing so the full login experience fits on a single screen without unnecessary vertical scrolling.
- Reduced outer layout padding, wrapper spacing, and internal auth-card gaps while preserving the existing sign-in, signup, and Google flows.
- Revalidated the frontend production build after the login-screen sizing fix.

CX-015
- Added `cxtest/AuthSecurityTests` with categorized password, JWT, login attack, refresh-token, authorization, rate-limit, and audit-log security coverage.
- Hardened the backend by enforcing effective global rate limiting and by honoring forwarded client IPs in Auth audit logging.
- Verified the full security suite and solution build passed after the security validation update.

CX-014
- Removed the dashboard weather demo and its backend weather dependency from the frontend workspace.
- Reworked the dashboard into an ecommerce back-office overview focused on orders, fulfillment, merchandising, store health, and admin operations.
- Revalidated the frontend build after the dashboard redesign.

CX-013
- Hardened the in-app sidebar logout flow with explicit pending-state handling and navigation after session clear.
- Added logout actions to the public web header and home page when an authenticated user is browsing the storefront.
- Revalidated the frontend build after the logout flow updates.

CX-012
- Fixed a frontend auth-state bug where `/auth/me` was called before newly issued tokens were persisted, causing a `401` after login or registration.
- Updated `authStore` to store the access token first, then hydrate the authenticated user profile in a second step.
- Revalidated the frontend production build after the auth-session fix.

CX-047
- Added `Modules/Monitoring` with centralized `system_logs`, `error_logs`, and `login_history` entities plus admin monitoring APIs for audit logs, system logs, error logs, and login history.
- Extended the existing auth `audit_logs` model with module, before/after values, and user-agent capture; added global audit/error middleware and wired login-history plus security-event logging into Auth and cross-module audit flows.
- Added `cxstore` monitoring API/types, four admin monitoring pages, sidebar/menu/routes, updated architecture documentation, and verified backend/frontend builds plus 47 passing tests.

CX-011
- Resolved a local build failure caused by a running `cx.AppHost` process locking the generated executable.
- Confirmed the frontend build remained healthy and revalidated the full solution build after clearing the process lock.
- Recorded the build-recovery task in prompt tracking and repository documentation.

CX-010
- Reworked the auth card into a three-tab flow for sign in, account creation, and Google access inside the same surface.
- Removed the runtime Google configuration error message and replaced it with a quieter in-card state while keeping same-tab provider navigation when configured.
- Increased vertical spacing on the auth page and converted the signup form to a single-column layout for cleaner alignment.

CX-009
- Captured the current repository delivery state for infrastructure, authentication, admin management, and frontend auth UI work.
- Prepared the repository for a full-worktree commit and remote push on `main` following the Codexsun AI operating rules.
CX-037
- Added `Modules/Vendors` with vendor company, vendor user, vendor address, and vendor bank account entities plus CRUD/assignment APIs.
- Extended Products, Inventory, and Sales with additive `vendor_id` references while preserving all existing `vendor_user_id` relationships and request flows.
- Added admin vendor pages and menu/routes in `cxstore`, created the `AddVendorCompanySupport` EF migration, updated project structure documentation, and verified backend/frontend builds plus 38 passing tests.

- Verified build status before source control handoff and recorded this commit/push activity in the project log.

CX-008
- Refined the `cxstore` auth screen into a wider branded sign-in surface with cleaner copy and a logo/slogan block above the form.
- Added frontend signup wiring against the existing `/auth/register` endpoint and kept session persistence through the shared auth store.
- Added a configuration-driven Google sign-in entry point, updated auth/security docs, and verified the frontend production build.

CX-048
- Implemented the customer storefront inside the existing `cxstore` app with a commerce shell, customer routes, React Query data fetching, and persisted Zustand cart and wishlist stores.
- Added public-facing pages for home, category browsing, search, product details, vendor stores, wishlist, checkout, order success, and account views without changing the repository structure.
- Connected the storefront to the current ASP.NET Core APIs where available, documented the authenticated catalog constraint and local wishlist or review fallbacks, and verified the frontend production build.

CX-007
- Added a seeded bootstrap admin user linked to the existing `Admin` role in the Auth database model.
- Stored the bootstrap account as a BCrypt password hash and created/applied the `SuperAdminSeed` EF Core migration.
- Updated task tracking and security/database documentation for the new local-development admin seed and verified the seeded row in PostgreSQL.

CX-006
- Added admin-facing Auth-module management APIs for users, roles, and role-permission assignment, including user soft delete and restore.
- Implemented `cxstore` admin pages, API clients, and a reusable admin table for user and role management under `AppLayout`.
- Added admin-only routes and navigation, created and applied the `RolePermissionUserManagement` migration, and verified backend/frontend builds.

CX-005
- Integrated `cxstore` with backend auth using centralized session state, login/logout actions, and refresh-token based session restore.
- Added authenticated HTTP handling, protected routing, and role-aware frontend navigation without redesigning the existing layouts.
- Verified the frontend build after authentication integration.

CX-004
- Processed 004 prompt to add extensive list of UI components to `cxstore`.
- Batch installed components using shadcn CLI.

CX-003
- Added `CodexsunDbContext`, EF Core migration `IdentityAuthSystem`, and PostgreSQL auth schema/seeding.
- Implemented `cxserver/Modules/Auth` with entities, DTOs, validators, JWT/password security, services, policies, and controller endpoints.
- Added integration tests covering registration, login, JWT-authenticated access, and refresh-token rotation.

CX-002
- Update `cxstore` frontend with Tailwind CSS and shadcn/ui.
- Implement WebLayout, AuthLayout, and AppLayout.
- Setup public pages and route integration.

CX-001
- Added root `.container` infrastructure for PostgreSQL and Redis with persistent volumes and fixed local ports.
- Aligned `cx.AppHost`, `cxserver`, and `cxstore` to ports `7020` through `7025`.
- Added `cxtest` with PostgreSQL connectivity validation using `SELECT 1`.

CX-049
- Normalized admin user and role upsert UX in cxstore to match the split list/create/edit pattern and sectioned form tone already used by contacts, vendors, and products.
- Added shared UserForm and RoleForm components, rewired the create and edit pages to use them, and preserved redirect-to-list behavior after save.
- Captured prompt 049, updated task tracking, and verified the frontend production build.

CX-050
- Captured the go-live hardening prompt, added a dedicated `GO_LIVE_TASKLIST.md`, and started the launch-blocker work from the current repository state instead of jumping to a broad undocumented refactor.
- Added public storefront catalog and vendor discovery endpoints in `cxserver` through dedicated anonymous controllers while preserving the existing secured admin and vendor API surface.
- Rewired the customer storefront pages in `cxstore` to use the new anonymous storefront APIs for home, category, search, product detail, and vendor store browsing, then verified backend and frontend builds.
- Hardened the existing server-backed cart flow by sending authenticated cart requests after sign-in, merging guest carts into the customer cart on auth hydration, and requiring the cart session id for anonymous item update or delete operations.
- Added `Modules/Storefront` with persistent wishlist and product-review entities, customer-authenticated wishlist APIs, anonymous public review reads, and verified-purchase review writes.
- Replaced storefront local wishlist and review placeholders with backend API clients, backend-driven rating and review-count fields on product responses, and customer account integration for saved products and submitted reviews.
- Added idempotent checkout submission in `Modules/Sales`, persisted selected shipping and payment methods on orders, and generated the `AddCheckoutResilienceAndReservations` migration.
- Added explicit `order_inventory_reservations` records so order placement reserves stock, order cancellation releases reservations, refund completion releases reserved stock, and duplicate payment references or overpayments are rejected server-side.

CX-051
- Added Razorpay-backed online payment initialization and reconciliation in `Modules/Sales`, including provider settings, gateway order creation, checkout signature verification, webhook verification, and payment capture reconciliation without introducing a new payment module.
- Extended the `orders` aggregate with provider and gateway-order tracking, generated the `AddRazorpayPaymentIntegration` migration, and kept payment recording inside the existing Sales payment flow so invoice, order, and notification updates remain consistent.
- Reworked the storefront checkout to use a real hosted Razorpay Checkout flow with UPI support, removed the old fake Stripe and PayPal options, and verified backend and frontend production builds.

CX-052
- Added a configurable unpaid-payment expiry policy to `Modules/Sales` through `SalesSettings.PendingPaymentExpiryMinutes` and applied it to unpaid Razorpay orders before order retrieval and payment initialization flows.
- Expired Razorpay orders now release inventory reservations, transition to `Expired`, and record status-history entries instead of lingering indefinitely as payable pending orders.
- Reused the existing Razorpay checkout path from storefront account order history so customers can retry payment on still-payable orders without creating a duplicate order, then revalidated backend and frontend production builds.

CX-053
- Added Razorpay order-payment reconciliation in `Modules/Sales` so unpaid orders can be checked directly against Razorpay order payments and repaired after delayed or missed webhooks.
- Extended `Modules/Shipping` with auto-shipment creation from paid or confirmed orders, reused during payment completion and as an explicit admin shipping operation, while preventing duplicate shipment creation for the same order.
- Updated storefront and shipping admin clients for payment recheck and one-click shipment creation, then revalidated backend and frontend production builds.

CX-054
- Added role-aware shipment visibility in `Modules/Shipping`, including per-order shipment retrieval and customer-safe shipment filtering on the existing authenticated shipping API surface.
- Updated storefront account and order-success pages to display shipment status, provider, and tracking details directly from backend shipping data.
- Captured prompt 054, updated task tracking, and revalidated backend and frontend production builds after stopping a stale backend process lock.

CX-055
- Replaced storefront local-only address storage with a backend-backed customer address book in `Modules/Storefront`, including the `customer_addresses` table, authenticated `/storefront/addresses` CRUD endpoints, and the `AddStorefrontCustomerAddresses` migration.
- Updated checkout to hydrate from the saved default address and persist the current shipping address back to the backend after successful order creation instead of using browser local storage.
- Extended the storefront account page with a lightweight customer address-book editor, updated go-live documentation for the new production-ready address flow, and revalidated backend and frontend builds.

CX-056
- Captured prompt 056 and added integration coverage in `cxtest/NotificationsModuleTests.cs` for the required commerce notification events: order created, payment success, shipment shipped, shipment delivered, return approved, vendor payout created, and low inventory alert.
- Fixed a real `SalesService.CreateOrderAsync` invoice-generation bug by attaching product navigation data to new order items before building invoice lines.
- Fixed the Razorpay pending-order expiry query to use SQL-translatable status predicates, then revalidated the notification test suite and backend build.

CX-057
- Captured prompt 057, reviewed `ASSIST/AI_RULES.md` plus the supporting `ASSIST` documentation, and documented the actual project shape and workflow from the live repository state.
- Added `GO_LIVE_TASK.md` with prioritized launch blockers, readiness work, and repository-cleanup findings based on code, config, documentation drift, build results, and test results.
- Revalidated the current runtime state: backend build passed, frontend production build passed, and the test suite currently fails because EF Core reports pending model changes during application startup migration.

CX-058
- Captured prompt 058, re-read the `ASSIST` guidance, and reviewed the implemented backend, frontend, and documentation layers against go-live readiness with focus on missing forms, tables, entities, concepts, and structural drift.
- Added `MISSING_TASK.md` with a project-wide gap report covering persistence-only finance and system modules, missing shipping and vendor lifecycle surfaces, incomplete admin workflows, public-form gaps, tone inconsistencies, and stale documentation alignment issues.
- Revalidated the current runtime state: frontend production build passed, `dotnet test codexsun.slnx` passed with 48 tests, and one concurrent `dotnet build codexsun.slnx` run hit a transient `MvcTestingAppManifest.json` file-lock under `cxtest/obj`.



