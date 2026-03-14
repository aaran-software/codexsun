import type { ReactNode } from "react"

import type {
  CommonUpsertFieldDefinition,
  CommonUpsertFormValues,
  CommonUpsertSelectOption,
} from "@/components/forms/CommonUpsertDialog"
import type { CommonMasterItem } from "@/types/common"

export type CommonMasterFieldDefinition = CommonUpsertFieldDefinition & {
  loadOptions?: () => Promise<CommonUpsertSelectOption[]>
}

export type CommonMasterTableColumn = {
  id: string
  header: string
  accessor: (item: CommonMasterItem) => string | number | boolean | Date | null | undefined
  cell?: (item: CommonMasterItem) => ReactNode
  className?: string
  headerClassName?: string
  sticky?: "left" | "right"
}

export type CommonMasterApi = {
  list: () => Promise<CommonMasterItem[]>
  getById: (id: number) => Promise<CommonMasterItem | null>
  create: (request: unknown) => Promise<CommonMasterItem>
  update: (id: number, request: unknown) => Promise<CommonMasterItem>
  delete: (id: number) => Promise<void>
  restore: (id: number) => Promise<void>
}

export type CommonMasterDefinition = {
  slug: string
  menuTitle: string
  pageTitle: string
  pageDescription: string
  entityLabel: string
  searchPlaceholder: string
  fields: CommonMasterFieldDefinition[]
  columns: CommonMasterTableColumn[]
  api: CommonMasterApi
  toRequest: (values: CommonUpsertFormValues) => unknown
  toFormValues?: (item: CommonMasterItem) => CommonUpsertFormValues
}
