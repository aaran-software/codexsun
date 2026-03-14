import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminTable } from "@/components/table/AdminTable"
import { deleteUser, getUsers, restoreUser } from "@/api/userApi"
import type { AdminUserSummary } from "@/types/admin"

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      setUsers(await getUsers())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load users.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const handleDelete = async (id: string) => {
    setError(null)
    setMessage(null)
    try {
      await deleteUser(id)
      setMessage("User deleted successfully.")
      await loadUsers()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to delete user.")
    }
  }

  const handleRestore = async (id: string) => {
    setError(null)
    setMessage(null)
    try {
      await restoreUser(id)
      setMessage("User restored successfully.")
      await loadUsers()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to restore user.")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage platform users, roles, and soft deletion state.</CardDescription>
        </div>
        <Button render={<Link to="/admin/users/create" />}>Create User</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {message ? <div className="rounded-lg bg-secondary px-3 py-2 text-sm">{message}</div> : null}
        {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading users...</div>
        ) : (
          <AdminTable
            items={users}
            emptyMessage="No users found."
            columns={[
              { header: "Username", render: (user) => <span className="font-medium text-foreground">{user.username}</span> },
              { header: "Email", render: (user) => user.email },
              { header: "Role", render: (user) => user.role },
              { header: "Status", render: (user) => `${user.status}${user.isDeleted ? " (Deleted)" : ""}` },
              { header: "Created", render: (user) => new Date(user.createdAt).toLocaleDateString() },
              {
                header: "Actions",
                className: "min-w-52",
                render: (user) => (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" render={<Link to={`/admin/users/edit/${user.id}`} />}>
                      Edit
                    </Button>
                    {user.isDeleted ? (
                      <Button size="sm" onClick={() => void handleRestore(user.id)}>
                        Restore
                      </Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => void handleDelete(user.id)}>
                        Delete
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  )
}
