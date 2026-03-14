import { CommonMasterListPage } from "@/components/admin/CommonMasterListPage"

export default function StatesPage() {
  return (
    <CommonMasterListPage
      entityLabel="State"
      pageTitle="State Management"
      pageDescription="Manage reusable state and province masters across the platform."
      searchPlaceholder="Search states by name or state code"
      fields={[
        { key: "name", label: "State Name", required: true, placeholder: "Enter state name" },
        { key: "stateCode", label: "State Code", required: true, placeholder: "Enter state code" },
      ]}
      initialItems={[
        { id: 1, name: "Tamil Nadu", stateCode: "TN", isActive: true },
        { id: 2, name: "Karnataka", stateCode: "KA", isActive: true },
        { id: 3, name: "Kerala", stateCode: "KL", isActive: false },
      ]}
    />
  )
}
