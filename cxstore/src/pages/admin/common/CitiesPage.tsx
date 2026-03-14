import { CommonMasterListPage } from "@/components/admin/CommonMasterListPage"

export default function CitiesPage() {
  return (
    <CommonMasterListPage
      entityLabel="City"
      pageTitle="City Management"
      pageDescription="Manage platform cities for reusable address and logistics forms."
      searchPlaceholder="Search cities by name, district, or code"
      fields={[
        { key: "name", label: "City Name", required: true, placeholder: "Enter city name" },
        { key: "district", label: "District", required: true, placeholder: "Enter district" },
        { key: "cityCode", label: "City Code", required: true, placeholder: "Enter city code" },
      ]}
      initialItems={[
        { id: 1, name: "Coimbatore", district: "Coimbatore", cityCode: "CBE", isActive: true },
        { id: 2, name: "Chennai", district: "Chennai", cityCode: "MAA", isActive: true },
        { id: 3, name: "Madurai", district: "Madurai", cityCode: "IXM", isActive: false },
      ]}
    />
  )
}
