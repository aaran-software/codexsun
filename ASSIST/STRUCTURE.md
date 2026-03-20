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
|   |   |-- 20260315161557_AddMediaModule.cs
|   |   |-- 20260315161557_AddMediaModule.Designer.cs
|   |   |-- 20260315163720_AddCompanyModule.cs
|   |   |-- 20260315163720_AddCompanyModule.Designer.cs
|   |   |-- 20260316115104_AddCheckoutResilienceAndReservations.cs
|   |   |-- 20260316115104_AddCheckoutResilienceAndReservations.Designer.cs
|   |   |-- 20260316120934_AddRazorpayPaymentIntegration.cs
|   |   |-- 20260316120934_AddRazorpayPaymentIntegration.Designer.cs
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
|       |   |   |-- RazorpayPaymentsController.cs
|       |   |   `-- VendorPayoutsController.cs
|       |   |-- DTOs/
|       |   |   |-- SalesRequests.cs
|       |   |   `-- SalesResponses.cs
|       |   |-- Entities/
|       |   |   `-- SalesEntities.cs
|       |   `-- Services/
|       |       |-- RazorpayGatewayService.cs
|       |       |-- RazorpaySettings.cs
|       |       `-- SalesService.cs
|       |       `-- order_inventory_reservations` persistence now lives in the Sales aggregate for deterministic stock release
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
|       |-- Media/
|       |   |-- Configurations/
|       |   |   `-- MediaConfigurations.cs
|       |   |-- Controllers/
|       |   |   |-- FoldersController.cs
|       |   |   `-- MediaController.cs
|       |   |-- DTOs/
|       |   |   |-- MediaRequests.cs
|       |   |   `-- MediaResponses.cs
|       |   |-- Entities/
|       |   |   `-- MediaEntities.cs
|       |   `-- Services/
|       |       |-- LocalFileStorageProvider.cs
|       |       |-- MediaService.cs
|       |       `-- MediaStorageModels.cs
|       |-- Company/
|       |   |-- Configurations/
|       |   |   `-- CompanyConfigurations.cs
|       |   |-- Controllers/
|       |   |   |-- CompanyController.cs
|       |   |   `-- CompanySettingsController.cs
|       |   |-- DTOs/
|       |   |   |-- CompanyRequests.cs
|       |   |   `-- CompanyResponses.cs
|       |   |-- Entities/
|       |   |   `-- CompanyEntities.cs
|       |   `-- Services/
|       |       `-- CompanyService.cs
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
|   |-- package.json                     <- Frontend dependencies including `framer-motion`, `axios`, `@tanstack/react-query`, and `zustand`
|   `-- src/
|       |-- api/
|       |   |-- apiClient.ts
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
|       |   |-- companyApi.ts
|       |   |-- mediaApi.ts
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
|       |   |-- media/
|       |   |   `-- MediaPicker.tsx
|       |   |-- cart/
|       |   |   |-- CartItemCard.tsx
|       |   |   |-- CartSummaryCard.tsx
|       |   |   `-- CouponInput.tsx
|       |   |-- blocks/
|       |   |-- checkout/
|       |   |   |-- AddressFormCard.tsx
|       |   |   |-- CheckoutStepper.tsx
|       |   |   |-- OrderSummaryCard.tsx
|       |   |   |-- PaymentSelector.tsx
|       |   |   `-- ShippingOptions.tsx
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
|       |   |   |-- MainLayout.tsx
|       |   |   |-- navbar.tsx
|       |   |   |-- storefront-auth-notice.tsx
|       |   |   |-- storefront-bottom-nav.tsx
|       |   |   |-- storefront-footer.tsx
|       |   |   |-- storefront-header.tsx
|       |   |   |-- storefront-mobile-menu.tsx
|       |   |   `-- storefront-search-bar.tsx
|       |   |-- lookups/
|       |   |   |-- AutocompleteLookup.tsx
|       |   |   `-- commonLookups.tsx
|       |   |-- product/
|       |   |   |-- CategoryGrid.tsx
|       |   |   |-- DealBanner.tsx
|       |   |   |-- FilterSidebar.tsx
|       |   |   |-- HeroSlider.tsx
|       |   |   |-- ProductCard.tsx
|       |   |   |-- ProductGallery.tsx
|       |   |   |-- ProductGrid.tsx
|       |   |   |-- QuantitySelector.tsx
|       |   |   |-- RatingStars.tsx
|       |   |   |-- ReviewForm.tsx
|       |   |   |-- ReviewList.tsx
|       |   |   |-- SortDropdown.tsx
|       |   |   `-- VendorCarousel.tsx
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
|       |-- config/
|       |   `-- company.tsx
|       |-- lib/
|       |   `-- queryClient.ts
|       |-- pages/
|       |   |-- AccountPage.tsx
|       |   |-- CartPage.tsx
|       |   |-- CategoryPage.tsx
|       |   |-- CheckoutPage.tsx
|       |   |-- OrderSuccessPage.tsx
|       |   |-- ProductPage.tsx
|       |   |-- SearchPage.tsx
|       |   |-- VendorStorePage.tsx
|       |   |-- WishlistPage.tsx
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
|       |       |-- media/
|       |       |   `-- MediaLibraryPage.tsx
|       |       |-- settings/
|       |       |   `-- company/
|       |       |       `-- CompanySettingsPage.tsx
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
|       |       |-- monitoring/
|       |       |   |-- AuditLogsPage.tsx
|       |       |   |-- ErrorLogsPage.tsx
|       |       |   |-- LoginHistoryPage.tsx
|       |       |   `-- SystemLogsPage.tsx
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
|       |   `-- usePageMeta.ts
|       |-- routes/
|       |   `-- router.tsx
|       |-- state/
|       |   |-- authStore.ts
|       |   |-- cartStore.ts
|       |   `-- wishlistStore.ts
|       |-- utils/
|       |   `-- storefront.ts
|       `-- types/
|           |-- admin.ts
|           |-- auth.ts
|           |-- common.ts
|           |-- contact.ts
|           |-- inventory.ts
|           |-- company.ts
|           |-- media.ts
|           |-- monitoring.ts
|           |-- analytics.ts
|           |-- notification.ts
|           |-- promotion.ts
|           |-- shipping.ts
|           |-- storefront.ts
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
|   |-- CompanyModuleTests.cs
|   |-- InventoryModuleTests.cs
|   |-- MediaModuleTests.cs
|   |-- MonitoringModuleTests.cs
|   |-- NotificationsModuleTests.cs
|   |-- ProductPricingTests.cs
|   |-- EnterpriseModulesTests.cs
|   |-- VendorCompaniesTests.cs
|   |-- VendorWarehouseAccessTests.cs
|   `-- TestAssembly.cs
|
`-- codexsun.slnx
```

