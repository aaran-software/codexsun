import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createUser } from "@/api/userApi"
import { getRoles } from "@/api/roleApi"
import type { RoleSummary } from "@/types/admin"

const selectClassName = "h-8 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm"

export default function UserCreatePage() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [roleId, setRoleId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void getRoles().then((items) => {
      setRoles(items)
      setRoleId(items[0]?.id ?? "")
    }).catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : "Unable to load roles.")
    })
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!username.trim() || !email.trim() || !roleId || password.length < 8 || !email.includes("@")) {
      setError("Enter a valid username, email, password, and role.")
      return
    }

    setSubmitting(true)
    try {
      await createUser({ username, email, password, roleId })
      navigate("/admin/users", { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create user.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create User</CardTitle>
        <CardDescription>Create a new platform user and assign an initial role.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm">
            <span>Username</span>
            <Input value={username} onChange={(event: ChangeEvent<HTMLInputElement>) => setUsername(event.target.value)} required />
          </label>
          <label className="grid gap-2 text-sm">
            <span>Email</span>
            <Input type="email" value={email} onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)} required />
          </label>
          <label className="grid gap-2 text-sm">
            <span>Password</span>
            <Input type="password" value={password} onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)} required />
          </label>
          <label className="grid gap-2 text-sm">
            <span>Role</span>
            <select className={selectClassName} value={roleId} onChange={(event) => setRoleId(event.target.value)} required>
              <option value="" disabled>Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </label>
          <div className="col-span-full flex gap-2">
            <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create User"}</Button>
            <Button type="button" variant="outline" render={<Link to="/admin/users" />}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
