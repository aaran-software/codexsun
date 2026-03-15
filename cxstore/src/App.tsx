import { Suspense, lazy } from "react"
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"

import ProtectedRoute from "./components/forms/ProtectedRoute"
import GlobalLoader from "@/components/global/GlobalLoader"
import { ThemeProvider } from "@/components/blocks/theme/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CompanyProvider } from "@/config/company"
import { useAuth } from "./state/authStore"
import WebLayout from "./components/layout/WebLayout"
import AuthLayout from "./components/layout/AuthLayout"
import AppLayout from "./components/layout/AppLayout"

import "./css/app.css"

const Home = lazy(() => import("./pages/Home"))
const About = lazy(() => import("./pages/About"))
const Contact = lazy(() => import("./pages/Contact"))
const Services = lazy(() => import("./pages/Services"))
const CartPage = lazy(() => import("./pages/CartPage"))
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"))
const CategoryPage = lazy(() => import("./pages/CategoryPage"))
const SearchPage = lazy(() => import("./pages/SearchPage"))
const ProductPage = lazy(() => import("./pages/ProductPage"))
const VendorStorePage = lazy(() => import("./pages/VendorStorePage"))
const WishlistPage = lazy(() => import("./pages/WishlistPage"))
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"))
const AccountPage = lazy(() => import("./pages/AccountPage"))
const Login = lazy(() => import("./pages/Login"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const UsersPage = lazy(() => import("./pages/admin/users/UsersPage"))
const UserCreatePage = lazy(() => import("./pages/admin/users/UserCreatePage"))
const UserEditPage = lazy(() => import("./pages/admin/users/UserEditPage"))
const RolesPage = lazy(() => import("./pages/admin/roles/RolesPage"))
const RoleCreatePage = lazy(() => import("./pages/admin/roles/RoleCreatePage"))
const RoleEditPage = lazy(() => import("./pages/admin/roles/RoleEditPage"))
const PermissionsPage = lazy(() => import("./pages/admin/permissions/PermissionsPage"))
const RolePermissionEditor = lazy(() => import("./pages/admin/permissions/RolePermissionEditor"))
const CommonMasterPage = lazy(() => import("./pages/admin/common/CommonMasterPage"))
const ContactsPage = lazy(() => import("./pages/admin/contacts/ContactsPage"))
const ContactCreatePage = lazy(() => import("./pages/admin/contacts/ContactCreatePage"))
const ContactEditPage = lazy(() => import("./pages/admin/contacts/ContactEditPage"))
const ContactDetailPage = lazy(() => import("./pages/admin/contacts/ContactDetailPage"))
const ProductsPage = lazy(() => import("./pages/admin/products/ProductsPage"))
const ProductCreatePage = lazy(() => import("./pages/admin/products/ProductCreatePage"))
const ProductEditPage = lazy(() => import("./pages/admin/products/ProductEditPage"))
const ProductDetailPage = lazy(() => import("./pages/admin/products/ProductDetailPage"))
const ProductCategoriesPage = lazy(() => import("./pages/admin/products/ProductCategoriesPage"))
const OrderListPage = lazy(() => import("./pages/admin/sales/OrderListPage"))
const OrderDetailPage = lazy(() => import("./pages/admin/sales/OrderDetailPage"))
const OrderCreatePage = lazy(() => import("./pages/admin/sales/OrderCreatePage"))
const InvoiceListPage = lazy(() => import("./pages/admin/sales/InvoiceListPage"))
const InvoiceDetailPage = lazy(() => import("./pages/admin/sales/InvoiceDetailPage"))
const PaymentListPage = lazy(() => import("./pages/admin/sales/PaymentListPage"))
const PaymentCreatePage = lazy(() => import("./pages/admin/sales/PaymentCreatePage"))
const VendorPayoutListPage = lazy(() => import("./pages/admin/sales/VendorPayoutListPage"))
const VendorPayoutRequestPage = lazy(() => import("./pages/admin/sales/VendorPayoutRequestPage"))
const PurchaseOrdersPage = lazy(() => import("./pages/admin/inventory/PurchaseOrdersPage"))
const TransfersPage = lazy(() => import("./pages/admin/inventory/TransfersPage"))
const InventoryPage = lazy(() => import("./pages/admin/inventory/InventoryPage"))
const StockMovementsPage = lazy(() => import("./pages/admin/inventory/StockMovementsPage"))
const VendorsPage = lazy(() => import("./pages/admin/vendors/VendorsPage"))
const VendorCreatePage = lazy(() => import("./pages/admin/vendors/VendorCreatePage"))
const VendorDetailsPage = lazy(() => import("./pages/admin/vendors/VendorDetailsPage"))
const VendorUsersPage = lazy(() => import("./pages/admin/vendors/VendorUsersPage"))
const VendorWarehousesPage = lazy(() => import("./pages/admin/vendors/VendorWarehousesPage"))
const AnalyticsPage = lazy(() => import("./pages/admin/analytics/AnalyticsPage"))
const PromotionsPage = lazy(() => import("./pages/admin/promotions/PromotionsPage"))
const ShipmentsPage = lazy(() => import("./pages/admin/shipping/ShipmentsPage"))
const ReturnsPage = lazy(() => import("./pages/admin/returns/ReturnsPage"))
const MediaLibraryPage = lazy(() => import("./pages/admin/media/MediaLibraryPage"))
const CompanySettingsPage = lazy(() => import("./pages/admin/settings/company/CompanySettingsPage"))
const NotificationTemplatesPage = lazy(() => import("./pages/admin/notifications/templates/NotificationTemplatesPage"))
const NotificationLogsPage = lazy(() => import("./pages/admin/notifications/logs/NotificationLogsPage"))
const NotificationSettingsPage = lazy(() => import("./pages/admin/notifications/settings/NotificationSettingsPage"))
const AuditLogsPage = lazy(() => import("./pages/admin/monitoring/AuditLogsPage"))
const SystemLogsPage = lazy(() => import("./pages/admin/monitoring/SystemLogsPage"))
const ErrorLogsPage = lazy(() => import("./pages/admin/monitoring/ErrorLogsPage"))
const LoginHistoryPage = lazy(() => import("./pages/admin/monitoring/LoginHistoryPage"))

function App() {
  const auth = useAuth()

  return (
    <ThemeProvider
      defaultTheme="dark"
      defaultColorTheme="neutral"
      themeStorageKey="vite-ui-theme"
      colorStorageKey="vite-ui-color-theme"
    >
      <CompanyProvider>
        <Router>
          <TooltipProvider>
            <Suspense fallback={<GlobalLoader className="bg-background" />}>
              <Routes>
              <Route element={<WebLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/store/:vendorSlug" element={<VendorStorePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/account/profile" element={<AccountPage />} />
                  <Route path="/account/addresses" element={<AccountPage />} />
                  <Route path="/account/orders" element={<AccountPage />} />
                  <Route path="/account/wishlist" element={<AccountPage />} />
                  <Route path="/account/reviews" element={<AccountPage />} />
                </Route>
              </Route>

              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["Admin", "Vendor", "Customer", "Staff"]} />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
                <Route element={<AppLayout />}>
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/admin/users" element={<UsersPage />} />
                  <Route path="/admin/users/create" element={<UserCreatePage />} />
                  <Route path="/admin/users/edit/:id" element={<UserEditPage />} />
                  <Route path="/admin/roles" element={<RolesPage />} />
                  <Route path="/admin/roles/create" element={<RoleCreatePage />} />
                  <Route path="/admin/roles/edit/:id" element={<RoleEditPage />} />
                  <Route path="/admin/permissions" element={<PermissionsPage />} />
                  <Route path="/admin/roles/:id/permissions" element={<RolePermissionEditor />} />
                  <Route path="/admin/contacts" element={<ContactsPage />} />
                  <Route path="/admin/contacts/create" element={<ContactCreatePage />} />
                  <Route path="/admin/contacts/edit/:id" element={<ContactEditPage />} />
                  <Route path="/admin/contacts/:id" element={<ContactDetailPage />} />
                  <Route path="/admin/products" element={<ProductsPage />} />
                  <Route path="/admin/products/create" element={<ProductCreatePage />} />
                  <Route path="/admin/products/edit/:id" element={<ProductEditPage />} />
                  <Route path="/admin/products/:id" element={<ProductDetailPage />} />
                  <Route path="/admin/sales/orders" element={<OrderListPage />} />
                  <Route path="/admin/sales/orders/create" element={<OrderCreatePage />} />
                  <Route path="/admin/sales/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/admin/sales/invoices" element={<InvoiceListPage />} />
                  <Route path="/admin/sales/invoices/:id" element={<InvoiceDetailPage />} />
                  <Route path="/admin/sales/payments" element={<PaymentListPage />} />
                  <Route path="/admin/sales/payments/create" element={<PaymentCreatePage />} />
                  <Route path="/admin/sales/vendor-payouts" element={<VendorPayoutListPage />} />
                  <Route path="/admin/sales/vendor-payouts/request" element={<VendorPayoutRequestPage />} />
                  <Route path="/admin/inventory/purchase-orders" element={<PurchaseOrdersPage />} />
                  <Route path="/admin/inventory/transfers" element={<TransfersPage />} />
                  <Route path="/admin/inventory/warehouse" element={<InventoryPage />} />
                  <Route path="/admin/inventory/movements" element={<StockMovementsPage />} />
                  <Route path="/admin/promotions" element={<PromotionsPage />} />
                  <Route path="/admin/shipping" element={<ShipmentsPage />} />
                  <Route path="/admin/returns" element={<ReturnsPage />} />
                  <Route path="/admin/analytics" element={<AnalyticsPage />} />
                  <Route path="/admin/media" element={<MediaLibraryPage />} />
                  <Route path="/admin/settings/company" element={<CompanySettingsPage />} />
                  <Route path="/admin/notifications/templates" element={<NotificationTemplatesPage />} />
                  <Route path="/admin/notifications/logs" element={<NotificationLogsPage />} />
                  <Route path="/admin/notifications/settings" element={<NotificationSettingsPage />} />
                  <Route path="/admin/monitoring/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/admin/monitoring/system-logs" element={<SystemLogsPage />} />
                  <Route path="/admin/monitoring/error-logs" element={<ErrorLogsPage />} />
                  <Route path="/admin/monitoring/login-history" element={<LoginHistoryPage />} />
                  <Route path="/admin/vendors" element={<VendorsPage />} />
                  <Route path="/admin/vendors/create" element={<VendorCreatePage />} />
                  <Route path="/admin/vendors/:id" element={<VendorDetailsPage />} />
                  <Route path="/admin/vendors/:id/users" element={<VendorUsersPage />} />
                  <Route path="/admin/common" element={<Navigate to="/admin/common/brands" replace />} />
                  <Route path="/admin/common/product-categories" element={<ProductCategoriesPage />} />
                  <Route path="/admin/common/:masterKey" element={<CommonMasterPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["Vendor"]} />}>
                <Route element={<AppLayout />}>
                  <Route path="/vendor" element={<Dashboard />} />
                  <Route path="/vendor/contacts" element={<ContactsPage />} />
                  <Route path="/vendor/contacts/create" element={<ContactCreatePage />} />
                  <Route path="/vendor/contacts/edit/:id" element={<ContactEditPage />} />
                  <Route path="/vendor/contacts/:id" element={<ContactDetailPage />} />
                  <Route path="/vendor/products" element={<ProductsPage />} />
                  <Route path="/vendor/products/create" element={<ProductCreatePage />} />
                  <Route path="/vendor/products/edit/:id" element={<ProductEditPage />} />
                  <Route path="/vendor/products/:id" element={<ProductDetailPage />} />
                  <Route path="/vendor/sales/orders" element={<OrderListPage />} />
                  <Route path="/vendor/sales/orders/create" element={<OrderCreatePage />} />
                  <Route path="/vendor/sales/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/vendor/sales/invoices" element={<InvoiceListPage />} />
                  <Route path="/vendor/sales/invoices/:id" element={<InvoiceDetailPage />} />
                  <Route path="/vendor/sales/payments" element={<PaymentListPage />} />
                  <Route path="/vendor/sales/payments/create" element={<PaymentCreatePage />} />
                  <Route path="/vendor/sales/vendor-payouts" element={<VendorPayoutListPage />} />
                  <Route path="/vendor/sales/vendor-payouts/request" element={<VendorPayoutRequestPage />} />
                  <Route path="/vendor/warehouses" element={<VendorWarehousesPage />} />
                  <Route path="/vendor/inventory/purchase-orders" element={<PurchaseOrdersPage />} />
                  <Route path="/vendor/inventory/transfers" element={<TransfersPage />} />
                  <Route path="/vendor/inventory/warehouse" element={<InventoryPage />} />
                  <Route path="/vendor/inventory/movements" element={<StockMovementsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to={auth.isAuthenticated ? "/dashboard" : "/"} replace />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </Router>
      </CompanyProvider>
    </ThemeProvider>
  )
}

export default App
