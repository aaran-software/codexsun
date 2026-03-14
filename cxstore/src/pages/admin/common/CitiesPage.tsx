import { AdminListPlaceholder } from "@/components/admin/AdminListPlaceholder"

export default function CitiesPage() {
  return (
    <AdminListPlaceholder
      pageTitle="City Management"
      pageDescription="Manage platform cities for reusable address and logistics forms."
      addLabel="New City"
      onAddClick={() => undefined}
      message="City list integration will connect to the Common master-data APIs next. The shared list skeleton is ready for that data source."
    />
  )
}
