# Codexsun - Project Log

---

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
