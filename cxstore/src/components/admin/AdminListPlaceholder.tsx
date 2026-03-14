import { ListCommon } from "@/components/admin/ListCommon"

type AdminListPlaceholderProps = {
  pageTitle: string
  pageDescription: string
  addLabel?: string
  onAddClick?: () => void
  message: string
}

export function AdminListPlaceholder({
  pageTitle,
  pageDescription,
  addLabel,
  onAddClick,
  message,
}: AdminListPlaceholderProps) {
  return (
    <ListCommon
      header={{
        pageTitle,
        pageDescription,
        addLabel,
        onAddClick,
      }}
      table={{
        columns: [
          {
            id: "status",
            header: "Status",
            cell: () => message,
          },
        ],
        data: [],
        emptyMessage: message,
      }}
      footer={{
        content: (
          <span>
            Total records: <span className="font-medium text-foreground">0</span>
          </span>
        ),
      }}
      pagination={{
        currentPage: 1,
        pageSize: 10,
        totalRecords: 0,
        onPageChange: () => undefined,
        onPageSizeChange: () => undefined,
        pageSizeOptions: [10],
      }}
    />
  )
}
