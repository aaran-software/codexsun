import { useAuthStore } from '@/stores/auth-store'
import { Outlet, Navigate } from '@tanstack/react-router'

export function AppLayout() {
    const { auth } = useAuthStore()

    // If not authenticated, redirect to sign-in
    if (!auth.isAuthenticated) {
        return <Navigate to="/sign-in" search={{ redirect: window.location.href }} />
    }

    return (
        <div className="dashboard-container p-4">
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Outlet />
            </div>
        </div>
    )
}