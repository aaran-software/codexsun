import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ArrowRightIcon, ChromeIcon, ShieldCheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HttpError } from "@/api/httpClient"
import { login, register } from "@/state/authStore"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const location = useLocation()
  const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL?.trim() ?? ""
  const [mode, setMode] = useState<"login" | "signup" | "google">("login")
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [registerUsername, setRegisterUsername] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (!googleAuthUrl || isSubmitting) {
      return
    }

    window.location.assign(googleAuthUrl)
  }

  const resetMessages = () => {
    setError(null)
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="space-y-2 py-1 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <ShieldCheckIcon className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Codexsun
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-5 text-muted-foreground sm:text-base">
            The next big thing is the one that makes the last big thing usable.
          </p>
        </div>
      </div>

      <Card className="border-border bg-card/95 shadow-xl shadow-black/5 backdrop-blur">
        <CardContent className="px-6 py-5 sm:px-8 sm:py-6">
          <Tabs
            value={mode}
            onValueChange={(value) => {
              setMode(value as "login" | "signup" | "google")
              resetMessages()
            }}
            className="gap-5"
          >
            <div className="space-y-4">
              <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted/70 p-1">
                <TabsTrigger value="login" className="h-11 rounded-lg">Sign in</TabsTrigger>
                <TabsTrigger value="signup" className="h-11 rounded-lg">Create account</TabsTrigger>
                <TabsTrigger value="google" className="h-11 rounded-lg">Google</TabsTrigger>
              </TabsList>

              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </div>

            <TabsContent value="login">
              <form onSubmit={handleSubmit}>
                <FieldGroup className="flex flex-col gap-4">
                  <Field>
                    <FieldLabel htmlFor="usernameOrEmail">Email or username</FieldLabel>
                    <Input
                      id="usernameOrEmail"
                      type="text"
                      placeholder="mail@codexsun.com"
                      value={usernameOrEmail}
                      onChange={(event) => setUsernameOrEmail(event.target.value)}
                      required
                    />
                  </Field>
                  <Field>
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
                  <Field>
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
                <FieldGroup className="flex flex-col gap-4">
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
                  <Field>
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
                  <Field>
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

            <TabsContent value="google">
              <div className="flex flex-col gap-4">
                <div className="space-y-2 text-center">
                  <h2 className="text-lg font-semibold text-foreground">
                    Sign in with Google
                  </h2>
                  <p className="text-sm leading-5 text-muted-foreground">
                    Use your Google workspace identity for a faster sign-in flow when your organization has connected it.
                  </p>
                </div>
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 w-full"
                  onClick={handleGoogleLogin}
                  disabled={!googleAuthUrl}
                >
                  <ChromeIcon className="size-4" />
                  Continue with Google
                  <ArrowRightIcon className="size-4" />
                </Button>
                <div className="rounded-xl border border-dashed border-border bg-muted/60 px-4 py-4 text-sm text-muted-foreground">
                  {googleAuthUrl
                    ? "Google identity provider is connected. Continue to the provider to finish sign-in."
                    : "Google access will appear here after the provider URL is added to the frontend environment."}
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Prefer email credentials?{" "}
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={() => {
                      setMode("login")
                      resetMessages()
                    }}
                  >
                    Return to sign in
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <span>Protected by Codexsun security</span>
            <span className="hidden sm:inline">&bull;</span>
            <Link to="/" className="font-medium text-primary underline-offset-4 hover:underline">
              Return to storefront
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
