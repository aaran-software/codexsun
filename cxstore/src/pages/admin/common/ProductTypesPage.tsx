import { CommonMasterListPage } from "@/components/admin/CommonMasterListPage"

export default function ProductTypesPage() {
  return (
    <CommonMasterListPage
      entityLabel="Product Type"
      pageTitle="Product Type Management"
      pageDescription="Manage reusable product type masters for product and order workflows."
      searchPlaceholder="Search product types by name or code"
      fields={[
        { key: "name", label: "Product Type", required: true, placeholder: "Enter product type" },
        { key: "typeCode", label: "Type Code", required: true, placeholder: "Enter type code" },
      ]}
      initialItems={[
        { id: 1, name: "Fabric", typeCode: "FAB", isActive: true },
        { id: 2, name: "Accessory", typeCode: "ACC", isActive: true },
        { id: 3, name: "Packaging", typeCode: "PKG", isActive: false },
      ]}
    />
  )
}
