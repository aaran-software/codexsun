import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getRoles } from "@/api/roleApi"
import { getUserById, updateUser } from "@/api/userApi"
import type { RoleSummary } from "@/types/admin"

const selectClassName = "h-8 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm"

export default function UserEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [roleId, setRoleId] = useState("")
  const [status, setStatus] = useState("Active")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("User id is missing.")
      setLoading(false)
      return
    }

    void Promise.all([getRoles(), getUserById(id)])
      .then(([roleItems, user]) => {
        setRoles(roleItems)
        setUsername(user.username)
        setEmail(user.email)
        setRoleId(user.roleId)
        setStatus(user.status)
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load user.")
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!id) return

    setError(null)
    if (!email.trim() || !email.includes("@") || !roleId || (password.length > 0 && password.length < 8)) {
      setError("Enter a valid email, role, and password.")
      return
    }

    setSubmitting(true)
    try {
      await updateUser(id, { email, roleId, password: password || undefined, status })
      navigate("/admin/users", { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update user.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit User</CardTitle>
        <CardDescription>Update role, email, password, and status for an existing user.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="grid gap-4 py-2 md:grid-cols-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-10 animate-pulse rounded-md bg-muted/70" />
              </div>
            ))}
            <div className="col-span-full flex gap-2">
              <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ) : (
          <>
            {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm">
                <span>Username</span>
                <Input value={username} disabled />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Email</span>
                <Input type="email" value={email} onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)} required />
              </label>
              <label className="grid gap-2 text-sm">
                <span>New Password</span>
                <Input type="password" value={password} onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)} placeholder="Leave blank to keep current password" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Role</span>
                <select className={selectClassName} value={roleId} onChange={(event) => setRoleId(event.target.value)} required>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                <span>Status</span>
                <select className={selectClassName} value={status} onChange={(event) => setStatus(event.target.value)} required>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Deleted">Deleted</option>
                </select>
              </label>
              <div className="col-span-full flex gap-2">
                <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
                <Button type="button" variant="outline" render={<Link to="/admin/users" />}>Cancel</Button>
              </div>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
