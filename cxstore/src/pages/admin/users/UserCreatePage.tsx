import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { getRoles } from "@/api/roleApi"
import { createUser } from "@/api/userApi"
import { UserForm } from "@/components/admin/users/UserForm"
import type { CreateUserRequest, RoleSummary } from "@/types/admin"

export default function UserCreatePage() {
  const navigate = useNavigate()
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
    <div className="space-y-4">
      {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
      <UserForm
        title="Create User"
        description="Provision a new platform user with the same structured upsert tone used across the main admin modules."
        submitLabel="Create User"
        roles={roles}
        loading={loading}
        includeUsername
        includePassword
        onSubmit={async (request) => {
          await createUser(request as CreateUserRequest)
          navigate("/admin/users", { replace: true })
        }}
        onCancel={() => navigate("/admin/users")}
      />
    </div>
  )
}
