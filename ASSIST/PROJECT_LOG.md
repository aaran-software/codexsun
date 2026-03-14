# Codexsun - Project Log

---

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
- Verified build status before source control handoff and recorded this commit/push activity in the project log.

CX-008
- Refined the `cxstore` auth screen into a wider branded sign-in surface with cleaner copy and a logo/slogan block above the form.
- Added frontend signup wiring against the existing `/auth/register` endpoint and kept session persistence through the shared auth store.
- Added a configuration-driven Google sign-in entry point, updated auth/security docs, and verified the frontend production build.

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
