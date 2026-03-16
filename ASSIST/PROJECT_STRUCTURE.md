# CXSTORE Project Structure

## 1. Project Overview
CXSTORE is a multi-vendor ecommerce platform, currently implemented as a modular monolith. It supports core ecommerce functionalities ranging from product catalog and cart, to vendor management, inventory, operations, and after-sales.

## 2. Architecture
- **Style**: Modular Monolith, identifying distinct domain boundaries
- **Backend Stack**: ASP.NET Core, .NET Aspire (`cx.AppHost`), Entity Framework Core, PostgreSQL
- **Frontend Stack**: React, TypeScript, Vite, Tailwind (`cxstore`)
- **Key Principles**: Clean Architecture concepts with clear domain separation into physical `Modules`.

## 3. Backend Modules
The backend `/cxserver/Modules` is divided into 17 distinct modules:
- **AfterSales**: Returns, Refunds
- **Analytics**: System and business analytics
- **Auth**: Users, Roles, Permissions, JWT / Refresh Tokens
- **Common**: Shared masters (Locations, Catalog info, Operations)
- **Company**: Tenant/Company info and settings
- **Contacts**: Contact groups and details
- **Finance**: Ledgers, basic finance tracking
- **Inventory**: Warehouses, POs, Stock Movements, Adjustments
- **Media**: File and folder management
- **Monitoring**: Diagnostics and health
- **Notifications**: Email/SMS logs and templates
- **Products**: Catalog, Variants, Brands, Pricing
- **Promotions**: Coupons and Offers
- **Sales**: Cart, Checkout, Orders, Invoices, Payments
- **Shipping**: Methods, Providers, Shipments
- **System**: Audit Logs, Error Logs, Global Settings
- **Vendors**: Vendor accounts, addresses, banks, payouts

## 4. Database Tables
Database is centrally managed via `CodexsunDbContext`.
There are over 80 connected tables spanning across all the domains. All primary and foreign keys are explicitly mapped using EF Core conventions and configurations.

## 5. API Endpoints
Endpoints are separated by module controllers (e.g. `AuthController`, `ProductsController`, `CartController`, `OrdersController`, `InventoryController`).
Total 32 controllers provide extensive coverage for UI operations.

## 6. Frontend Structure
The `/cxstore` frontend relies on modern React/Vite.
- **Pages**: 16+ pages including `Home`, `ProductPage`, `CartPage`, `CheckoutPage`, `VendorStorePage`, `Dashboard`.
- **API Services**: 25+ `.ts` client files mapping to backend modules (e.g. `authApi.ts`, `productApi.ts`).
- **Components**: Grouped by features (`cart`, `checkout`, `product`) and shared (`ui`, `layout`, `global`).

## 7. Implemented Features
- Authentication & RBAC
- Product Catalog & Variants
- Multi-Vendor Management
- Common Masters (Countries, States, Units, HSN, Tax)
- Comprehensive Cart & Checkout UI
- Orders & Invoices Flow
- Inventory (Warehouse, PO, Adjustments)
- After-Sales (Returns, Refunds)

## 8. Missing Features
- Full Admin Dashboard UI capabilities are still a work in progress (only base setup exists).
- Advanced Analytics visualizations.
- AI Search & Recommendations / Chatbot integrations.

## 9. Suggested Next Modules
- **Support / Ticketing**: User issue resolution.
- **Loyalty Program / Affiliate**: Points and refer-and-earn.
- **Marketing Automation**: Targeted campaigns.
