import { Suspense, lazy } from "react"
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"

import ProtectedRoute from "./components/forms/ProtectedRoute"
import GlobalLoader from "@/components/global/GlobalLoader"
import { ThemeProvider } from "@/components/blocks/theme/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuth } from "./state/authStore"
import WebLayout from "./components/layout/WebLayout"
import AuthLayout from "./components/layout/AuthLayout"
import AppLayout from "./components/layout/AppLayout"

import "./css/app.css"

const Home = lazy(() => import("./pages/Home"))
const About = lazy(() => import("./pages/About"))
const Contact = lazy(() => import("./pages/Contact"))
const Services = lazy(() => import("./pages/Services"))
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

function App() {
  const auth = useAuth()

  return (
    <ThemeProvider
      defaultTheme="dark"
      defaultColorTheme="neutral"
      themeStorageKey="vite-ui-theme"
      colorStorageKey="vite-ui-color-theme"
    >
      <Router>
        <TooltipProvider>
          <Suspense fallback={<GlobalLoader className="bg-background" />}>
            <Routes>
              <Route element={<WebLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
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
                </Route>
              </Route>

              <Route path="*" element={<Navigate to={auth.isAuthenticated ? "/dashboard" : "/"} replace />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
