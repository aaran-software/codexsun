import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { logout, useAuth } from "@/state/authStore"

export default function Home() {
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
    <div className="container py-10 pl-6">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Welcome to CXStore</h1>
      <p className="text-xl text-muted-foreground max-w-[700px]">
        A comprehensive and scalable solution powered by Codexsun infrastructure.
        Manage your services dynamically and see everything connect seamlessly.
      </p>
      <div className="flex gap-4 mt-8">
        {auth.isAuthenticated ? (
          <>
            <Link to="/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Open Dashboard
            </Link>
            <Button variant="outline" onClick={() => void handleLogout()} disabled={isLoggingOut}>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </>
        ) : (
          <Link to="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
}
