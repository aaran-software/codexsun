import { AdminListPlaceholder } from "@/components/admin/AdminListPlaceholder"

export default function ProductTypesPage() {
  return (
    <AdminListPlaceholder
      pageTitle="Product Type Management"
      pageDescription="Manage reusable product type masters for product and order workflows."
      addLabel="New Product Type"
      onAddClick={() => undefined}
      message="Product type list data can plug into this skeleton without changing the page structure or route."
    />
  )
}
