import { CommonList } from "@/components/forms/CommonList"
import { CommonUpsertDialog } from "@/components/forms/CommonUpsertDialog"
import { useCommonListState } from "@/components/forms/useCommonListState"

export default function ProductTypesPage() {
  const fields = [
    { key: "name", label: "Product Type", required: true, placeholder: "Enter product type" },
    { key: "typeCode", label: "Type Code", required: true, placeholder: "Enter type code" },
  ] as const

  const commonList = useCommonListState({
    entityLabel: "Product Type",
    searchPlaceholder: "Search product types by name or code",
    fields: [...fields],
    initialItems: [
      { id: 1, name: "Fabric", typeCode: "FAB", isActive: true },
      { id: 2, name: "Accessory", typeCode: "ACC", isActive: true },
      { id: 3, name: "Packaging", typeCode: "PKG", isActive: false },
    ],
  })

  return (
    <>
      <CommonList
        header={{
          pageTitle: "Product Type Management",
          pageDescription: "Manage reusable product type masters for product and order workflows.",
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
        entityLabel="Product Type"
        fields={[...fields]}
        initialValues={commonList.dialog.initialValues}
        onOpenChange={commonList.dialog.onOpenChange}
        onSubmit={commonList.dialog.onSubmit}
      />
    </>
  )
}
