import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminTable } from "@/components/table/AdminTable"
import { getRoles } from "@/api/roleApi"
import type { RoleSummary } from "@/types/admin"

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void getRoles()
      .then(setRoles)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load roles.")
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Create roles and assign permission sets to them.</CardDescription>
        </div>
        <Button render={<Link to="/admin/roles/create" />}>Create Role</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading roles...</div>
        ) : (
          <AdminTable
            items={roles}
            emptyMessage="No roles found."
            columns={[
              { header: "Role", render: (role) => <span className="font-medium text-foreground">{role.name}</span> },
              { header: "Description", render: (role) => role.description },
              { header: "Users", render: (role) => role.userCount.toString() },
              {
                header: "Actions",
                className: "min-w-52",
                render: (role) => (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" render={<Link to={`/admin/roles/edit/${role.id}`} />}>Edit</Button>
                    <Button size="sm" render={<Link to={`/admin/roles/${role.id}/permissions`} />}>Permissions</Button>
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
