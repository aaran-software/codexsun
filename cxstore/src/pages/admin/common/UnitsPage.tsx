import { AdminListPlaceholder } from "@/components/admin/AdminListPlaceholder"

export default function UnitsPage() {
  return (
    <AdminListPlaceholder
      pageTitle="Unit Management"
      pageDescription="Manage reusable units for catalog, inventory, and order forms."
      addLabel="New Unit"
      onAddClick={() => undefined}
      message="Units routing now uses the shared list skeleton and is ready for API-backed content."
    />
  )
}
