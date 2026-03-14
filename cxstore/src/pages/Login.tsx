import { Navigate } from "react-router-dom"
import { LoginForm } from "../components/login-form"
import { useAuth } from "../state/authStore"

export default function Login() {
  const auth = useAuth()

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex w-full items-center justify-center py-6 md:py-10">
      <div className="w-full max-w-3xl">
        <LoginForm />
      </div>
    </div>
  )
}
