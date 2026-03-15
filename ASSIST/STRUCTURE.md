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
|   |-- 032.md
|   |-- 033.md
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
|   |   |-- 20260314165636_AddContactsAndProductsModules.cs
|   |   |-- 20260314165636_AddContactsAndProductsModules.Designer.cs
|   |   |-- 20260314184850_AddSalesCommerceModule.cs
|   |   |-- 20260314184850_AddSalesCommerceModule.Designer.cs
|   |   |-- 20260315132411_AddInventoryWarehouseModule.cs
|   |   |-- 20260315132411_AddInventoryWarehouseModule.Designer.cs
|   |   |-- 20260315134829_AddMultiChannelProductPricing.cs
|   |   |-- 20260315134829_AddMultiChannelProductPricing.Designer.cs
|   |   |-- 20260315143615_AddVendorCompanySupport.cs
|   |   |-- 20260315143615_AddVendorCompanySupport.Designer.cs
|   |   |-- 20260315151649_AddVendorWarehouseOwnership.cs
|   |   |-- 20260315151649_AddVendorWarehouseOwnership.Designer.cs
|   |   |-- 20260315153639_AddEnterpriseModules.cs
|   |   |-- 20260315153639_AddEnterpriseModules.Designer.cs
|   |   |-- 20260315160147_AddNotificationsModule.cs
|   |   |-- 20260315160147_AddNotificationsModule.Designer.cs
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
|       |-- Contacts/
|       |   |-- Configurations/
|       |   |   `-- ContactConfigurations.cs
|       |   |-- Controllers/
|       |   |   `-- ContactsController.cs
|       |   |-- DTOs/
|       |   |   |-- ContactRequests.cs
|       |   |   `-- ContactResponses.cs
|       |   |-- Entities/
|       |   |   `-- ContactEntities.cs
|       |   `-- Services/
|       |       `-- ContactService.cs
|       |-- Products/
|       |   |-- Configurations/
|       |   |   `-- ProductConfigurations.cs
|       |   |-- Controllers/
|       |   |   `-- ProductsController.cs
|       |   |-- DTOs/
|       |   |   |-- ProductRequests.cs
|       |   |   `-- ProductResponses.cs
|       |   |-- Entities/
|       |   |   `-- ProductEntities.cs
|       |   `-- Services/
|       |       `-- ProductService.cs
|       |-- Sales/
|       |   |-- Configurations/
|       |   |   `-- SalesConfigurations.cs
|       |   |-- Controllers/
|       |   |   |-- CartController.cs
|       |   |   |-- InvoicesController.cs
|       |   |   |-- OrdersController.cs
|       |   |   |-- PaymentsController.cs
|       |   |   `-- VendorPayoutsController.cs
|       |   |-- DTOs/
|       |   |   |-- SalesRequests.cs
|       |   |   `-- SalesResponses.cs
|       |   |-- Entities/
|       |   |   `-- SalesEntities.cs
|       |   `-- Services/
|       |       `-- SalesService.cs
|       |-- Inventory/
|       |   |-- Configurations/
|       |   |   `-- InventoryConfigurations.cs
|       |   |-- Controllers/
|       |   |   |-- InventoryController.cs
|       |   |   |-- PurchaseOrdersController.cs
|       |   |   |-- StockMovementsController.cs
|       |   |   `-- WarehouseTransfersController.cs
|       |   |-- DTOs/
|       |   |   |-- InventoryRequests.cs
|       |   |   `-- InventoryResponses.cs
|       |   |-- Entities/
|       |   |   `-- InventoryEntities.cs
|       |   `-- Services/
|       |       `-- InventoryService.cs
|       |-- Analytics/
|       |   |-- Configurations/
|       |   |   `-- AnalyticsConfigurations.cs
|       |   |-- Controllers/
|       |   |   `-- AnalyticsController.cs
|       |   |-- DTOs/
|       |   |   `-- AnalyticsResponses.cs
|       |   |-- Entities/
|       |   |   `-- AnalyticsEntities.cs
|       |   `-- Services/
|       |       `-- AnalyticsService.cs
|       |-- Promotions/
|       |   |-- Configurations/
|       |   |   `-- PromotionConfigurations.cs
|       |   |-- Controllers/
|       |   |   |-- CouponsController.cs
|       |   |   `-- PromotionsController.cs
|       |   |-- DTOs/
|       |   |   |-- PromotionRequests.cs
|       |   |   `-- PromotionResponses.cs
|       |   |-- Entities/
|       |   |   `-- PromotionEntities.cs
|       |   `-- Services/
|       |       `-- PromotionService.cs
|       |-- Shipping/
|       |   |-- Configurations/
|       |   |   `-- ShippingConfigurations.cs
|       |   |-- Controllers/
|       |   |   `-- ShipmentsController.cs
|       |   |-- DTOs/
|       |   |   |-- ShippingRequests.cs
|       |   |   `-- ShippingResponses.cs
|       |   |-- Entities/
|       |   |   `-- ShippingEntities.cs
|       |   `-- Services/
|       |       `-- ShippingService.cs
|       |-- Notifications/
|       |   |-- Configurations/
|       |   |   `-- NotificationConfigurations.cs
|       |   |-- Controllers/
|       |   |   |-- NotificationLogsController.cs
|       |   |   |-- NotificationSettingsController.cs
|       |   |   `-- NotificationTemplatesController.cs
|       |   |-- DTOs/
|       |   |   |-- NotificationRequests.cs
|       |   |   `-- NotificationResponses.cs
|       |   |-- Entities/
|       |   |   `-- NotificationEntities.cs
|       |   |-- Providers/
|       |   |   |-- EmailNotificationProvider.cs
|       |   |   |-- INotificationProvider.cs
|       |   |   |-- SmsNotificationProvider.cs
|       |   |   `-- WhatsAppNotificationProvider.cs
|       |   |-- Services/
|       |   |   |-- NotificationQueueProcessor.cs
|       |   |   `-- NotificationService.cs
|       |   `-- Templates/
|       |       `-- NotificationTemplateCatalog.cs
|       |-- Vendors/
|       |   |-- Configurations/
|       |   |   `-- VendorConfigurations.cs
|       |   |-- Controllers/
|       |   |   |-- VendorsController.cs
|       |   |   `-- VendorUsersController.cs
|       |   |-- DTOs/
|       |   |   |-- VendorRequests.cs
|       |   |   `-- VendorResponses.cs
|       |   |-- Entities/
|       |   |   `-- VendorEntities.cs
|       |   `-- Services/
|       |       `-- VendorService.cs
|       |-- Finance/
|       |   |-- Configurations/
|       |   `-- Entities/
|       |-- System/
|       |   |-- Configurations/
|       |   `-- Entities/
|       |-- AfterSales/
|       |   |-- Configurations/
|       |   |   `-- AfterSalesConfigurations.cs
|       |   |-- Controllers/
|       |   |   |-- RefundsController.cs
|       |   |   `-- ReturnsController.cs
|       |   |-- DTOs/
|       |   |   |-- AfterSalesRequests.cs
|       |   |   `-- AfterSalesResponses.cs
|       |   |-- Entities/
|       |   |   `-- AfterSalesEntities.cs
|       |   `-- Services/
|       |       |-- AfterSalesService.Returns.cs
|       |       `-- AfterSalesService.Runtime.cs
|       |-- Admin/
|       |-- VendorDashboard/
|       `-- CXCore/
|           |-- Common/
|           |-- Address/
|           |-- Shared/
|           `-- Master/
|
|-- cxstore/                             <- React frontend
|   |-- package.json                     <- Frontend dependencies including `framer-motion`
|   `-- src/
|       |-- api/
|       |   |-- authApi.ts
|       |   |-- brandApi.ts
|       |   |-- colourApi.ts
|       |   |-- commonApi.ts
|       |   |-- contactApi.ts
|       |   |-- hsnApi.ts
|       |   |-- httpClient.ts
|       |   |-- locationApi.ts
|       |   |-- productApi.ts
|       |   |-- salesApi.ts
|       |   |-- inventoryApi.ts
|       |   |-- analyticsApi.ts
|       |   |-- notificationApi.ts
|       |   |-- promotionApi.ts
|       |   |-- shippingApi.ts
|       |   |-- returnsApi.ts
|       |   |-- vendorApi.ts
|       |   |-- roleApi.ts
|       |   |-- sizeApi.ts
|       |   |-- unitApi.ts
|       |   `-- userApi.ts
|       |-- components/
|       |   |-- admin/
|       |   |   |-- AdminListPlaceholder.tsx
|       |   |   |-- contacts/
|       |   |   |   `-- ContactForm.tsx
|       |   |   `-- menu/
|       |   |       `-- admin-menu.ts
|       |   |   `-- products/
|       |   |       `-- ProductForm.tsx
|       |   |-- blocks/
|       |   |-- forms/
|       |   |   |-- CommonList.tsx
|       |   |   |-- CommonUpsertDialog.tsx
|       |   |   |-- ProtectedRoute.tsx
|       |   |   |-- commonMasterTypes.ts
|       |   |   |-- useCommonListState.tsx
|       |   |   `-- useCommonMasterState.tsx
|       |   |-- global/
|       |   |   `-- GlobalLoader.tsx
|       |   |-- layout/
|       |   |-- lookups/
|       |   |   |-- AutocompleteLookup.tsx
|       |   |   `-- commonLookups.tsx
|       |   |-- ui/
|       |   |   |-- combobox.tsx
|       |   |   |-- input.tsx
|       |   |   |-- input-group.tsx
|       |   |   |-- select.tsx
|       |   |   |-- table.tsx
|       |   |   `-- textarea.tsx
|       |   `-- table/
|       |       `-- AdminTable.tsx
|       |-- css/
|       |-- lib/
|       |-- pages/
|       |   |-- CartPage.tsx
|       |   |-- CheckoutPage.tsx
|       |   `-- admin/
|       |       |-- contacts/
|       |       |   |-- ContactCreatePage.tsx
|       |       |   |-- ContactDetailPage.tsx
|       |       |   |-- ContactEditPage.tsx
|       |       |   `-- ContactsPage.tsx
|       |       |-- common/
|       |       |   `-- CommonMasterPage.tsx
|       |       |-- permissions/
|       |       |   |-- PermissionsPage.tsx
|       |       |   `-- RolePermissionEditor.tsx
|       |       |-- products/
|       |       |   |-- ProductCategoriesPage.tsx
|       |       |   |-- ProductCreatePage.tsx
|       |       |   |-- ProductDetailPage.tsx
|       |       |   |-- ProductEditPage.tsx
|       |       |   `-- ProductsPage.tsx
|       |       |-- sales/
|       |       |   |-- InvoiceDetailPage.tsx
|       |       |   |-- InvoiceListPage.tsx
|       |       |   |-- OrderCreatePage.tsx
|       |       |   |-- OrderDetailPage.tsx
|       |       |   |-- OrderListPage.tsx
|       |       |   |-- PaymentCreatePage.tsx
|       |       |   |-- PaymentListPage.tsx
|       |       |   |-- VendorPayoutListPage.tsx
|       |       |   `-- VendorPayoutRequestPage.tsx
|       |       |-- inventory/
|       |       |   |-- InventoryPage.tsx
|       |       |   |-- PurchaseOrdersPage.tsx
|       |       |   |-- StockMovementsPage.tsx
|       |       |   `-- TransfersPage.tsx
|       |       |-- analytics/
|       |       |   `-- AnalyticsPage.tsx
|       |       |-- promotions/
|       |       |   `-- PromotionsPage.tsx
|       |       |-- shipping/
|       |       |   `-- ShipmentsPage.tsx
|       |       |-- notifications/
|       |       |   |-- logs/
|       |       |   |   `-- NotificationLogsPage.tsx
|       |       |   |-- settings/
|       |       |   |   `-- NotificationSettingsPage.tsx
|       |       |   `-- templates/
|       |       |       `-- NotificationTemplatesPage.tsx
|       |       |-- returns/
|       |       |   `-- ReturnsPage.tsx
|       |       |-- vendors/
|       |       |   |-- VendorDetailsPage.tsx
|       |       |   |-- VendorUsersPage.tsx
|       |       |   |-- VendorWarehousesPage.tsx
|       |       |   `-- VendorsPage.tsx
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
|           |-- common.ts
|           |-- contact.ts
|           |-- inventory.ts
|           |-- analytics.ts
|           |-- notification.ts
|           |-- promotion.ts
|           |-- shipping.ts
|           |-- returns.ts
|           |-- product.ts
|           |-- sales.ts
|           `-- vendor.ts
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
|   |-- InventoryModuleTests.cs
|   |-- NotificationsModuleTests.cs
|   |-- ProductPricingTests.cs
|   |-- EnterpriseModulesTests.cs
|   |-- VendorCompaniesTests.cs
|   |-- VendorWarehouseAccessTests.cs
|   `-- TestAssembly.cs
|
`-- codexsun.slnx
```
