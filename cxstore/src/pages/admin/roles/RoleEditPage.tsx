import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { getRoleById, updateRole } from "@/api/roleApi"
import { RoleForm } from "@/components/admin/roles/RoleForm"
import type { RoleDetail, UpdateRoleRequest } from "@/types/admin"

export default function RoleEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [role, setRole] = useState<RoleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("Role id is missing.")
      setLoading(false)
      return
    }

    void getRoleById(id)
      .then(setRole)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load role.")
      })
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="space-y-4">
      {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
      <RoleForm
        title="Edit Role"
        description="Update the role identity and purpose using the same structured form tone as the other admin upsert pages."
        submitLabel="Save Role"
        loading={loading}
        initialValue={role}
        onSubmit={async (request) => {
          if (!id) {
            throw new Error("Role id is missing.")
          }

          await updateRole(id, request as UpdateRoleRequest)
          navigate("/admin/roles", { replace: true })
        }}
        onCancel={() => navigate("/admin/roles")}
      />
    </div>
  )
}
