import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getRoleById, updateRole } from "@/api/roleApi"

export default function RoleEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("Role id is missing.")
      setLoading(false)
      return
    }

    void getRoleById(id)
      .then((role) => {
        setName(role.name)
        setDescription(role.description)
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load role.")
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!id) return

    setError(null)
    if (!name.trim() || !description.trim()) {
      setError("Role name and description are required.")
      return
    }

    setSubmitting(true)
    try {
      await updateRole(id, { name, description })
      navigate("/admin/roles", { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update role.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Role</CardTitle>
        <CardDescription>Update the role name and description.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4 py-2">
            <div className="h-10 animate-pulse rounded-md bg-muted/70" />
            <div className="h-10 animate-pulse rounded-md bg-muted/70" />
            <div className="flex gap-2">
              <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ) : (
          <>
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
                <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
                <Button type="button" variant="outline" render={<Link to="/admin/roles" />}>Cancel</Button>
              </div>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
