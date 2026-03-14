import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ChromeIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HttpError } from "@/api/httpClient"
import { login, register } from "@/state/authStore"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const location = useLocation()
  const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL?.trim()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [registerUsername, setRegisterUsername] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleMessage, setGoogleMessage] = useState<string | null>(null)

  const fromPath = (() => {
    const state = location.state as { from?: { pathname?: string } } | null
    return state?.from?.pathname ?? "/dashboard"
  })()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await login({ usernameOrEmail, password })
      navigate(fromPath, { replace: true })
    } catch (submissionError) {
      if (submissionError instanceof HttpError) {
        setError(submissionError.message)
      } else if (submissionError instanceof Error) {
        setError(submissionError.message)
      } else {
        setError("Unable to sign in with the provided credentials.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await register({
        username: registerUsername.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      })
      navigate("/dashboard", { replace: true })
    } catch (submissionError) {
      if (submissionError instanceof HttpError) {
        setError(submissionError.message)
      } else if (submissionError instanceof Error) {
        setError(submissionError.message)
      } else {
        setError("Unable to create your account right now.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = () => {
    if (!googleAuthUrl) {
      setGoogleMessage("Google sign-in is available once VITE_GOOGLE_AUTH_URL is configured.")
      return
    }

    window.location.assign(googleAuthUrl)
  }

  const resetMessages = () => {
    setError(null)
    setGoogleMessage(null)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <ShieldCheckIcon className="size-8" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">
            Codexsun
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Secure access for every operational team
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Sign in to manage vendors, customers, and internal operations from one trusted control surface.
          </p>
        </div>
      </div>

      <Card className="border-border/70 bg-card/95 shadow-2xl shadow-slate-200/60 backdrop-blur">
        <CardContent>
          <Tabs
            value={mode}
            onValueChange={(value) => {
              setMode(value as "login" | "signup")
              resetMessages()
            }}
            className="gap-6"
          >
            <div className="space-y-4">
              <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-muted/70 p-1">
                <TabsTrigger value="login" className="h-11 rounded-lg">Sign in</TabsTrigger>
                <TabsTrigger value="signup" className="h-11 rounded-lg">Create account</TabsTrigger>
              </TabsList>

              <div className="grid gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="h-11 w-full"
                  onClick={handleGoogleLogin}
                >
                  <ChromeIcon className="size-4" />
                  Continue with Google
                </Button>
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  <Separator className="flex-1" />
                  <span>Email access</span>
                  <Separator className="flex-1" />
                </div>
              </div>

              {googleMessage ? (
                <Alert>
                  <SparklesIcon className="size-4" />
                  <AlertDescription>{googleMessage}</AlertDescription>
                </Alert>
              ) : null}

              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </div>

            <TabsContent value="login">
              <form onSubmit={handleSubmit}>
                <FieldGroup className="grid gap-5 sm:grid-cols-2">
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="usernameOrEmail">Email or username</FieldLabel>
                    <Input
                      id="usernameOrEmail"
                      type="text"
                      placeholder="sundar@sundar.com"
                      value={usernameOrEmail}
                      onChange={(event) => setUsernameOrEmail(event.target.value)}
                      required
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <span className="text-xs text-muted-foreground">
                        Use your assigned platform credentials
                      </span>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Signing in..." : "Sign in"}
                    </Button>
                    <FieldDescription className="text-center">
                      Need an account?{" "}
                      <button
                        type="button"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                        onClick={() => {
                          setMode("signup")
                          resetMessages()
                        }}
                      >
                        Create one here
                      </button>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleRegister}>
                <FieldGroup className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="registerUsername">Username</FieldLabel>
                    <Input
                      id="registerUsername"
                      type="text"
                      placeholder="sundar"
                      value={registerUsername}
                      onChange={(event) => setRegisterUsername(event.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="registerEmail">Work email</FieldLabel>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="sundar@sundar.com"
                      value={registerEmail}
                      onChange={(event) => setRegisterEmail(event.target.value)}
                      required
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="registerPassword">Password</FieldLabel>
                    <Input
                      id="registerPassword"
                      type="password"
                      value={registerPassword}
                      onChange={(event) => setRegisterPassword(event.target.value)}
                      minLength={8}
                      required
                    />
                    <FieldDescription>
                      Use at least 8 characters with uppercase, lowercase, and a number.
                    </FieldDescription>
                  </Field>
                  <Field className="sm:col-span-2">
                    <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Creating account..." : "Create account"}
                    </Button>
                    <FieldDescription className="text-center">
                      Already onboarded?{" "}
                      <button
                        type="button"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                        onClick={() => {
                          setMode("login")
                          resetMessages()
                        }}
                      >
                        Sign in
                      </button>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Protected by Codexsun identity</span>
            <span className="hidden sm:inline">•</span>
            <span>JWT session security</span>
            <span className="hidden sm:inline">•</span>
            <Link to="/" className="font-medium text-primary underline-offset-4 hover:underline">
              Return to storefront
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
