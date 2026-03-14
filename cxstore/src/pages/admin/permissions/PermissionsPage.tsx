import { useNavigate } from "react-router-dom"

import { AdminListPlaceholder } from "@/components/admin/AdminListPlaceholder"

export default function PermissionsPage() {
  const navigate = useNavigate()

  return (
    <AdminListPlaceholder
      pageTitle="Permission Management"
      pageDescription="Review platform permissions and manage role-based assignments."
      addLabel="View Roles"
      onAddClick={() => navigate("/admin/roles")}
      message="Permissions are assigned from the Roles screen. This route now uses the shared list skeleton for future permission catalog views."
    />
  )
}
