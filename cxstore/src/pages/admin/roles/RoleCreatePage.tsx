import { useNavigate } from "react-router-dom"

import { createRole } from "@/api/roleApi"
import { RoleForm } from "@/components/admin/roles/RoleForm"
import type { CreateRoleRequest } from "@/types/admin"

export default function RoleCreatePage() {
  const navigate = useNavigate()

  return (
    <RoleForm
      title="Create Role"
      description="Define a new access role using the same structured upsert pattern as the main admin modules."
      submitLabel="Create Role"
      onSubmit={async (request) => {
        await createRole(request as CreateRoleRequest)
        navigate("/admin/roles", { replace: true })
      }}
      onCancel={() => navigate("/admin/roles")}
    />
  )
}
