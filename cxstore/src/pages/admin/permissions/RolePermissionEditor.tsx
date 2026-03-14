import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPermissions, getRoleById, getRolePermissions, updateRolePermissions } from "@/api/roleApi"
import type { PermissionItem } from "@/types/admin"

export default function RolePermissionEditor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [roleName, setRoleName] = useState("")
  const [permissions, setPermissions] = useState<PermissionItem[]>([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("Role id is missing.")
      setLoading(false)
      return
    }

    void Promise.all([getRoleById(id), getPermissions(), getRolePermissions(id)])
      .then(([role, availablePermissions, rolePermissionIds]) => {
        setRoleName(role.name)
        setPermissions(availablePermissions)
        setSelectedPermissionIds(rolePermissionIds)
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load role permissions.")
      })
      .finally(() => setLoading(false))
  }, [id])

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, PermissionItem[]>>((groups, permission) => {
      const groupName = permission.code.split(".")[0] ?? "General"
      groups[groupName] = [...(groups[groupName] ?? []), permission]
      return groups
    }, {})
  }, [permissions])

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((item) => item !== permissionId)
        : [...current, permissionId]
    )
  }

  const handleSave = async () => {
    if (!id) return

    setSubmitting(true)
    setError(null)
    try {
      await updateRolePermissions(id, selectedPermissionIds)
      navigate("/admin/roles", { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update permissions.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions</CardTitle>
        <CardDescription>Configure which permissions belong to the <span className="font-medium text-foreground">{roleName || "selected"}</span> role.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading permissions...</div>
        ) : (
          <>
            {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(groupedPermissions).map(([group, groupPermissions]) => (
                <div key={group} className="rounded-xl border border-border p-4">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">{group}</h3>
                  <div className="grid gap-2">
                    {groupPermissions.map((permission) => (
                      <label key={permission.id} className="flex items-start gap-3 rounded-lg px-2 py-1 text-sm">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={selectedPermissionIds.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                        />
                        <span>
                          <span className="block font-medium text-foreground">{permission.code}</span>
                          <span className="text-muted-foreground">{permission.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={() => void handleSave()} disabled={submitting}>
                {submitting ? "Saving..." : "Save Permissions"}
              </Button>
              <Button type="button" variant="outline" render={<Link to="/admin/roles" />}>Cancel</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
