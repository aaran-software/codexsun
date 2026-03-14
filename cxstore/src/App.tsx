import { Suspense, lazy } from "react"
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"

import ProtectedRoute from "./components/forms/ProtectedRoute"
import { ThemeProvider } from "@/components/blocks/theme/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuth } from "./state/authStore"

import "./css/app.css"

const WebLayout = lazy(() => import("./components/layout/WebLayout"))
const AuthLayout = lazy(() => import("./components/layout/AuthLayout"))
const AppLayout = lazy(() => import("./components/layout/AppLayout"))

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
const CitiesPage = lazy(() => import("./pages/admin/common/CitiesPage"))
const StatesPage = lazy(() => import("./pages/admin/common/StatesPage"))
const ProductTypesPage = lazy(() => import("./pages/admin/common/ProductTypesPage"))
const UnitsPage = lazy(() => import("./pages/admin/common/UnitsPage"))
const BrandsPage = lazy(() => import("./pages/admin/common/BrandsPage"))

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
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
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
                  <Route path="/admin/common/cities" element={<CitiesPage />} />
                  <Route path="/admin/common/states" element={<StatesPage />} />
                  <Route path="/admin/common/product-types" element={<ProductTypesPage />} />
                  <Route path="/admin/common/units" element={<UnitsPage />} />
                  <Route path="/admin/common/brands" element={<BrandsPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["Vendor"]} />}>
                <Route element={<AppLayout />}>
                  <Route path="/vendor" element={<Dashboard />} />
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
