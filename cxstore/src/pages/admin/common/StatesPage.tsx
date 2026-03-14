import { CommonList } from "@/components/forms/CommonList"
import { CommonUpsertDialog } from "@/components/forms/CommonUpsertDialog"
import { useCommonListState } from "@/components/forms/useCommonListState"

export default function StatesPage() {
  const fields = [
    { key: "name", label: "State Name", required: true, placeholder: "Enter state name" },
    { key: "stateCode", label: "State Code", required: true, placeholder: "Enter state code" },
  ] as const

  const commonList = useCommonListState({
    entityLabel: "State",
    searchPlaceholder: "Search states by name or state code",
    fields: [...fields],
    initialItems: [
      { id: 1, name: "Tamil Nadu", stateCode: "TN", isActive: true },
      { id: 2, name: "Karnataka", stateCode: "KA", isActive: true },
      { id: 3, name: "Kerala", stateCode: "KL", isActive: false },
    ],
  })

  return (
    <>
      <CommonList
        header={{
          pageTitle: "State Management",
          pageDescription: "Manage reusable state and province masters across the platform.",
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
        entityLabel="State"
        fields={[...fields]}
        initialValues={commonList.dialog.initialValues}
        onOpenChange={commonList.dialog.onOpenChange}
        onSubmit={commonList.dialog.onSubmit}
      />
    </>
  )
}
