# Codexsun - Repository Structure

```text
codexsun/
|
|-- ASSIST/                              <- Project control
|-- .container/                          <- Local infrastructure assets
|   |-- docker-compose.yml
|   |-- env/
|   |   `-- dev.env
|   |-- postgres/
|   |   |-- Dockerfile
|   |   `-- init/
|   |       `-- init.sql
|   `-- redis/
|       `-- redis.conf
|
|-- prompts/                             <- Captured user prompts
|   |-- 006.md
|   |-- 019.md
|   `-- ...
|
|-- cx.AppHost/                          <- .NET Aspire orchestrator
|
|-- cxcore/                              <- Shared domain
|   `-- Domain/
|       |-- Common/
|       |-- Users/
|       |-- Roles/
|       |-- Customers/
|       |-- Contacts/
|       |-- Suppliers/
|       |-- Staff/
|       |-- Vendors/
|       |-- Addresses/
|       |-- Cities/
|       |-- States/
|       `-- CXCore/
|           |-- Common/
|           |-- Address/
|           |-- Shared/
|           `-- Master/
|
|-- cxlib/                               <- Shared contracts and utilities
|
|-- cxbilling/                           <- Billing domain
|-- cxmarketing/                         <- Marketing domain
|-- cxanalytics/                         <- Analytics domain
|
|-- cxserver/                            <- API layer
|   |-- Middleware/
|   |-- Infrastructure/
|   |   |-- CodexsunDbContext.cs
|   |   `-- CodexsunDbContextFactory.cs
|   |-- Migrations/
|   |   |-- 20260314032724_IdentityAuthSystem.cs
|   |   |-- 20260314032724_IdentityAuthSystem.Designer.cs
|   |   |-- 20260314041852_RolePermissionUserManagement.cs
|   |   |-- 20260314041852_RolePermissionUserManagement.Designer.cs
|   |   |-- 20260314044451_SuperAdminSeed.cs
|   |   |-- 20260314044451_SuperAdminSeed.Designer.cs
|   |   |-- 20260314085639_CommonMasterData.cs
|   |   |-- 20260314085639_CommonMasterData.Designer.cs
|   |   |-- 20260314122531_RenameCommonTables.cs
|   |   |-- 20260314122531_RenameCommonTables.Designer.cs
|   |   `-- CodexsunDbContextModelSnapshot.cs
|   `-- Modules/
|       |-- Auth/
|       |   |-- Controllers/
|       |   |   `-- AuthController.cs
|       |   |-- DTOs/
|       |   |   |-- CreateRoleRequest.cs
|       |   |   |-- CreateUserRequest.cs
|       |   |   |-- LoginRequest.cs
|       |   |   |-- PermissionResponse.cs
|       |   |   |-- RefreshTokenRequest.cs
|       |   |   |-- RegisterRequest.cs
|       |   |   |-- RoleDetailResponse.cs
|       |   |   |-- RoleListItemResponse.cs
|       |   |   |-- TokenResponse.cs
|       |   |   |-- UpdateRolePermissionsRequest.cs
|       |   |   |-- UpdateRoleRequest.cs
|       |   |   |-- UpdateUserRequest.cs
|       |   |   |-- UserDetailResponse.cs
|       |   |   `-- UserListItemResponse.cs
|       |   |-- Entities/
|       |   |   |-- AuditLog.cs
|       |   |   |-- Permission.cs
|       |   |   |-- RefreshToken.cs
|       |   |   |-- Role.cs
|       |   |   |-- RolePermission.cs
|       |   |   `-- User.cs
|       |   |-- Policies/
|       |   |   `-- AuthorizationPolicies.cs
|       |   |-- Security/
|       |   |   |-- JwtSettings.cs
|       |   |   |-- JwtTokenGenerator.cs
|       |   |   `-- PasswordHasher.cs
|       |   |-- Services/
|       |   |   |-- AuthService.cs
|       |   |   |-- JwtTokenService.cs
|       |   |   `-- PasswordService.cs
|       |   `-- Validators/
|       |       |-- LoginValidator.cs
|       |       `-- RegisterValidator.cs
|       `-- Common/
|           |-- Configurations/
|           |-- Controllers/
|           |-- DTOs/
|           |-- Entities/
|           |-- Services/
|           `-- Validators/
|       |-- Admin/
|       |-- VendorDashboard/
|       `-- CXCore/
|           |-- Common/
|           |-- Address/
|           |-- Shared/
|           `-- Master/
|
|-- cxstore/                             <- React frontend
|   `-- src/
|       |-- api/
|       |   |-- authApi.ts
|       |   |-- httpClient.ts
|       |   |-- roleApi.ts
|       |   `-- userApi.ts
|       |-- components/
|       |   |-- ProtectedRoute.tsx
|       |   |-- admin/
|       |   |   |-- CommonMasterListPage.tsx
|       |   |   |-- CommonMasterUpsertDialog.tsx
|       |   |   |-- AdminListPlaceholder.tsx
|       |   |   |-- ListCommon.tsx
|       |   |   `-- menu/
|       |   |       `-- admin-menu.ts
|       |   |-- layout/
|       |   |-- login-form.tsx
|       |   `-- table/
|       |       `-- AdminTable.tsx
|       |-- css/
|       |-- lib/
|       |-- pages/
|       |   `-- admin/
|       |       |-- common/
|       |       |   |-- BrandsPage.tsx
|       |       |   |-- CitiesPage.tsx
|       |       |   |-- ProductTypesPage.tsx
|       |       |   |-- StatesPage.tsx
|       |       |   `-- UnitsPage.tsx
|       |       |-- permissions/
|       |       |   |-- PermissionsPage.tsx
|       |       |   `-- RolePermissionEditor.tsx
|       |       |-- roles/
|       |       |   |-- RoleCreatePage.tsx
|       |       |   |-- RoleEditPage.tsx
|       |       |   `-- RolesPage.tsx
|       |       `-- users/
|       |           |-- UserCreatePage.tsx
|       |           |-- UserEditPage.tsx
|       |           `-- UsersPage.tsx
|       |-- state/
|       |   `-- authStore.ts
|       |-- hooks/
|       `-- types/
|           |-- admin.ts
|           `-- auth.ts
|
|-- cxtest/                              <- xUnit infrastructure validation tests
|   |-- AuthSecurityTests/
|   |   |-- AuditLogTests.cs
|   |   |-- AuthorizationTests.cs
|   |   |-- AuthSecurityTestSupport.cs
|   |   |-- JwtSecurityTests.cs
|   |   |-- LoginAttackTests.cs
|   |   |-- PasswordSecurityTests.cs
|   |   |-- RateLimitTests.cs
|   |   `-- RefreshTokenTests.cs
|   |-- CommonMasterDataTests.cs
|   `-- TestAssembly.cs
|
`-- codexsun.slnx
```
