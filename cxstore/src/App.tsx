import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom'
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"

import WebLayout from './components/layout/WebLayout'
import AuthLayout from './components/layout/AuthLayout'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Services from './pages/Services'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UsersPage from './pages/admin/users/UsersPage'
import UserCreatePage from './pages/admin/users/UserCreatePage'
import UserEditPage from './pages/admin/users/UserEditPage'
import RolesPage from './pages/admin/roles/RolesPage'
import RoleCreatePage from './pages/admin/roles/RoleCreatePage'
import RoleEditPage from './pages/admin/roles/RoleEditPage'
import PermissionsPage from './pages/admin/permissions/PermissionsPage'
import RolePermissionEditor from './pages/admin/permissions/RolePermissionEditor'
import CitiesPage from './pages/admin/common/CitiesPage'
import StatesPage from './pages/admin/common/StatesPage'
import ProductTypesPage from './pages/admin/common/ProductTypesPage'
import UnitsPage from './pages/admin/common/UnitsPage'
import BrandsPage from './pages/admin/common/BrandsPage'
import { useAuth } from './state/authStore'

import './css/app.css'

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
          <Routes>
            {/* Public Pages */}
            <Route element={<WebLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Services />} />
            </Route>

            {/* Authentication Pages */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Application Pages */}
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
        </TooltipProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
