import { AdminListPlaceholder } from "@/components/admin/AdminListPlaceholder"

export default function BrandsPage() {
  return (
    <AdminListPlaceholder
      pageTitle="Brand Management"
      pageDescription="Manage reusable brand masters used by products and orders."
      addLabel="New Brand"
      onAddClick={() => undefined}
      message="Brand administration now has a standard list skeleton for future API integration."
    />
  )
}
