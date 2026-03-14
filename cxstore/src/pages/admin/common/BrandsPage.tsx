import { CommonMasterListPage } from "@/components/admin/CommonMasterListPage"

export default function BrandsPage() {
  return (
    <CommonMasterListPage
      entityLabel="Brand"
      pageTitle="Brand Management"
      pageDescription="Manage reusable brand masters used by products and orders."
      searchPlaceholder="Search brands by name or code"
      fields={[
        { key: "name", label: "Brand Name", required: true, placeholder: "Enter brand name" },
        { key: "brandCode", label: "Brand Code", required: true, placeholder: "Enter brand code" },
      ]}
      initialItems={[
        { id: 1, name: "Codex Classic", brandCode: "CCL", isActive: true },
        { id: 2, name: "Codex Studio", brandCode: "CST", isActive: true },
        { id: 3, name: "Archive Line", brandCode: "ARC", isActive: false },
      ]}
    />
  )
}
