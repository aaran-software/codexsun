import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth, logout } from '@/state/authStore';

export default function WebLayout() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await logout()
      navigate("/", { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center pl-6">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold sm:inline-block text-xl">
              CXStore
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
            <Link to="/services" className="transition-colors hover:text-foreground/80 text-foreground/60">Services</Link>
            <Link to="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">Contact</Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4 pr-6">
            <ModeToggle />
            {auth.isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">Dashboard</Link>
                <Button variant="outline" size="sm" onClick={() => void handleLogout()} disabled={isLoggingOut}>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-medium transition-colors hover:text-primary">Login</Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row pl-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <span className="font-bold">Codexsun</span>. The source code is available.
          </p>
        </div>
      </footer>
    </div>
  );
}
