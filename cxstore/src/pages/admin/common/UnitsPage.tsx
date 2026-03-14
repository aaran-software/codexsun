import { CommonList } from "@/components/forms/CommonList"
import { CommonUpsertDialog } from "@/components/forms/CommonUpsertDialog"
import { useCommonListState } from "@/components/forms/useCommonListState"

export default function UnitsPage() {
  const fields = [
    { key: "name", label: "Unit Name", required: true, placeholder: "Enter unit name" },
    { key: "shortName", label: "Short Name", required: true, placeholder: "Enter short name" },
  ] as const

  const commonList = useCommonListState({
    entityLabel: "Unit",
    searchPlaceholder: "Search units by name or short name",
    fields: [...fields],
    initialItems: [
      { id: 1, name: "Pieces", shortName: "PCS", isActive: true },
      { id: 2, name: "Meters", shortName: "MTR", isActive: true },
      { id: 3, name: "Kilograms", shortName: "KG", isActive: false },
    ],
  })

  return (
    <>
      <CommonList
        header={{
          pageTitle: "Unit Management",
          pageDescription: "Manage reusable units for catalog, inventory, and order forms.",
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
        entityLabel="Unit"
        fields={[...fields]}
        initialValues={commonList.dialog.initialValues}
        onOpenChange={commonList.dialog.onOpenChange}
        onSubmit={commonList.dialog.onSubmit}
      />
    </>
  )
}
