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
|   |   |-- AuthSeedData.cs
|   |   |-- CodexsunDbContext.cs
|   |   `-- CodexsunDbContextFactory.cs
|   |-- Migrations/
|   |   |-- 20260314133756_ProductionBaseline.cs
|   |   |-- 20260314133756_ProductionBaseline.Designer.cs
|   |   |-- 20260314143943_ExpandedAuthAndCommonSeedData.cs
|   |   |-- 20260314143943_ExpandedAuthAndCommonSeedData.Designer.cs
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
|           |   |-- LocationSeedData.cs
|           |   |-- OperationalSeedData.cs
|           |   `-- ProductSeedData.cs
|           |-- Controllers/
|           |-- DTOs/
|           |-- Entities/
|           |-- Services/
|           `-- Validators/
|       |-- Finance/
|       |   |-- Configurations/
|       |   `-- Entities/
|       |-- System/
|       |   |-- Configurations/
|       |   `-- Entities/
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
|       |   |-- brandApi.ts
|       |   |-- colourApi.ts
|       |   |-- commonApi.ts
|       |   |-- hsnApi.ts
|       |   |-- httpClient.ts
|       |   |-- locationApi.ts
|       |   |-- roleApi.ts
|       |   |-- sizeApi.ts
|       |   |-- unitApi.ts
|       |   `-- userApi.ts
|       |-- components/
|       |   |-- admin/
|       |   |   |-- AdminListPlaceholder.tsx
|       |   |   `-- menu/
|       |   |       `-- admin-menu.ts
|       |   |-- blocks/
|       |   |-- forms/
|       |   |   |-- CommonList.tsx
|       |   |   |-- CommonUpsertDialog.tsx
|       |   |   |-- ProtectedRoute.tsx
|       |   |   |-- commonMasterTypes.ts
|       |   |   |-- useCommonListState.tsx
|       |   |   `-- useCommonMasterState.tsx
|       |   |-- layout/
|       |   `-- table/
|       |       `-- AdminTable.tsx
|       |-- css/
|       |-- lib/
|       |-- pages/
|       |   `-- admin/
|       |       |-- common/
|       |       |   `-- CommonMasterPage.tsx
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
|       |-- hooks/
|       |-- state/
|       |   `-- authStore.ts
|       `-- types/
|           |-- admin.ts
|           |-- auth.ts
|           `-- common.ts
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