## Monitoring Module Additions

- Backend monitoring lives in `cxserver/Modules/Monitoring` with `Entities`, `Configurations`, `DTOs`, `Services`, and `Controllers`, matching the existing module convention rather than the prompt's alternate tree.
- Frontend monitoring lives under `cxstore/src/pages/admin/monitoring` with supporting files in `src/api/monitoringApi.ts` and `src/types/monitoring.ts`.
- Global middleware wiring is in `cxserver/Program.cs`, and persistence is registered in `cxserver/Infrastructure/CodexsunDbContext.cs`.

## Storefront Frontend Additions

- The customer storefront was added inside `cxstore/src/pages` and `cxstore/src/components` rather than as a separate frontend project.
- Storefront data access uses `src/api/apiClient.ts`, `src/lib/queryClient.ts`, and persisted Zustand stores in `src/state/cartStore.ts` and `src/state/wishlistStore.ts`.
- Customer-facing routes now include catalog browsing, search, product detail, vendor stores, wishlist, checkout, order success, and account views while keeping the existing admin and vendor route tree intact.
- Public browsing is now backed by additive anonymous endpoints in `cxserver/Modules/Products/Controllers/StorefrontCatalogController.cs` and `cxserver/Modules/Vendors/Controllers/StorefrontVendorsController.cs`, with the storefront pages consuming `getStorefrontProducts`, `getStorefrontProductBySlug`, `getStorefrontCategories`, and `getStorefrontVendors`.
- Customer wishlist and product reviews are now backed by `cxserver/Modules/Storefront`, with frontend integrations in `src/api/wishlistApi.ts`, `src/api/reviewApi.ts`, and the shared `src/state/wishlistStore.ts`.
- Razorpay storefront payments are now shared through `src/lib/razorpay.ts`, which is consumed by both `CheckoutPage.tsx` and `AccountPage.tsx` for initial payment and retry-payment flows.
- Payment repair now uses `reconcileRazorpayPayment` from `src/api/salesApi.ts`, while shipping fulfillment operations can auto-create shipments through `autoCreateShipment` in `src/api/shippingApi.ts`.
- Customer shipment visibility now uses `getShipments` and `getShipmentsForOrder` from `src/api/shippingApi.ts`, and is surfaced in `src/pages/AccountPage.tsx` and `src/pages/OrderSuccessPage.tsx`.
- Customer address persistence now lives in `cxserver/Modules/Storefront` and `src/api/customerAddressApi.ts`, replacing the earlier local-only checkout address helper flow.
