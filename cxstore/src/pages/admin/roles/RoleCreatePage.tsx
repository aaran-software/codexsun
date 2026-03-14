import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createRole } from "@/api/roleApi"

export default function RoleCreatePage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!name.trim() || !description.trim()) {
      setError("Role name and description are required.")
      return
    }

    setSubmitting(true)
    try {
      await createRole({ name, description })
      navigate("/admin/roles", { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create role.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Role</CardTitle>
        <CardDescription>Create a new role for platform access management.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm">
            <span>Role Name</span>
            <Input value={name} onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} required />
          </label>
          <label className="grid gap-2 text-sm">
            <span>Description</span>
            <Input value={description} onChange={(event: ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)} required />
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Role"}</Button>
            <Button type="button" variant="outline" render={<Link to="/admin/roles" />}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
