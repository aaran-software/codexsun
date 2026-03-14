import { AdminListPlaceholder } from "@/components/admin/AdminListPlaceholder"

export default function StatesPage() {
  return (
    <AdminListPlaceholder
      pageTitle="State Management"
      pageDescription="Manage reusable state and province masters across the platform."
      addLabel="New State"
      onAddClick={() => undefined}
      message="State administration route is now available through the admin menu and uses the shared list skeleton."
    />
  )
}
