import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { getRoles } from "@/api/roleApi"
import { getUserById, updateUser } from "@/api/userApi"
import { UserForm } from "@/components/admin/users/UserForm"
import type { AdminUserDetail, RoleSummary, UpdateUserRequest } from "@/types/admin"

export default function UserEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("User id is missing.")
      setLoading(false)
      return
    }

    void Promise.all([getRoles(), getUserById(id)])
      .then(([roleItems, userDetail]) => {
        setRoles(roleItems)
        setUser(userDetail)
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load user.")
      })
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="space-y-4">
      {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
      <UserForm
        title="Edit User"
        description="Update role, email, password, and status with the same structured admin form pattern used by other business modules."
        submitLabel="Save User"
        roles={roles}
        loading={loading}
        initialValue={user}
        includePassword
        passwordOptional
        onSubmit={async (request) => {
          if (!id) {
            throw new Error("User id is missing.")
          }

          await updateUser(id, request as UpdateUserRequest)
          navigate("/admin/users", { replace: true })
        }}
        onCancel={() => navigate("/admin/users")}
      />
    </div>
  )
}
