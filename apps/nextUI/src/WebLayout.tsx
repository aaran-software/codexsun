import { useAuthStore } from '@/stores/auth-store'
import { Link, Outlet } from '@tanstack/react-router'
import { Button } from '@/components/ui/button' // Assuming a Button component exists

export function WebLayout() {
    const { auth } = useAuthStore()

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-gray-800 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">My App</h1>
                    {auth.isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <span>Welcome, {auth.user?.username || 'User'}</span>
                            <Button
                                variant="outline"
                                onClick={() => useAuthStore.getState().auth.reset()}
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Link to="/sign-in">
                            <Button>Login</Button>
                        </Link>
                    )}
                </div>
            </header>
            <main className="flex-grow container mx-auto p-4">
                <Outlet />
            </main>
            <footer className="bg-gray-800 text-white p-4 text-center">
                <p>&copy; 2025 My App. All rights reserved.</p>
            </footer>
        </div>
    )
}