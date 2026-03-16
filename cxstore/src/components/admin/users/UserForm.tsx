import { useEffect, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { AdminUserDetail, CreateUserRequest, RoleSummary, UpdateUserRequest } from "@/types/admin"

type UserFormValue = {
  username: string
  email: string
  password: string
  roleId: string
  status: string
}

type UserFormProps = {
  title: string
  description: string
  submitLabel: string
  roles: RoleSummary[]
  loading?: boolean
  initialValue?: AdminUserDetail | null
  includeUsername?: boolean
  includePassword?: boolean
  passwordOptional?: boolean
  onSubmit: (value: CreateUserRequest | UpdateUserRequest) => Promise<void>
  onCancel: () => void
}

function createEmptyValue(): UserFormValue {
  return {
    username: "",
    email: "",
    password: "",
    roleId: "",
    status: "Active",
  }
}

function fromDetail(user: AdminUserDetail): UserFormValue {
  return {
    username: user.username,
    email: user.email,
    password: "",
    roleId: user.roleId,
    status: user.status,
  }
}

export function UserForm({
  title,
  description,
  submitLabel,
  roles,
  loading = false,
  initialValue,
  includeUsername = false,
  includePassword = true,
  passwordOptional = false,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [form, setForm] = useState<UserFormValue>(initialValue ? fromDetail(initialValue) : createEmptyValue())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const nextValue = initialValue ? fromDetail(initialValue) : createEmptyValue()
    if (!nextValue.roleId && roles[0]?.id) {
      nextValue.roleId = roles[0].id
    }
    setForm(nextValue)
  }, [initialValue, roles])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (includeUsername && !form.username.trim()) {
      setError("Username is required.")
      return
    }

    if (!form.email.trim() || !form.email.includes("@") || !form.roleId) {
      setError("Enter a valid email and role.")
      return
    }

    if (includePassword) {
      const invalidRequiredPassword = !passwordOptional && form.password.length < 8
      const invalidOptionalPassword = passwordOptional && form.password.length > 0 && form.password.length < 8
      if (invalidRequiredPassword || invalidOptionalPassword) {
        setError("Password must be at least 8 characters.")
        return
      }
    }

    setSubmitting(true)
    try {
      if (includeUsername) {
        await onSubmit({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          roleId: form.roleId,
        })
      } else {
        await onSubmit({
          email: form.email.trim(),
          roleId: form.roleId,
          password: form.password ? form.password : undefined,
          status: form.status,
        })
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save user.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-3 border-b bg-muted/10 px-7 py-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-7 py-7">
        {loading ? (
          <div className="grid gap-6 py-2">
            {Array.from({ length: 2 }, (_, sectionIndex) => (
              <section key={sectionIndex} className="space-y-5 rounded-2xl border border-border/70 bg-muted/20 p-6 md:p-7">
                <div className="space-y-2 border-b border-border/60 pb-4">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
                  <div className="h-5 w-40 animate-pulse rounded-full bg-muted/80" />
                  <div className="h-4 w-72 animate-pulse rounded-full bg-muted/70" />
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }, (_, fieldIndex) => (
                    <div key={fieldIndex} className="space-y-2">
                      <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
                      <div className="h-10 animate-pulse rounded-md bg-muted/70" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <>
            {error ? <div className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
            <form className="space-y-8" onSubmit={handleSubmit}>
              <FormSection title="Account Profile" description="Core identity and access details for this platform user account.">
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {includeUsername ? (
                    <Field label="Username" required>
                      <Input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} required />
                    </Field>
                  ) : (
                    <Field label="Username">
                      <Input value={form.username} disabled />
                    </Field>
                  )}
                  <Field label="Email" required>
                    <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
                  </Field>
                  <Field label="Role" required>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={form.roleId}
                      onChange={(event) => setForm((current) => ({ ...current, roleId: event.target.value }))}
                      required
                    >
                      <option value="" disabled>Select a role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </Field>
                  {!includeUsername ? (
                    <Field label="Status" required>
                      <select
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={form.status}
                        onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Deleted">Deleted</option>
                      </select>
                    </Field>
                  ) : null}
                </div>
              </FormSection>

              {includePassword ? (
                <FormSection title="Credentials" description="Password setup and reset controls for initial provisioning or maintenance.">
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <Field label={passwordOptional ? "New Password" : "Password"} required={!passwordOptional}>
                      <Input
                        type="password"
                        value={form.password}
                        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder={passwordOptional ? "Leave blank to keep current password" : "Minimum 8 characters"}
                      />
                    </Field>
                  </div>
                </FormSection>
              ) : null}

              <div className="flex justify-end gap-3 border-t pt-6">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" className="min-w-36" disabled={submitting}>
                  {submitting ? "Saving..." : submitLabel}
                </Button>
              </div>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-2xl border border-border/70 bg-muted/20 p-6 md:p-7">
      <div className="space-y-1.5 border-b border-border/60 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Section</p>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  required = false,
  children,
  className,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn("grid gap-2.5 text-sm", className)}>
      <span className="font-medium text-foreground/90">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
    </label>
  )
}
