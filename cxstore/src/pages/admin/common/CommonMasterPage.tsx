import { Navigate, useParams } from "react-router-dom"

import { CommonList } from "@/components/forms/CommonList"
import { CommonUpsertDialog } from "@/components/forms/CommonUpsertDialog"
import { useCommonMasterState } from "@/components/forms/useCommonMasterState"
import { commonMasterDefinitions, type CommonMasterKey } from "@/lib/common-master-registry"

export default function CommonMasterPage() {
  const { masterKey } = useParams<{ masterKey: string }>()

  if (!masterKey || !(masterKey in commonMasterDefinitions)) {
    return <Navigate to="/admin/common/brands" replace />
  }

  const definition = commonMasterDefinitions[masterKey as CommonMasterKey]
  const commonList = useCommonMasterState(definition)

  return (
    <>
      <CommonList
        header={{
          pageTitle: definition.pageTitle,
          pageDescription: definition.pageDescription,
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
        entityLabel={definition.entityLabel}
        fields={commonList.resolvedFields}
        initialValues={commonList.dialog.initialValues}
        onOpenChange={commonList.dialog.onOpenChange}
        onSubmit={commonList.dialog.onSubmit}
        errorMessage={commonList.dialogError}
      />
    </>
  )
}
