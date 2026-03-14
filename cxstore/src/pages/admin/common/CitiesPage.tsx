import { CommonList } from "@/components/forms/CommonList"
import { CommonUpsertDialog } from "@/components/forms/CommonUpsertDialog"
import { useCommonListState } from "@/components/forms/useCommonListState"

export default function CitiesPage() {
  const commonList = useCommonListState({
    entityLabel: "City",
    searchPlaceholder: "Search cities by name, district, or code",
    fields: [
      { key: "name", label: "City Name", required: true, placeholder: "Enter city name" },
      { key: "district", label: "District", required: true, placeholder: "Enter district" },
      { key: "cityCode", label: "City Code", required: true, placeholder: "Enter city code" },
    ],
    initialItems: [
      { id: 1, name: "Coimbatore", district: "Coimbatore", cityCode: "CBE", isActive: true },
      { id: 2, name: "Chennai", district: "Chennai", cityCode: "MAA", isActive: true },
      { id: 3, name: "Madurai", district: "Madurai", cityCode: "IXM", isActive: false },
    ],
  })

  return (
    <>
      <CommonList
        header={{
          pageTitle: "City Management",
          pageDescription: "Manage platform cities for reusable address and logistics forms.",
          addLabel: commonList.addLabel,
          onAddClick: commonList.openCreateDialog,
        }}
        search={commonList.search}
        filters={commonList.filters}
        table={commonList.table}
        footer={{ content: commonList.footerContent }}
        pagination={commonList.pagination}
      />
      <CommonUpsertDialog
        open={commonList.dialog.open}
        mode={commonList.dialog.mode}
        entityLabel="City"
        fields={[
          { key: "name", label: "City Name", required: true, placeholder: "Enter city name" },
          { key: "district", label: "District", required: true, placeholder: "Enter district" },
          { key: "cityCode", label: "City Code", required: true, placeholder: "Enter city code" },
        ]}
        initialValues={commonList.dialog.initialValues}
        onOpenChange={commonList.dialog.onOpenChange}
        onSubmit={commonList.dialog.onSubmit}
      />
    </>
  )
}
