import { Navigate } from "react-router-dom"
import { LoginForm } from "../components/login-form"
import { useAuth } from "../state/authStore"

export default function Login() {
  const auth = useAuth()

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex h-full w-full items-center justify-center py-1 md:py-2">
      <div className="w-full max-w-3xl">
        <LoginForm />
      </div>
    </div>
  )
}
