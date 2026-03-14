import { CommonList } from "@/components/forms/CommonList"
import { CommonUpsertDialog } from "@/components/forms/CommonUpsertDialog"
import { useCommonListState } from "@/components/forms/useCommonListState"

export default function BrandsPage() {
  const fields = [
    { key: "name", label: "Brand Name", required: true, placeholder: "Enter brand name" },
    { key: "brandCode", label: "Brand Code", required: true, placeholder: "Enter brand code" },
  ] as const

  const commonList = useCommonListState({
    entityLabel: "Brand",
    searchPlaceholder: "Search brands by name or code",
    fields: [...fields],
    initialItems: [
      { id: 1, name: "Codex Classic", brandCode: "CCL", isActive: true },
      { id: 2, name: "Codex Studio", brandCode: "CST", isActive: true },
      { id: 3, name: "Archive Line", brandCode: "ARC", isActive: false },
    ],
  })

  return (
    <>
      <CommonList
        header={{
          pageTitle: "Brand Management",
          pageDescription: "Manage reusable brand masters used by products and orders.",
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
        entityLabel="Brand"
        fields={[...fields]}
        initialValues={commonList.dialog.initialValues}
        onOpenChange={commonList.dialog.onOpenChange}
        onSubmit={commonList.dialog.onSubmit}
      />
    </>
  )
}
