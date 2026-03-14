import { CommonMasterListPage } from "@/components/admin/CommonMasterListPage"

export default function UnitsPage() {
  return (
    <CommonMasterListPage
      entityLabel="Unit"
      pageTitle="Unit Management"
      pageDescription="Manage reusable units for catalog, inventory, and order forms."
      searchPlaceholder="Search units by name or short name"
      fields={[
        { key: "name", label: "Unit Name", required: true, placeholder: "Enter unit name" },
        { key: "shortName", label: "Short Name", required: true, placeholder: "Enter short name" },
      ]}
      initialItems={[
        { id: 1, name: "Pieces", shortName: "PCS", isActive: true },
        { id: 2, name: "Meters", shortName: "MTR", isActive: true },
        { id: 3, name: "Kilograms", shortName: "KG", isActive: false },
      ]}
    />
  )
}
