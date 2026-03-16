# API Endpoints & Controllers

The backend exposes endpoints grouped logically by business domain inside the `Modules` directory.

## Auth & Users
- `AuthController`: Login, Register, Refresh Token, User Profile.

## Products & Catalog
- `ProductsController`: Product querying, details, creation.
- `CatalogMastersController`: Brands, Colours, Sizes, Categories.

## Cart & Orders (Sales)
- `CartController`: Add/Remove from cart, Manage active cart session.
- `OrdersController`: Place order, Order history, Order status update.
- `InvoicesController`: Get and generate invoices.
- `PaymentsController`: Process payments.

## Vendors
- `VendorsController`: Vendor profiles management.
- `VendorUsersController`: Access for vendor staff.
- `VendorPayoutsController`: Earnings and payout management.

## Inventory
- `InventoryController`: Check stock levels, product availability.
- `PurchaseOrdersController`: Manage POs.
- `StockMovementsController`: Record stock in/out.
- `WarehouseTransfersController`: Move stock between warehouses.

## Promotions & Shipping
- `PromotionsController`: Fetch active promos.
- `CouponsController`: Validate and apply coupons.
- `ShipmentsController`: Generate shipment, update tracking.

## Company & Contacts
- `CompanyController` & `CompanySettingsController`: Manage the primary tenant data.
- `ContactsController`: Manage contacts data (CRM light).

## After-Sales
- `ReturnsController`: Initiate return, return inspection.
- `RefundsController`: Process customer refunds.

## Other Common & System
- `LocationMastersController`: Countries, States, Cities, Pincodes.
- `OperationsMastersController`: Configuration info.
- `MonitoringController` & `AnalyticsController`: Admin stats.
- `MediaController` & `FoldersController`: Upload/Download files.
- `NotificationTemplatesController` & `NotificationLogsController`.
