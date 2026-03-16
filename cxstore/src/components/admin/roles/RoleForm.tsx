import { useEffect, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { CreateRoleRequest, RoleDetail, UpdateRoleRequest } from "@/types/admin"

type RoleFormValue = {
  name: string
  description: string
}

type RoleFormProps = {
  title: string
  description: string
  submitLabel: string
  loading?: boolean
  initialValue?: RoleDetail | null
  onSubmit: (value: CreateRoleRequest | UpdateRoleRequest) => Promise<void>
  onCancel: () => void
}

function createEmptyValue(): RoleFormValue {
  return {
    name: "",
    description: "",
  }
}

export function RoleForm({
  title,
  description,
  submitLabel,
  loading = false,
  initialValue,
  onSubmit,
  onCancel,
}: RoleFormProps) {
  const [form, setForm] = useState<RoleFormValue>(initialValue ?? createEmptyValue())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(initialValue ?? createEmptyValue())
  }, [initialValue])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.description.trim()) {
      setError("Role name and description are required.")
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
      })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save role.")
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
          <div className="space-y-5 rounded-2xl border border-border/70 bg-muted/20 p-6 md:p-7">
            <div className="space-y-2 border-b border-border/60 pb-4">
              <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-5 w-40 animate-pulse rounded-full bg-muted/80" />
              <div className="h-4 w-72 animate-pulse rounded-full bg-muted/70" />
            </div>
            <div className="grid gap-5">
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-10 animate-pulse rounded-md bg-muted/70" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-28 animate-pulse rounded-md bg-muted/70" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {error ? <div className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
            <form className="space-y-8" onSubmit={handleSubmit}>
              <FormSection title="Role Profile" description="Core role identity and purpose used by user assignment and permission mapping.">
                <div className="grid gap-5">
                  <Field label="Role Name" required>
                    <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
                  </Field>
                  <Field label="Description" required>
                    <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={5} required />
                  </Field>
                </div>
              </FormSection>

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
